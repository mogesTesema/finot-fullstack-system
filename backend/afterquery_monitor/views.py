import os
import json
import urllib.request
import urllib.error
from django.http import JsonResponse
from django.core.mail import send_mail

def trigger_afterquery_check(request):
    """
    Stateless endpoint to check AfterQuery API and send an email if tasks are available.
    Designed to be hit by a cron-job.org or UptimeRobot GET request every 5 minutes.
    """
    token = os.environ.get("AFTERQUERY_TOKEN", "")
    target_emails = os.environ.get("AFTERQUERY_NOTIFY_EMAILS", "moges2421@gmail.com")
    
    if not token:
        return JsonResponse({"status": "error", "message": "AFTERQUERY_TOKEN environment variable is not set"}, status=500)
    
    url = "https://experts.afterquery.com/api/projects/rewrite/tasks/available"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    
    try:
        with urllib.request.urlopen(req) as response:
            raw_data = response.read().decode()
            data = json.loads(raw_data)
            
            # Determine if tasks are available. 
            # We check a few common JSON patterns (list length, 'count', or 'data' array)
            tasks_available = False
            
            if isinstance(data, list) and len(data) > 0:
                tasks_available = True
            elif isinstance(data, dict):
                # Safely check different common pagination/response structures
                if data.get("available_tasks", 0) > 0 or data.get("count", 0) > 0:
                    tasks_available = True
                elif "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
                    tasks_available = True
                # Sometimes the API just returns the task objects directly in a dict
                elif data and "error" not in [k.lower() for k in data.keys()]:
                    tasks_available = True
            
            if tasks_available:
                # 1. Send Email
                email_list = [e.strip() for e in target_emails.split(",") if e.strip()]
                send_mail(
                    subject="ALERT: AfterQuery Tasks Available!",
                    message=f"Tasks are currently available on AfterQuery.\n\nAPI Response Snippet:\n{json.dumps(data, indent=2)[:500]}",
                    from_email=None,  # Uses DEFAULT_FROM_EMAIL from your Django settings
                    recipient_list=email_list,
                    fail_silently=True,  # Don't crash the view if SMTP isn't fully configured
                )
                
                # 2. SMS Logic (Requires 3rd Party Provider like Twilio or Vonage)
                # You can implement your SMS provider HTTP request here if needed.
                # Example:
                # sms_url = "https://api.twilio.com/..."
                # urllib.request.urlopen(urllib.request.Request(sms_url, data=...))
            
            return JsonResponse({
                "status": "success",
                "tasks_available": tasks_available,
                "data": data
            })
            
    except urllib.error.HTTPError as e:
        if e.code in [401, 403]:
            # Token expired or invalid
            email_list = [email.strip() for email in target_emails.split(",") if email.strip()]
            send_mail(
                subject="URGENT: AfterQuery Token Expired/Failed!",
                message=f"The AfterQuery API request failed with status {e.code}.\n\nThis means your JWT token has likely expired. Please log into your Render dashboard, update the AFTERQUERY_TOKEN environment variable with a fresh token, and restart the server.\n\nError details: {str(e)}",
                from_email=None,
                recipient_list=email_list,
                fail_silently=True,
            )
        return JsonResponse({"status": "error", "message": f"HTTP Error {e.code}: {str(e)}"}, status=e.code)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
