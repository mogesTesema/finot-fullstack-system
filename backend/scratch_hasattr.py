import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from donation.models import Payment, NonStudentDonation

p = Payment.objects.create(amount=100)
NonStudentDonation.objects.create(first_name="Test", last_name="User", fund_category="1", payment=p)

try:
    has_student = hasattr(p, 'student_donation')
    print("hasattr works, returned:", has_student)
except Exception as e:
    print("hasattr raised:", type(e), e)

p.delete()
