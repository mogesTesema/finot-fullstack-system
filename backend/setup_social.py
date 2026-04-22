import os
import django

# Set up django environment wrapper
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from dotenv import load_dotenv

# Load env variables
load_dotenv("finot.env")

client_id = os.environ.get("GOOGE_CLIENT_ID")
secret = os.environ.get("GOOGLE_CLIENT_SECRET")

if client_id and secret:
    # Ensure correct Site object exists
    site, _ = Site.objects.get_or_create(id=1, defaults={'domain': 'example.com', 'name': 'example.com'})
    
    # Create or retrieve the social app config
    app, created = SocialApp.objects.get_or_create(
        provider='google',
        defaults={
            'name': 'Google Login',
            'client_id': client_id,
            'secret': secret,
        }
    )
    
    # If app existed prior, update the fields just in case they've changed
    if not created:
        app.client_id = client_id
        app.secret = secret
        app.save()
    
    # Finally, link the app to our site
    app.sites.add(site)
    print("Successfully configured Google SocialApp with keys from finot.env.")
else:
    print("Error: Could not find GOOGE_CLIENT_ID or GOOGLE_CLIENT_SECRET in finot.env")
