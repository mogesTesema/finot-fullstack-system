from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import StudentProfile
from .serializers import StudentProfileSerializer


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing student profiles.
    """

    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        return Response(
            {"detail": "Profiles are created automatically upon registration."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def get_queryset(self):
        # Students can only see their own profile in the list view, or Admins see all
        if self.request.user.is_staff:
            return StudentProfile.objects.all()
        if self.request.user.is_authenticated:
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.none()

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"detail": "You cannot delete your profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["GET", "PUT", "PATCH"])
    # The action inherits permission_classes from the viewset, so no need to explicitly add IsAuthenticated
    def me(self, request):
        """
        Custom endpoint to get/update the current user's profile.
        Path: /api/student/profiles/me/
        """
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found. Please create your profile first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            serializer = self.get_serializer(profile)
            return Response(serializer.data)

        elif request.method in ["PUT", "PATCH"]:
            # partial=True allows sending only fields to be updated
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data)
