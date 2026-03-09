from rest_framework import serializers
from .models import Payment, StudentDonation, NonStudentDonation

class InitiateDonationSerializer(serializers.Serializer):
    """
    Serializer for initiating a donation.
    """
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    fund_category = serializers.ChoiceField(choices=StudentDonation.FUND_CHOICES)
    
    # Optional fields for anonymous users
    first_name = serializers.CharField(max_length=100, required=False)
    last_name = serializers.CharField(max_length=100, required=False)
    email = serializers.EmailField(required=False)
    
    def validate(self, data):
        """
        Validate that anonymous users provide name/email.
        LOGIC: If user is not authenticated in request, these fields are required.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            if not data.get('first_name') or not data.get('last_name') or not data.get('email'):
                raise serializers.ValidationError("First name, last name, and email are required for guest donations.")
        return data

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'currency', 'status', 'created_at']

class DonationHistorySerializer(serializers.ModelSerializer):
    """
    Read-only serializer for student donation history.
    """
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = StudentDonation
        fields = ['id', 'fund_category', 'donated_at', 'payment']
