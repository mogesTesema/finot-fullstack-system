import uuid
import logging
from rest_framework import viewsets, mixins, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Payment, StudentDonation, NonStudentDonation
from .serializers import InitiateDonationSerializer, DonationHistorySerializer
from .utils import ChapaPayment
from .signals import payment_completed, payment_failed
from django.db import transaction
from decouple import config
from django.conf import settings
import hmac
import hashlib
import json

logger = logging.getLogger(__name__)

RETURN_URL = settings.RETURN_URL
CALLBACK_URL = settings.CALLBACK_URL


class InitiateDonationView(generics.GenericAPIView):
    """
    Public View to start a donation.
    Handles both Student (Auth) and Guest (Anon) donations.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = InitiateDonationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # 1. Extract Validated Data
            amount = serializer.validated_data["amount"]
            fund_category = serializer.validated_data["fund_category"]

            # Determine User Details
            if request.user.is_authenticated:
                user = request.user
                email = user.email
                first_name = user.first_name
                last_name = user.last_name
            else:
                email = serializer.validated_data["email"]
                first_name = serializer.validated_data["first_name"]
                last_name = serializer.validated_data["last_name"]

            # 2. Database Operations (Atomic to ensure consistency)
            tx_ref = f"tx-{uuid.uuid4()}"

            try:
                with transaction.atomic():
                    # Create Payment Record (Pending)
                    payment = Payment.objects.create(
                        amount=amount,
                        currency="ETB",
                        transaction_reference=tx_ref,
                        status=Payment.STATUS_PENDING,
                    )

                    # Create Donation Record (Linked to Payment)
                    if request.user.is_authenticated:
                        StudentDonation.objects.create(
                            student=request.user,
                            fund_category=fund_category,
                            payment=payment,
                        )
                    else:
                        NonStudentDonation.objects.create(
                            first_name=first_name,
                            last_name=last_name,
                            email=email,
                            fund_category=fund_category,
                            payment=payment,
                        )
            except Exception:
                logger.error("Failed to create donation record.", exc_info=True)
                return Response(
                    {"error": "Failed to create donation record."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # 3. Call Chapa API
            chapa = ChapaPayment()

            # Construct a return URL (frontend success page)
            # You should configure this base URL in settings
            return_url_with_ref = f"{RETURN_URL}?tx_ref={tx_ref}"

            try:
                checkout_url = chapa.initiate_payment(
                    amount=amount,
                    currency="ETB",
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    tx_ref=tx_ref,
                    return_url=return_url_with_ref,
                    callback_url=CALLBACK_URL,
                )
                return Response(
                    {"checkout_url": checkout_url, "tx_ref": tx_ref},
                    status=status.HTTP_201_CREATED,
                )

            except Exception:
                logger.error(
                    "Chapa payment initiation failed for tx_ref=%s",
                    tx_ref,
                    exc_info=True,
                )

                payment.status = Payment.STATUS_FAILED
                payment.save()

                # Fire domain signal — all channels (email, push, in-app) handle it.
                payment_failed.send(sender=Payment, payment=payment)

                return Response(
                    {
                        "error": "Payment gateway is currently unavailable. Please try again."
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        logger.warning("Donation serializer validation failed: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyDonationView(APIView):
    """
    Verify transaction status with Chapa.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, tx_ref):
        # Helper to construct full receipt response
        def get_receipt_response(payment, status_msg):
            donor_name = "Guest Visitor"
            if hasattr(payment, "student_donation") and payment.student_donation:
                donor_name = (
                    payment.student_donation.student.get_full_name()
                    or payment.student_donation.student.email
                )
            elif hasattr(payment, "guest_donation") and payment.guest_donation:
                donor_name = f"{payment.guest_donation.first_name} {payment.guest_donation.last_name}"

            return Response(
                {
                    "status": status_msg,
                    "amount": payment.amount,
                    "currency": payment.currency,
                    "tx_ref": payment.transaction_reference,
                    "date": payment.created_at,
                    "donor_name": donor_name,
                }
            )

        # Step 1: Fast path — read payment WITHOUT a lock.
        # This avoids holding a DB lock during the slow Chapa network call below.
        try:
            payment = Payment.objects.get(transaction_reference=tx_ref)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # If already completed, return the receipt immediately (idempotent, no lock needed).
        # Step 1: Fast path — read payment WITHOUT a lock.
        # This avoids holding a DB lock during the slow Chapa network call below.
        try:
            payment = Payment.objects.get(transaction_reference=tx_ref)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # If already completed, return the receipt immediately (idempotent, no lock needed).
        if payment.status == Payment.STATUS_COMPLETED:
            return get_receipt_response(payment, "Payment already verified")

        # Step 2: Call Chapa API with NO database lock held.
        # Network I/O must never be performed while holding a select_for_update() lock,
        # as it blocks other requests from the same payment row for the entire round-trip.
        # Step 2: Call Chapa API with NO database lock held.
        # Network I/O must never be performed while holding a select_for_update() lock,
        # as it blocks other requests from the same payment row for the entire round-trip.
        chapa = ChapaPayment()
        is_paid = chapa.verify_payment(tx_ref)

        # Step 3: Re-acquire a row-level lock and update status atomically.
        # Using a flag to track whether we actually changed the status,
        # so that notifications are only sent on the first status transition.
        status_changed = False
        with transaction.atomic():
            try:
                payment = Payment.objects.select_for_update().get(
                    transaction_reference=tx_ref
                )
            except Payment.DoesNotExist:
                return Response(
                    {"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
                )

            if is_paid:
                # Only update if not already completed (idempotency guard)
                if payment.status != Payment.STATUS_COMPLETED:
                    payment.status = Payment.STATUS_COMPLETED
                    payment.save()
                    status_changed = True
            else:
                # Only mark as failed once — do not override a final state
                if payment.status == Payment.STATUS_PENDING:
                    payment.status = Payment.STATUS_FAILED
                    payment.save()
                    status_changed = True

        # Step 4: Fire domain signals AFTER the transaction is committed.
        # Only fires on the first status transition, never on repeat polls.
        if is_paid:
            if status_changed:
                payment_completed.send(sender=Payment, payment=payment)
            return get_receipt_response(payment, "Payment Successful")
        else:
            if status_changed:
                payment_failed.send(sender=Payment, payment=payment)
            return Response(
                {
                    "status": "Payment Verification Failed",
                    "detail": "Transaction not found or pending",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class ChapaWebhookView(APIView):
    """
    Asynchronous Webhook listener for Chapa payment events.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        chapa_signature = request.headers.get("x-chapa-signature")
        if not chapa_signature:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Retrieve the secret
        secret = config(
            "CHAPA_WEBHOOK_SECRET", default=config("CHAPA_SECRET_KEY", default="")
        )

        # We need the raw body to compute the HMAC
        body = request.body
        hash_val = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()

        # Use hmac.compare_digest() for timing-safe comparison.
        # A plain != comparison is vulnerable to timing attacks.
        if not hmac.compare_digest(hash_val, chapa_signature):
            logger.warning("Chapa webhook received with invalid signature.")
        # Use hmac.compare_digest() for timing-safe comparison.
        # A plain != comparison is vulnerable to timing attacks.
        if not hmac.compare_digest(hash_val, chapa_signature):
            logger.warning("Chapa webhook received with invalid signature.")
            return Response(
                {"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Parse JSON
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if (
            payload.get("event") == "charge.success"
            or payload.get("status") == "success"
        ):
            tx_ref = payload.get("tx_ref")
            if tx_ref:
                # Track whether notifications need to fire (outside the lock)
                should_notify = False
                notified_payment = None

                try:
                    # Row-level lock prevents a simultaneous VerifyDonationView
                    # call from processing the same payment concurrently.
                    with transaction.atomic():
                        payment = Payment.objects.select_for_update().get(
                            transaction_reference=tx_ref
                        )
                        if payment.status != Payment.STATUS_COMPLETED:
                            payment.status = Payment.STATUS_COMPLETED
                            payment.save()
                            should_notify = True
                            notified_payment = payment
                except Payment.DoesNotExist:
                    logger.warning(
                        "Chapa webhook: tx_ref=%s not found in database.", tx_ref
                    )

                # Fire domain signal — all channels handle it
                if should_notify and notified_payment:
                    payment_completed.send(sender=Payment, payment=notified_payment)

        return Response(status=status.HTTP_200_OK)


class MyDonationHistoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    """
    Allows students to see their own donation history.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DonationHistorySerializer

    def get_queryset(self):
        # select_related('payment') fetches the related Payment row in the same
        # SQL JOIN, eliminating the N+1 query that DonationHistorySerializer causes.
        return (
            StudentDonation.objects.filter(student=self.request.user)
            .select_related("payment")
            .order_by("-donated_at")
        )
