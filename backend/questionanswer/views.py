from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer
from django.db.models import Q, Count, Prefetch

class IsAdminOrOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated:
            if request.user.is_staff or request.user.roles.filter(name='SuperAdmin').exists():
                return True
            if hasattr(obj, 'user') and obj.user == request.user:
                return True
            if hasattr(obj, 'responder') and obj.responder == request.user:
                return True
        return False

class QuestionViewSet(viewsets.ModelViewSet):
    """
    Public Endpoint for Anonymous Questions.
    """
    queryset = Question.objects.all() # Default queryset required by router, but overridden below
    serializer_class = QuestionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question_body', 'category', 'display_name']
    ordering_fields = ['created_at', 'category', 'user']
    ordering = ['-created_at'] # Default: Recent first

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminOrOwner()]

    def get_queryset(self):
        """
        Public sees only APPROVED questions.
        Uses Prefetch and annotate to eliminate N+1 queries:
          - approved_answers prefetch avoids per-question answer filter calls.
          - answer_count_db annotation avoids per-question .count() calls.
        """
        approved_answers_qs = Answer.objects.filter(is_approved=True).order_by("created_at")

        qs = (
            Question.objects.filter(is_approved=True)
            .prefetch_related(Prefetch("answers", queryset=approved_answers_qs, to_attr="approved_answers_list"))
            .annotate(answer_count_db=Count("answers", filter=Q(answers__is_approved=True)))
        )

        # Filter by Category
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__iexact=category)

        # Filter by specific User (if searching by author ID)
        user_id = self.request.query_params.get('user')
        if user_id:
            qs = qs.filter(user_id=user_id)

        return qs

    @action(detail=False, methods=['GET'], permission_classes=[permissions.IsAuthenticated], url_path='my-contributions')
    def my_contributions(self, request):
        """
        Endpoint: /api/qa/questions/my-contributions/
        Returns BOTH questions and answers submitted by the logged-in user (Approved OR Pending).
        Allows students to track their status.
        """
        # 1. My Questions (All status)
        my_questions = (
            Question.objects.filter(user=request.user)
            .prefetch_related(
                Prefetch(
                    "answers",
                    queryset=Answer.objects.filter(is_approved=True).order_by("created_at"),
                    to_attr="approved_answers_list",
                )
            )
            .annotate(answer_count_db=Count("answers", filter=Q(answers__is_approved=True)))
            .order_by("-created_at")
        )
        q_serializer = self.get_serializer(my_questions, many=True)
        
        # 2. My Answers (All status)
        my_answers = Answer.objects.filter(responder=request.user).order_by('-created_at')
        a_serializer = AnswerSerializer(my_answers, many=True)
        
        return Response({
            "questions": q_serializer.data,
            "answers": a_serializer.data
        })


class AnswerViewSet(viewsets.ModelViewSet):
    """
    Public Endpoint for Answers.
    Usually filtered by ?question={id}
    """
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'question__category', 'responder']
    ordering = ['-created_at'] # Recent answers first

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminOrOwner()]

    def get_queryset(self):
        """
        Return approved answers.
        Filter by specific question if ?question=ID is provided.
        Can also filter by responder (User ID) or Category (via Question).
        """
        # select_related('question') avoids a per-answer query when filtering by category.
        queryset = Answer.objects.filter(is_approved=True).select_related("question")

        # Filter by Question ID
        question_id = self.request.query_params.get('question')
        if question_id:
            queryset = queryset.filter(question_id=question_id)

        # Filter by Responder (User ID)
        responder_id = self.request.query_params.get('responder')
        if responder_id:
             queryset = queryset.filter(responder_id=responder_id)

        # Filter by Category (via Question)
        category = self.request.query_params.get('category')
        if category:
             queryset = queryset.filter(question__category__iexact=category)

        return queryset

