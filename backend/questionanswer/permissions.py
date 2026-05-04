"""
Permission classes for the questionanswer app.

Centralizes all Q&A-related authorization checks:
  - IsQACounselor: can view/answer private questions
  - IsQAModerator: can approve public questions and answers
  - IsQuestionOwner: can view own private questions
  - IsAdminOrOwner: general admin/owner fallback (moved from views.py)
"""
from rest_framework import permissions


class IsQACounselor(permissions.BasePermission):
    """
    Grants access to users with the QACounselor role.
    QACounselors can view and answer private questions.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff:
            return True
        return request.user.roles.filter(name="QACounselor").exists()


class IsQAModerator(permissions.BasePermission):
    """
    Grants access to users with the QAModerator role.
    QAModerators can approve public questions and answers.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff:
            return True
        return request.user.roles.filter(name="QAModerator").exists()


class IsQuestionOwner(permissions.BasePermission):
    """
    Object-level permission: the requesting user owns the question.
    Used for private question access — only the asker can see their own.
    """

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        # For Answer objects, check the parent question's owner
        if hasattr(obj, "question"):
            return obj.question.user is not None and obj.question.user == request.user
        # For Question objects
        return obj.user is not None and obj.user == request.user


class IsAdminOrOwner(permissions.BasePermission):
    """
    General permission: staff, SuperAdmin, QAModerator, or owner of the object.
    Moved from views.py to centralize all Q&A permissions.
    """

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated:
            if request.user.is_staff or request.user.roles.filter(name__in=["SuperAdmin", "QAModerator"]).exists():
                return True
            if hasattr(obj, "user") and obj.user == request.user:
                return True
            if hasattr(obj, "responder") and obj.responder == request.user:
                return True
        return False
