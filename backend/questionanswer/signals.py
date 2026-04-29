"""
Domain signals for the questionanswer app.

Follows the same pattern as donation/signals.py — each app
owns its own signals, and the notifications app listens to them.
"""
import django.dispatch

# Fired when a counselor answers a private question.
# Kwargs: answer (the Answer instance)
question_answered = django.dispatch.Signal()
