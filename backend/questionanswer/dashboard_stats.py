"""Dashboard stat providers for the questionanswer app."""
import logging

logger = logging.getLogger(__name__)


def get_qa_stats() -> dict:
    """Return Q&A-related dashboard statistics."""
    from questionanswer.models import Question, Answer

    pending_question_count = Question.objects.filter(
        is_approved=False,
        visibility=Question.VISIBILITY_PUBLIC,
    ).count()

    unanswered_private_count = Question.objects.filter(
        visibility=Question.VISIBILITY_PRIVATE,
    ).exclude(answers__isnull=False).count()

    pending_answer_count = Answer.objects.filter(is_approved=False).count()

    return {
        "pending_questions": pending_question_count,
        "unanswered_private_questions": unanswered_private_count,
        "pending_answers": pending_answer_count,
    }
