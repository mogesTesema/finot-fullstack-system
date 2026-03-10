from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import datetime

def send_html_email(subject, recipient_list, template_name=None, context=None, message_body=None):
    """
    Central utility to send HTML emails.
    Can accept either a template_name + context OR a simple message_body string.
    """
    if not isinstance(recipient_list, list):
        recipient_list = [recipient_list]

    if template_name:
        html_message = render_to_string(template_name, context)
        plain_message = strip_tags(html_message)
    else:
        # Fallback for simple string messages
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        logo_url = f"{frontend_url}/images/logo.png"
        current_year = datetime.date.today().year

        html_message = f"""
        <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
                    <!-- Header with Blue background and Logo -->
                    <div style="background-color: #1e3a8a; padding: 25px; text-align: center;">
                        <img src="{logo_url}" alt="Finot Logo" style="height: 60px; object-fit: contain; display: inline-block;">
                    </div>
                    
                    <!-- Main Content Body -->
                    <div style="padding: 30px; color: #374151; line-height: 1.6; font-size: 16px;">
                        <h2 style="color: #1e3a8a; margin-top: 0;">Finot Notification</h2>
                        {message_body}
                    </div>
                    
                    <!-- Footer with Yellow accent -->
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 4px solid #fbbf24;">
                        <p style="font-size: 13px; color: #6b7280; margin: 0;">&copy; {current_year} Finot Platform. All rights reserved.</p>
                        <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        plain_message = message_body

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Failed to send email to {recipient_list}: {e}")
        return False

def notify_new_event(event, recipients):
    """
    Sends an email notification about a new event.
    """
    subject = f"New Event: {event.title}"
    
    # In a real app, use a template like 'emails/new_event.html'
    # For now, we construct a nice message body
    message_body = f"""
    <strong>{event.title}</strong> has been scheduled!<br><br>
    <strong>When:</strong> {event.start_date.strftime('%B %d, %Y at %I:%M %p')}<br>
    <strong>Where:</strong> {event.description[:100]}...<br><br>
    Please login to the platform to see full details.
    """
    
    send_html_email(subject, recipients, message_body=message_body)

def get_donation_details(payment_obj):
    """Helper to extract recipient email, name and category from a Payment object"""
    email = None
    name = None
    category = None
    
    if hasattr(payment_obj, 'student_donation'):
        email = payment_obj.student_donation.student.email
        name = payment_obj.student_donation.student.first_name
        category = payment_obj.student_donation.get_fund_category_display()
    elif hasattr(payment_obj, 'nonstudentdonation'):
        email = payment_obj.nonstudentdonation.email
        name = payment_obj.nonstudentdonation.first_name
        category = payment_obj.nonstudentdonation.get_fund_category_display()
        
    return email, name, category

def notify_donation_success(payment_obj):
    """
    Sends an email notification for a successful donation.
    """
    email, name, category = get_donation_details(payment_obj)
    
    if not email:
        return False
        
    subject = "Thank You for Your Donation - Receipt"
    amount = f"{payment_obj.amount} {payment_obj.currency}"
    tx_ref = payment_obj.transaction_reference
    
    message_body = f"""
    <p style="font-size: 16px;">Dear <strong>{name or 'Supporter'}</strong>,</p>
    <p>We have successfully received your generous donation. Thank you for your support!</p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #166534; margin-top: 0;">Donation Receipt</h3>
        <p style="margin: 5px 0;"><strong>Amount:</strong> <span style="color: #1e3a8a;">{amount}</span></p>
        <p style="margin: 5px 0;"><strong>Category:</strong> {category}</p>
        <p style="margin: 5px 0;"><strong>Transaction Ref:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px;">{tx_ref}</span></p>
    </div>
    
    <p>May God bless you!</p>
    """
    
    return send_html_email(subject, [email], message_body=message_body)

def notify_donation_failure(payment_obj):
    """
    Sends an email notification for a failed donation.
    """
    email, name, category = get_donation_details(payment_obj)
    
    if not email:
        return False
        
    subject = "Action Required: Donation Payment Failed"
    amount = f"{payment_obj.amount} {payment_obj.currency}"
    tx_ref = payment_obj.transaction_reference
    
    message_body = f"""
    <p style="font-size: 16px;">Dear <strong>{name or 'Supporter'}</strong>,</p>
    <p>Unfortunately, your recent attempt to donate has failed or was not completed successfully.</p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: #991b1b; margin-top: 0;">Failed Transaction Details</h3>
        <p style="margin: 5px 0;"><strong>Amount:</strong> <span style="color: #1e3a8a;">{amount}</span></p>
        <p style="margin: 5px 0;"><strong>Category:</strong> {category}</p>
        <p style="margin: 5px 0;"><strong>Transaction Ref:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px;">{tx_ref}</span></p>
    </div>
    
    <p>If you encountered an issue, please try again using a different payment method, or contact our support team.</p>
    <div style="text-align: center; margin-top: 30px;">
        <a href="{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/donation" style="background-color: #fbbf24; color: #1e3a8a; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Try Again</a>
    </div>
    """
    
    return send_html_email(subject, [email], message_body=message_body)
