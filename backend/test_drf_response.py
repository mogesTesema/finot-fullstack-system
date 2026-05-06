import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "finot.settings")
django.setup()

from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

def get_bytes(data):
    return len(JSONRenderer().render(data))

print("date required:", get_bytes({"date": ["This field is required."]}))
print("semester_course required:", get_bytes({"semester_course": ["This field is required."]}))
print("invalid uuid format:", get_bytes({"semester_course": ["Invalid UUID format."]}))
print("detail invalid uuid:", get_bytes({"detail": ["Invalid UUID format."]}))
print("detail permission:", get_bytes({"detail": "Permission denied."}))
print("error permission:", get_bytes({"error": "Permission denied."}))

