import pytest
from model_bakery import baker
from questionanswer.models import Question, Answer

@pytest.mark.django_db
class TestQuestionModel:
    def test_question_default_values(self):
        """
        Test that a question created without specific flags 
        defaults to public visibility and unapproved status.
        """
        # Arrange: baker.make instantly creates a record in the test database
        question = baker.make(Question, display_name="Test User", category=Question.CAT_SPIRITUAL)
        
        # Assert
        assert question.visibility == Question.VISIBILITY_PUBLIC
        assert question.is_approved is False
        assert str(question) == "Test User - Spiritual"

@pytest.mark.django_db
class TestAnswerModel:
    def test_answer_string_representation(self):
        """
        Test that an answer correctly formats its string representation.
        """
        question = baker.make(Question)
        answer = baker.make(Answer, question=question, display_name="Father John")
        
        expected_str = f"Answer to {question.id} by Father John"
        assert str(answer) == expected_str
