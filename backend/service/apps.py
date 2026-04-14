from django.apps import AppConfig

class ServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'service'

    def ready(self):
        import service.signals
        from core.dashboard_registry import register_stat_provider
        from service.dashboard_stats import get_service_stats
        register_stat_provider('service', get_service_stats)
