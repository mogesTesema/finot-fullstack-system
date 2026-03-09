import uuid
from rest_framework import viewsets, mixins, status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Payment, StudentDonation, NonStudentDonation
from .serializers import InitiateDonationSerializer, DonationHistorySerializer
from .utils import ChapaPayment
from core.emails import notify_donation_success, notify_donation_failure
from django.db import transaction
from decouple import config
from django.conf import settings


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
            amount = serializer.validated_data['amount']
            fund_category = serializer.validated_data['fund_category']
            
            # Determine User Details
            if request.user.is_authenticated:
                user = request.user
                email = user.email
                first_name = user.first_name
                last_name = user.last_name
            else:
                email = serializer.validated_data['email']
                first_name = serializer.validated_data['first_name']
                last_name = serializer.validated_data['last_name']
            
            # 2. Database Operations (Atomic to ensure consistency)
            tx_ref = f"tx-{uuid.uuid4()}"
            
            try:
                with transaction.atomic():
                    # Create Payment Record (Pending)
                    payment = Payment.objects.create(
                        amount=amount,
                        currency="ETB",
                        transaction_reference=tx_ref,
                        status=Payment.STATUS_PENDING
                    )
                    
                    # Create Donation Record (Linked to Payment)
                    if request.user.is_authenticated:
                        StudentDonation.objects.create(
                            student=request.user,
                            fund_category=fund_category,
                            payment=payment
                        )
                    else:
                        NonStudentDonation.objects.create(
                            first_name=first_name,
                            last_name=last_name,
                            email=email,
                            fund_category=fund_category,
                            payment=payment
                        )
            except Exception as e:
                return Response({"error": "Failed to create donation record."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
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
                    callback_url=CALLBACK_URL
                )
                return Response({"checkout_url": checkout_url, "tx_ref": tx_ref}, status=status.HTTP_201_CREATED)
            
            except Exception as e:
                # If payment gateway fails, we might want to mark the payment as failed 
                # or just leave it pending to be cleaned up later.
                print("CHAPA ERROR:", e)   # 👈 ADD THIS
                payment.status = Payment.STATUS_FAILED
                payment.save()
                
                # Send failure notification for initiation phase failure
                notify_donation_failure(payment)
                
                return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
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
             return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # If already completed, just return success
        if payment.status == Payment.STATUS_COMPLETED:
            return Response({"status": "Payment already verified", "amount": payment.amount})

        chapa = ChapaPayment()
        is_paid = chapa.verify_payment(tx_ref)
        
        if is_paid:
            payment.status = Payment.STATUS_COMPLETED
            payment.save()
            
            # Send success notification
            notify_donation_success(payment)
            
            return Response({"status": "Payment Successful", "amount": payment.amount})
        else:
            # We assume it is failed or cancelled if not paid by the time they are verified here
            if payment.status != Payment.STATUS_FAILED:
                payment.status = Payment.STATUS_FAILED
                payment.save()
                # Send failure notification
                notify_donation_failure(payment)
                
            return Response({"status": "Payment Verification Failed", "detail": "Transaction not found or pending"}, status=status.HTTP_400_BAD_REQUEST)

class MyDonationHistoryViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    """
    Allows students to see their own donation history.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DonationHistorySerializer

    def get_queryset(self):
        return StudentDonation.objects.filter(student=self.request.user).order_by('-donated_at')
