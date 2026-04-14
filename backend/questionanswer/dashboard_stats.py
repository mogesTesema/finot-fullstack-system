"""Dashboard stat providers for the questionanswer app."""
import logging

logger = logging.getLogger(__name__)


def get_qa_stats() -> dict:
    """Return Q&A-related dashboard statistics."""
    from questionanswer.models import Question

    pending_question_count = Question.objects.filter(is_approved=False).count()

    return {
        "pending_questions": pending_question_count,
    }
