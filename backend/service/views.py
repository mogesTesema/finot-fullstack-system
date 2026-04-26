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
    Supports ?admin=<user_id> filtering.
    """
    serializer_class = ServiceGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ServiceGroup.objects.all().select_related('admin')
        admin_id = self.request.query_params.get('admin')
        if admin_id:
            qs = qs.filter(admin_id=admin_id)
        return qs

    @action(detail=False, methods=['GET'], url_path='my-group')
    def my_group(self, request):
        """
        Returns the group managed by the current user (service admin).
        Endpoint: /api/service/groups/my-group/
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        group = ServiceGroup.objects.filter(admin=request.user).select_related('admin').first()
        if not group:
            return Response({"detail": "No group assigned."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(group)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'], url_path='my-membership')
    def my_membership(self, request):
        """
        Returns the current user's active service group membership.
        Falls back to checking if the user is a group admin.
        Endpoint: /api/service/groups/my-membership/
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        # Check membership first
        try:
            membership = ServiceGroupMembership.objects.select_related('service_group').get(
                student=request.user, status=ServiceGroupMembership.ACTIVE
            )
            return Response({
                'service_group_name': membership.service_group.name,
                'service_group_id': membership.service_group.id,
                'role': membership.role,
                'status': membership.status
            })
        except ServiceGroupMembership.DoesNotExist:
            pass

        # Fallback: check if user is a group admin
        managed_group = ServiceGroup.objects.filter(admin=request.user).first()
        if managed_group:
            return Response({
                'service_group_name': managed_group.name,
                'service_group_id': managed_group.id,
                'role': 'ADMIN',
                'status': 'ACTIVE'
            })

        return Response({"detail": "Not assigned to any service group."}, status=status.HTTP_404_NOT_FOUND)

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
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return BulkSelectionSerializer
        return AgeglotSelectionSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # select_related('service_group') eliminates the N+1 hit caused by
            # AgeglotSelectionSerializer reading service_group.name per row.
            return (
                AgeglotSelection.objects.filter(student=self.request.user)
                .select_related("service_group")
                .order_by("priority")
            )
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
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['GET'], url_path='my-family')
    def my_family(self, request):
        """
        Endpoint: /api/service/families/my-family/
        Returns the family the current user belongs to.
        Also checks if the user is a father or mother of a family.
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        family = None
        # Check membership first
        if hasattr(request.user, 'family_membership'):
            family = request.user.family_membership.family
        
        # Then check if user is father or mother
        if not family:
            from django.db.models import Q
            family = Family.objects.filter(
                Q(father=request.user) | Q(mother=request.user)
            ).first()
        
        if family:
            # Pass request context so serializer can filter siblings
            serializer = self.get_serializer(family, context={'request': request})
            return Response(serializer.data)
        
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


from django.db.models import Q

class EventViewSet(viewsets.ModelViewSet):
    """
    View for Events.
    Students see global events + events for their active service group.
    Service Admins can CRUD events for their managed group.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # SuperAdmins see all
        if user.is_staff or user.roles.filter(name='SuperAdmin').exists():
            return Event.objects.all().order_by('-start_date').select_related('created_by', 'service_group')
            
        # Service Admins see global + their managed group's events
        if user.roles.filter(name='ServiceAdmin').exists():
            managed_groups = user.managed_service_groups.all()
            if managed_groups.exists():
                return Event.objects.filter(
                    Q(service_group__isnull=True) | Q(service_group__in=managed_groups)
                ).order_by('-start_date').select_related('created_by', 'service_group')

        # Students see global + their active group's events
        try:
            membership = ServiceGroupMembership.objects.get(student=user, status=ServiceGroupMembership.ACTIVE)
            group_id = membership.service_group_id
            return Event.objects.filter(
                Q(service_group__isnull=True) | Q(service_group_id=group_id)
            ).order_by('-start_date').select_related('created_by', 'service_group')
        except ServiceGroupMembership.DoesNotExist:
            pass

        # Fallback: only global events
        return Event.objects.filter(service_group__isnull=True).order_by('-start_date').select_related('created_by', 'service_group')

    def perform_create(self, serializer):
        user = self.request.user
        
        if user.is_staff or user.roles.filter(name='SuperAdmin').exists():
             serializer.save(created_by=user)
             return
             
        # If ServiceAdmin, enforce saving to their managed group
        if user.roles.filter(name='ServiceAdmin').exists():
            managed_group = user.managed_service_groups.first() # Assume one for now
            if managed_group:
                 serializer.save(created_by=user, service_group=managed_group)
                 return
                 
        raise permissions.PermissionDenied("You do not have permission to create events.")


class ServiceAttendanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint for students to see their attendance history.
    """
    serializer_class = ServiceAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            # select_related('event') eliminates the N+1 hit caused by
            # ServiceAttendanceSerializer reading event.title and event.start_date per row.
            return (
                ServiceAttendance.objects.filter(student=self.request.user)
                .select_related("event")
                .order_by("-event__start_date")
            )
        return ServiceAttendance.objects.none()

    @action(detail=False, methods=['POST'], url_path='mark')
    def mark_attendance(self, request):
        """
        Bulk mark attendance for an event.
        Endpoint: /api/service/attendance/mark/
        Uses efficient bulk DB operations instead of per-item queries.
        """
        user = request.user
        serializer = BulkAttendanceSerializer(data=request.data)
        if serializer.is_valid():
            event_id = serializer.validated_data['event_id']
            attendances_data = serializer.validated_data['attendances']

            try:
                event = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

            # Security: Verify if the user is authorized to mark attendance for this event
            if not user.is_staff and not user.roles.filter(name='SuperAdmin').exists():
                if not user.roles.filter(name='ServiceAdmin').exists():
                    return Response({"detail": "Not authorized to mark attendance for this event."}, status=status.HTTP_403_FORBIDDEN)
                    
                # If they are just a ServiceAdmin, the event's group must be one they manage.
                # (For global events (service_group=None), you could decide if ServiceAdmins can mark attendance. Assuming no.)
                if not event.service_group or event.service_group not in user.managed_service_groups.all():
                    return Response({"detail": "Not authorized to mark attendance for this event."}, status=status.HTTP_403_FORBIDDEN)

            # Collect student IDs from the request payload
            student_ids = [item['student'].id for item in attendances_data]

            with transaction.atomic():
                # Single query: fetch all existing attendance records for this event + these students
                existing_attendance_queryset = ServiceAttendance.objects.filter(
                    event=event, student_id__in=student_ids
                ).select_for_update()
                existing_attendance_by_student = {
                    record.student_id: record for record in existing_attendance_queryset
                }

                records_to_create = []
                records_to_update = []
                response_data = []

                for item in attendances_data:
                    student_user = item['student']
                    attendance_status = item['status']
                    remark = item.get('remark', '')

                    if student_user.id in existing_attendance_by_student:
                        # Update existing record
                        existing_record = existing_attendance_by_student[student_user.id]
                        existing_record.status = attendance_status
                        existing_record.remark = remark
                        records_to_update.append(existing_record)
                        response_data.append({
                            "student": student_user.id,
                            "status": attendance_status,
                            "updated": True,
                        })
                    else:
                        # Prepare new record for bulk insert
                        records_to_create.append(ServiceAttendance(
                            event=event,
                            student=student_user,
                            status=attendance_status,
                            remark=remark,
                        ))
                        response_data.append({
                            "student": student_user.id,
                            "status": attendance_status,
                            "updated": False,
                        })

                # Execute in 1-2 queries instead of O(N)
                if records_to_create:
                    ServiceAttendance.objects.bulk_create(records_to_create)
                if records_to_update:
                    ServiceAttendance.objects.bulk_update(records_to_update, fields=['status', 'remark'])

            return Response({"detail": "Attendance marked successfully", "records": response_data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'], url_path='my-history')
    def my_history(self, request):
        """
        Explicit endpoint for my history (alias for list view but clearer intent).
        """
        return self.list(request)

    @action(detail=False, methods=['GET'], url_path='group-members')
    def group_members(self, request):
        """
        Endpoint for Service Admins to fetch the roster of their managed group
        in order to mark attendance. Returns FamilyMemberSerializer for simplicity.
        """
        user = request.user
        if not user.roles.filter(name='ServiceAdmin').exists() and not user.is_staff:
             return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
             
        managed_group = user.managed_service_groups.first()
        if not managed_group:
             return Response({"detail": "You do not manage any group."}, status=status.HTTP_404_NOT_FOUND)
             
        memberships = ServiceGroupMembership.objects.filter(
            service_group=managed_group,
            status=ServiceGroupMembership.ACTIVE
        ).select_related('student__student_profile')
        
        users = [m.student for m in memberships]
        from .serializers import FamilyMemberSerializer # Local import to avoid circular dependency if messy
        serializer = FamilyMemberSerializer(users, many=True)
        return Response(serializer.data)
