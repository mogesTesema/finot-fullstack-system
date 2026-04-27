# service/signals.py
#
# This file previously contained the event notification handler
# (notify_students_of_new_event). That logic has been moved to
# notifications/handlers.py as part of the notification app decoupling.
#
# The Event post_save signal is now handled by:
#   notifications.handlers.handle_event_published
#
# This file is kept for any future service-specific signals that
# don't involve notifications (e.g., audit logging, analytics).
