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
    answer_count = serializers.IntegerField(source='answers.count', read_only=True)
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'user', 'display_name', 'category', 'question_body', 'answer_count', 'created_at', 'is_approved', 'answers']
        read_only_fields = ['id', 'user', 'created_at', 'is_approved']

    def get_answers(self, obj):
        # Return only approved answers, ordered by creation date
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
