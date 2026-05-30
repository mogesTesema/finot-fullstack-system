from django.urls import path
from . import views

urlpatterns = [
    # The obscure URL to prevent bots from triggering your API limits
    path('aq-trigger-7b9f2x/', views.trigger_afterquery_check, name='afterquery-trigger'),
]
