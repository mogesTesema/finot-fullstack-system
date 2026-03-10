from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer
from django.db.models import Q

class QuestionViewSet(viewsets.ModelViewSet):
    """
    Public Endpoint for Anonymous Questions.
    """
    queryset = Question.objects.all() # Default queryset required by router, but overridden below
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny] # Public Access
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question_body', 'category', 'display_name']
    ordering_fields = ['created_at', 'category', 'user']
    ordering = ['-created_at'] # Default: Recent first

    def get_queryset(self):
        """
        Public sees only APPROVED questions.
        Admin/Author sees their own pending questions in a separate view?
        For the main list, we return APPROVED only to keep the feed clean.
        """
        # Base query: Approved questions
        qs = Question.objects.filter(is_approved=True)

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
        my_questions = Question.objects.filter(user=request.user).order_by('-created_at')
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
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'question__category', 'responder']
    ordering = ['-created_at'] # Recent answers first

    def get_queryset(self):
        """
        Return approved answers.
        Filter by specific question if ?question=ID is provided.
        Can also filter by responder (User ID) or Category (via Question).
        """
        queryset = Answer.objects.filter(is_approved=True)
        
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

