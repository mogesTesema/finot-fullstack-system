from django.apps import AppConfig


class QuestionanswerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'questionanswer'

    def ready(self):
        from core.dashboard_registry import register_stat_provider
        from questionanswer.dashboard_stats import get_qa_stats
        register_stat_provider('questionanswer', get_qa_stats)
