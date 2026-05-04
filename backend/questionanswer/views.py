from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count, Prefetch

from .models import Question, Answer
from .serializers import QuestionSerializer, AnswerSerializer, PrivateQuestionSerializer
from .permissions import IsAdminOrOwner, IsQACounselor, IsQAModerator
from .signals import question_answered


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Public Endpoint for Anonymous Questions.

    Public list returns only approved PUBLIC questions.
    Additional endpoints for private inbox, counselor queue, and moderation.
    """

    queryset = (
        Question.objects.all()
    )  # Default queryset required by router, but overridden below
    serializer_class = QuestionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["question_body", "category", "display_name"]
    ordering_fields = ["created_at", "category", "user"]
    ordering = ["-created_at"]  # Default: Recent first

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action == "private_inbox":
            return [permissions.IsAuthenticated()]
        if self.action == "my_contributions":
            return [permissions.IsAuthenticated()]
        if self.action == "counselor_queue":
            return [permissions.IsAuthenticated(), IsQACounselor()]
        if self.action in ["moderation_queue", "approve"]:
            return [permissions.IsAuthenticated(), IsQAModerator()]
        return [permissions.IsAuthenticated(), IsAdminOrOwner()]

    def get_queryset(self):
        """
        Public sees only APPROVED + PUBLIC questions.
        Uses Prefetch and annotate to eliminate N+1 queries:
          - approved_answers prefetch avoids per-question answer filter calls.
          - answer_count_db annotation avoids per-question .count() calls.
        """
        # The approve action needs to fetch unapproved objects to approve them.
        if self.action == "approve":
            return Question.objects.all()

        approved_answers_qs = Answer.objects.filter(is_approved=True).order_by(
            "created_at"
        )

        qs = (
            Question.objects.filter(
                is_approved=True,
                visibility=Question.VISIBILITY_PUBLIC,
            )
            .prefetch_related(
                Prefetch(
                    "answers",
                    queryset=approved_answers_qs,
                    to_attr="approved_answers_list",
                )
            )
            .annotate(
                answer_count_db=Count("answers", filter=Q(answers__is_approved=True))
            )
        )

        # Filter by Category
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category__iexact=category)

        # Filter by specific User (if searching by author ID)
        user_id = self.request.query_params.get("user")
        if user_id:
            qs = qs.filter(user_id=user_id)

        return qs

    @action(
        detail=False,
        methods=["GET"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="my-contributions",
    )
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
                    queryset=Answer.objects.filter(is_approved=True).order_by(
                        "created_at"
                    ),
                    to_attr="approved_answers_list",
                )
            )
            .annotate(
                answer_count_db=Count("answers", filter=Q(answers__is_approved=True))
            )
            .order_by("-created_at")
        )
        q_serializer = self.get_serializer(my_questions, many=True)

        # 2. My Answers (All status)
        my_answers = Answer.objects.filter(responder=request.user).order_by(
            "-created_at"
        )
        a_serializer = AnswerSerializer(my_answers, many=True)

        return Response({"questions": q_serializer.data, "answers": a_serializer.data})

    @action(detail=False, methods=["GET"], url_path="private-inbox")
    def private_inbox(self, request):
        """
        Endpoint: /api/qa/questions/private-inbox/
        Returns the logged-in user's own private questions with counselor answers.
        This is how a student checks if their private question was answered.
        """
        my_private_questions = (
            Question.objects.filter(
                user=request.user,
                visibility=Question.VISIBILITY_PRIVATE,
            )
            .prefetch_related(
                Prefetch(
                    "answers",
                    queryset=Answer.objects.all().order_by("created_at"),
                    to_attr="approved_answers_list",
                )
            )
            .annotate(answer_count_db=Count("answers"))
            .order_by("-created_at")
        )
        serializer = self.get_serializer(my_private_questions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_path="counselor-queue")
    def counselor_queue(self, request):
        """
        Endpoint: /api/qa/questions/counselor-queue/
        Returns ALL private questions for the counselor, unanswered first.
        Permission: IsAuthenticated + IsQACounselor
        """
        private_questions = (
            Question.objects.filter(visibility=Question.VISIBILITY_PRIVATE)
            .prefetch_related(
                Prefetch(
                    "answers",
                    queryset=Answer.objects.all().order_by("created_at"),
                    to_attr="approved_answers_list",
                )
            )
            .annotate(answer_count_db=Count("answers"))
            .order_by("answer_count_db", "-created_at")  # Unanswered first
        )
        serializer = PrivateQuestionSerializer(private_questions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"], url_path="moderation-queue")
    def moderation_queue(self, request):
        """
        Endpoint: /api/qa/questions/moderation-queue/
        Returns unapproved PUBLIC questions for the moderator to review.
        Permission: IsAuthenticated + IsQAModerator
        """
        pending_questions = (
            Question.objects.filter(
                visibility=Question.VISIBILITY_PUBLIC,
                is_approved=False,
            )
            .prefetch_related(
                Prefetch(
                    "answers",
                    queryset=Answer.objects.all().order_by("created_at"),
                    to_attr="approved_answers_list",
                )
            )
            .annotate(answer_count_db=Count("answers"))
            .order_by("-created_at")
        )
        serializer = self.get_serializer(pending_questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["POST"], url_path="approve")
    def approve(self, request, pk=None):
        """
        Endpoint: POST /api/qa/questions/{id}/approve/
        Approves a public question.
        Permission: IsAuthenticated + IsQAModerator
        """
        question = self.get_object()
        if question.visibility != Question.VISIBILITY_PUBLIC:
            return Response(
                {"detail": "Private questions do not require approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        question.is_approved = True
        question.save(update_fields=["is_approved"])
        return Response({"detail": "Question approved."}, status=status.HTTP_200_OK)


class AnswerViewSet(viewsets.ModelViewSet):
    """
    Public Endpoint for Answers.
    Usually filtered by ?question={id}
    """

    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "question__category", "responder"]
    ordering = ["-created_at"]  # Recent answers first

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        if self.action == "approve":
            return [permissions.IsAuthenticated(), IsQAModerator()]
        return [permissions.IsAuthenticated(), IsAdminOrOwner()]

    def get_queryset(self):
        """
        Return approved answers for public questions.
        Filter by specific question if ?question=ID is provided.
        Can also filter by responder (User ID) or Category (via Question).
        """
        # The approve action needs to fetch unapproved objects to approve them.
        if self.action == "approve":
            return Answer.objects.select_related("question").all()

        # select_related('question') avoids a per-answer query when filtering by category.
        queryset = Answer.objects.filter(
            is_approved=True,
            question__visibility=Question.VISIBILITY_PUBLIC,
        ).select_related("question")

        # Filter by Question ID
        question_id = self.request.query_params.get("question")
        if question_id:
            queryset = queryset.filter(question_id=question_id)

        # Filter by Responder (User ID)
        responder_id = self.request.query_params.get("responder")
        if responder_id:
            queryset = queryset.filter(responder_id=responder_id)

        # Filter by Category (via Question)
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(question__category__iexact=category)

        return queryset

    def perform_create(self, serializer):
        """
        Handle answer creation with role-based logic:
        - For private questions: require QACounselor role, auto-approve, fire signal
        - For public questions: any authenticated user, standard moderation flow
        """
        question = serializer.validated_data.get("question")

        if question.visibility == Question.VISIBILITY_PRIVATE:
            # Only QACounselors or staff can answer private questions
            is_counselor = (
                self.request.user.is_staff
                or self.request.user.roles.filter(name="QACounselor").exists()
            )
            if not is_counselor:
                from rest_framework.exceptions import PermissionDenied

                raise PermissionDenied(
                    "Only QA Counselors can answer private questions."
                )

            # Private answers skip moderation
            answer = serializer.save(
                responder=self.request.user,
                is_approved=True,
            )
            # Fire signal → notification to the question asker
            question_answered.send(
                sender=Answer,
                answer=answer,
            )
        else:
            # Public answers follow normal moderation flow
            serializer.save(responder=self.request.user)

    @action(detail=True, methods=["POST"], url_path="approve")
    def approve(self, request, pk=None):
        """
        Endpoint: POST /api/qa/answers/{id}/approve/
        Approves a public answer.
        Permission: IsAuthenticated + IsQAModerator
        """
        answer = self.get_object()
        if answer.question.visibility != Question.VISIBILITY_PUBLIC:
            return Response(
                {"detail": "Private answers do not require approval."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        answer.is_approved = True
        answer.save(update_fields=["is_approved"])
        return Response({"detail": "Answer approved."}, status=status.HTTP_200_OK)
