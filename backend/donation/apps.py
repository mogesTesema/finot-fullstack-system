from django.apps import AppConfig


class DonationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'donation'

    def ready(self):
        from core.dashboard_registry import register_stat_provider
        from donation.dashboard_stats import get_donation_stats
        register_stat_provider('donation', get_donation_stats)
