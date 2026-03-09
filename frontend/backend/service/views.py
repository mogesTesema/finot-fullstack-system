from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import ServiceGroup, AgeglotSelection, Family, Event, ServiceConfiguration, ServiceGroupMembership, ServiceAttendance
from .serializers import (
    ServiceGroupSerializer, 
    AgeglotSelectionSerializer,
    BulkSelectionSerializer,
    BulkAttendanceSerializer,
    FamilySerializer, 
    EventSerializer,
    FamilyMemberSerializer,
    ServiceGroupMembershipSerializer,
    ServiceAttendanceSerializer
)

class ServiceGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for Service Groups (Ministries).
    Students browse this to decide what to pick.
    """
    queryset = ServiceGroup.objects.all().select_related('admin')
    serializer_class = ServiceGroupSerializer
    # permission_classes = [permissions.AllowAny] # Or IsAuthenticated

    @action(detail=True, methods=['GET'], url_path='members')
    def members(self, request, pk=None):
        """
        Returns list of students who are active members of this group.
        Each member includes user data and profile data.
        """
        group = self.get_object()
        memberships = ServiceGroupMembership.objects.filter(
            service_group=group,
            status=ServiceGroupMembership.ACTIVE
        ).select_related('student__student_profile')

        users = [m.student for m in memberships]
        serializer = FamilyMemberSerializer(users, many=True)
        return Response(serializer.data)


class AgeglotSelectionViewSet(viewsets.ModelViewSet):
    """
    Endpoint for students to submit their top 3 service choices.
    """
    # serializer_class = AgeglotSelectionSerializer # Removed in favor of get_serializer_class
    # permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return BulkSelectionSerializer
        return AgeglotSelectionSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return AgeglotSelection.objects.filter(student=self.request.user).order_by('priority')
        return AgeglotSelection.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Overwrite create to handle bulk submission of 3 choices.
        And check if selection window is open.
        """
        # 1. Check Configuration
        config = ServiceConfiguration.objects.first()
        if not config or not config.is_selection_open:
            return Response(
                {"detail": "Service selection is currently closed."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Check for existing selections
        if AgeglotSelection.objects.filter(student=request.user).exists():
             return Response(
                {"detail": "You have already submitted your selections. Edit them if needed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Validate Bulk Data
        serializer = BulkSelectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        selections_data = serializer.validated_data['selections']

        # 4. Atomic Save
        with transaction.atomic():
            created_instances = []
            for item in selections_data:
                instance = AgeglotSelection.objects.create(
                    student=request.user,
                    service_group=item['service_group'],
                    priority=item['priority'],
                    skills=item.get('skills', ''),
                    reason=item.get('reason', '')
                )
                created_instances.append(instance)

        # 5. Return Response
        response_serializer = AgeglotSelectionSerializer(created_instances, many=True)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class FamilyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for Families.
    Includes a custom action 'my_family' for the student dashboard.
    """
    queryset = Family.objects.all().select_related('father__student_profile', 'mother__student_profile')
    serializer_class = FamilySerializer
    # permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'], url_path='my-family')
    def my_family(self, request):
        """
        Endpoint: /api/service/families/my-family/
        Returns the family the current user belongs to.
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check membership
        if hasattr(request.user, 'family_membership'):
            family = request.user.family_membership.family
            # Pass request context so serializer can filter siblings
            serializer = self.get_serializer(family, context={'request': request})
            return Response(serializer.data)
        else:
            return Response({"detail": "You are not assigned to a family yet."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['GET'])
    def members(self, request, pk=None):
        """
        Endpoint: /api/service/families/{id}/members/
        Returns list of members in this family.
        """
        family = self.get_object()
        memberships = family.members.select_related('student__student_profile').all()
        # Extract users from membership objects
        users = [m.student for m in memberships] 
        serializer = FamilyMemberSerializer(users, many=True)
        return Response(serializer.data)


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for Events.
    """
    queryset = Event.objects.all().order_by('-start_date').select_related('created_by')
    serializer_class = EventSerializer
    # permission_classes = [permissions.AllowAny]


class ServiceAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for students to see their attendance history.
    """
    serializer_class = ServiceAttendanceSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return ServiceAttendance.objects.filter(student=self.request.user).order_by('-event__start_date')
        return ServiceAttendance.objects.none()

    @action(detail=False, methods=['POST'], url_path='mark')
    def mark_attendance(self, request):
        """
        Bulk mark attendance for an event.
        Endpoint: /api/service/attendance/mark/
        """
        # Ideally check permission here (IsAdminUser or specific role)
        
        serializer = BulkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            event_id = serializer.validated_data['event_id']
            attendances_data = serializer.validated_data['attendances']
            
            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

            response_data = []
            
            with transaction.atomic():
                for item in attendances_data:
                    # 'student' is now a User object because of PrimaryKeyRelatedField source='student'
                    student_obj = item['student']
                    status_val = item['status']
                    remark = item.get('remark', '')

                    # Update or Create attendance record
                    attendance, created = ServiceAttendance.objects.update_or_create(
                        event=event,
                        student=student_obj,
                        defaults={
                            'status': status_val,
                            'remark': remark
                        }
                    )
                    response_data.append({
                        "student": student_obj.id, 
                        "status": status_val, 
                        "updated": not created
                    })
            
            return Response({"detail": "Attendance marked successfully", "records": response_data}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'], url_path='my-history')
    def my_history(self, request):
        """
        Explicit endpoint for my history (alias for list view but clearer intent).
        """
        return self.list(request)
