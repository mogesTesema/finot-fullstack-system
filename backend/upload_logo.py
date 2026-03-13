"""
One-time script to upload Finot logo to Cloudinary.
Run from the backend directory with the Django virtualenv activated:
  python upload_logo.py
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env from finot.env
backend_dir = Path(__file__).resolve().parent
load_dotenv(backend_dir / "finot.env")

import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)

logo_path = backend_dir.parent / "Finot-frontend" / "public" / "images" / "logo.png"

if not logo_path.exists():
    print(f"ERROR: Logo not found at {logo_path}")
    sys.exit(1)

print(f"Uploading {logo_path} to Cloudinary...")
result = cloudinary.uploader.upload(
    str(logo_path),
    public_id="finot/logo",
    overwrite=True,
    resource_type="image",
)

url = result.get("secure_url") or result.get("url")
print(f"\n Upload successful!")
print(f"   Cloudinary URL: {url}")
print(f"\n   Add this to your Django settings or .env:")
print(f'   FINOT_LOGO_URL="{url}"')
