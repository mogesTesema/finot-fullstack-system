from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'student'

    def ready(self):
        import student.signals
        from core.dashboard_registry import register_stat_provider
        from student.dashboard_stats import get_student_stats
        register_stat_provider('student', get_student_stats)
