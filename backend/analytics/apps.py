from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analytics'

    def ready(self):
        from core.dashboard_registry import register_stat_provider
        from .dashboard_stats import get_analytics_stats
        
        register_stat_provider("analytics", get_analytics_stats)
