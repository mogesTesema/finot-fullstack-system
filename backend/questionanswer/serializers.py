from rest_framework import serializers
from .models import Question, Answer

class AnswerSerializer(serializers.ModelSerializer):
    """
    Serializer for publicly viewing approved answers.
    Includes responder's display name or username if available.
    """
    class Meta:
        model = Answer
        fields = ['id', 'question', 'responder', 'display_name', 'answer_body', 'created_at', 'is_approved']
        read_only_fields = ['id', 'created_at', 'is_approved', 'responder']

    def create(self, validated_data):
        """
        Handle answer creation with or without user.
        """
        request = self.context.get('request')
        responder = None
        if request and request.user.is_authenticated:
            responder = request.user
            
        return Answer.objects.create(responder=responder, **validated_data)


class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for questions.
    """
    # Uses the annotated count from the view queryset to avoid an extra DB hit.
    # Falls back to a live .count() call if the annotation isn't present
    # (e.g. when accessing a single object via the detail endpoint).
    answer_count = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'user', 'display_name', 'category', 'question_body', 'answer_count', 'created_at', 'is_approved', 'answers']
        read_only_fields = ['id', 'user', 'created_at', 'is_approved']

    def get_answer_count(self, obj):
        # Prefer the pre-computed annotation injected by the view queryset.
        if hasattr(obj, 'answer_count_db'):
            return obj.answer_count_db
        # Safe fallback for detail/admin views where annotation is absent.
        return obj.answers.filter(is_approved=True).count()

    def get_answers(self, obj):
        # Read from the prefetched list to avoid per-question DB queries.
        if hasattr(obj, 'approved_answers_list'):
            return AnswerSerializer(obj.approved_answers_list, many=True).data
        # Safe fallback for detail/admin views where prefetch is absent.
        approved_answers = obj.answers.filter(is_approved=True).order_by('created_at')
        return AnswerSerializer(approved_answers, many=True).data

    def create(self, validated_data):
        """
        Handle question creation with or without user.
        """
        request = self.context.get('request')
        user = None
        if request and request.user.is_authenticated:
            user = request.user
            
        return Question.objects.create(user=user, **validated_data)
