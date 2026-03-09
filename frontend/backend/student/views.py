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
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Uncomment when ready

    def get_queryset(self):
         # Students can only see their own profile in the list view, or Admins see all
         if self.request.user.is_staff: 
             return StudentProfile.objects.all()
         if self.request.user.is_authenticated:
            return StudentProfile.objects.filter(user=self.request.user)
         return StudentProfile.objects.none()

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_staff:
             return Response({"detail": "You cannot delete your profile."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Automatically assign the current user if they don't have a profile yet
        # Note: This logic assumes the user is logged in. 
        # Since we are in AllowAny mode, we might need to handle the case where request.user is anonymous.
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # For testing without auth, we might need to pass user ID manually or handle error
            serializer.save()

    @action(detail=False, methods=['GET', 'PUT', 'PATCH']) 
    # permission_classes=[permissions.IsAuthenticated] # Uncomment when ready
    def me(self, request):
        """
        Custom endpoint to get/update the current user's profile.
        Path: /api/student/profiles/me/
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get or create ensures we don't crash if signal failed
            profile, created = StudentProfile.objects.get_or_create(user=request.user)
        except Exception as e:
            return Response({"detail": "Could not fetch profile."}, status=status.HTTP_400_BAD_REQUEST)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            # partial=True allows sending only fields to be updated
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if not serializer.is_valid():
                print(serializer.errors)
                return Response(serializer.errors, status=400)
            serializer.save()
            return Response(serializer.data)

