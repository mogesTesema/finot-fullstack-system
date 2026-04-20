import uuid
from rest_framework import viewsets, mixins, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Payment, StudentDonation, NonStudentDonation
from .serializers import InitiateDonationSerializer, DonationHistorySerializer
from .utils import ChapaPayment
from core.emails import notify_donation_success, notify_donation_failure
from core.notifications import send_push_notification
from core.models import Notification
from django.db import transaction
from decouple import config
from django.conf import settings
import hmac
import hashlib
import json


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
            except Exception as e:
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

            except Exception as e:
                # If payment gateway fails, we might want to mark the payment as failed
                # or just leave it pending to be cleaned up later.
                print("CHAPA ERROR:", e)  # 👈 ADD THIS
                payment.status = Payment.STATUS_FAILED
                payment.save()

                # Send failure notification for initiation phase failure
                notify_donation_failure(payment)

                # Push Notification if Authenticated
                if hasattr(payment, "student_donation") and payment.student_donation:
                    send_push_notification(
                        user_id=payment.student_donation.student.id,
                        title="Donation Initiation Failed",
                        body=f"Failed to start donation of {payment.amount} ETB.",
                        notification_type=Notification.TYPE_DONATION,
                    )

                return Response(
                    {"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyDonationView(APIView):
    """
    Verify transaction status with Chapa.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, tx_ref):
        try:
            payment = Payment.objects.get(transaction_reference=tx_ref)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND
            )

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

        # If already completed, return full receipt
        if payment.status == Payment.STATUS_COMPLETED:
            return get_receipt_response(payment, "Payment already verified")

        chapa = ChapaPayment()
        is_paid = chapa.verify_payment(tx_ref)

        if is_paid:
            payment.status = Payment.STATUS_COMPLETED
            payment.save()

            # Send success notification
            notify_donation_success(payment)

            if hasattr(payment, "student_donation") and payment.student_donation:
                send_push_notification(
                    user_id=payment.student_donation.student.id,
                    title="Donation Successful",
                    body=f"We received your donation of {payment.amount} ETB. Thank you!",
                    notification_type=Notification.TYPE_DONATION,
                )

            return get_receipt_response(payment, "Payment Successful")
        else:
            # We assume it is failed or cancelled if not paid by the time they are verified here
            if payment.status != Payment.STATUS_FAILED:
                payment.status = Payment.STATUS_FAILED
                payment.save()
                # Send failure notification
                notify_donation_failure(payment)

                if hasattr(payment, "student_donation") and payment.student_donation:
                    send_push_notification(
                        user_id=payment.student_donation.student.id,
                        title="Donation Failed",
                        body=f"Your donation of {payment.amount} ETB could not be verified.",
                        notification_type=Notification.TYPE_DONATION,
                    )

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

        # We need the raw body
        body = request.body
        hash_val = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()

        if hash_val != chapa_signature:
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
                try:
                    payment = Payment.objects.get(transaction_reference=tx_ref)
                    if payment.status != Payment.STATUS_COMPLETED:
                        payment.status = Payment.STATUS_COMPLETED
                        payment.save()

                        # Send notifications
                        notify_donation_success(payment)

                        if (
                            hasattr(payment, "student_donation")
                            and payment.student_donation
                        ):
                            send_push_notification(
                                user_id=payment.student_donation.student.id,
                                title="Donation Successful",
                                body=f"We received your donation of {payment.amount} ETB. Thank you!",
                                notification_type=Notification.TYPE_DONATION,
                            )
                except Payment.DoesNotExist:
                    pass

        return Response(status=status.HTTP_200_OK)


class MyDonationHistoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    """
    Allows students to see their own donation history.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DonationHistorySerializer

    def get_queryset(self):
        return StudentDonation.objects.filter(student=self.request.user).order_by(
            "-donated_at"
        )
