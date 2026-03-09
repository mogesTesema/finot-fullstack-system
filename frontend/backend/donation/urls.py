from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InitiateDonationView, VerifyDonationView, MyDonationHistoryViewSet

router = DefaultRouter()
router.register(r'my-history', MyDonationHistoryViewSet, basename='donation-history')

urlpatterns = [
    # API endpoints
    path('initiate/', InitiateDonationView.as_view(), name='initiate-donation'),
    path('verify/<str:tx_ref>/', VerifyDonationView.as_view(), name='verify-donation'),
    path('', include(router.urls)),
]
