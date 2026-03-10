from rest_framework import serializers
from .models import ServiceGroup, AgeglotSelection, Family, FamilyMembership, Event, ServiceConfiguration, ServiceGroupMembership, ServiceAttendance
from django.contrib.auth import get_user_model

User = get_user_model()

class FamilyContactSerializer(serializers.ModelSerializer):
    """
    Serializer for Family Father/Mother details including phone from StudentProfile.
    """
    name = serializers.CharField(source='get_full_name', read_only=True)
    phone = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'name', 'phone']
        
    def get_phone(self, obj):
        if hasattr(obj, 'student_profile') and obj.student_profile:
            return obj.student_profile.personal_phone
        return None

class BulkAttendanceInputSerializer(serializers.Serializer):
    """
    Single attendance record input.
    """
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='student'  # Maps to 'student' object in validated_data
    )
    status = serializers.ChoiceField(choices=ServiceAttendance.STATUS_CHOICES)
    remark = serializers.CharField(required=False, allow_blank=True)

class BulkAttendanceSerializer(serializers.Serializer):
    """
    Serializer for marking bulk attendance.
    """
    event_id = serializers.IntegerField()
    attendances = BulkAttendanceInputSerializer(many=True)

class ServiceGroupSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.get_full_name', read_only=True)

    class Meta:
        model = ServiceGroup
        fields = ['id', 'name', 'description', 'admin_name']


class AgeglotSelectionSerializer(serializers.ModelSerializer):
    """
    Serializer for individual selection preferences - READ ONLY / OUTPUT.
    """
    service_group_name = serializers.CharField(source='service_group.name', read_only=True)

    class Meta:
        model = AgeglotSelection
        fields = ['id', 'service_group', 'service_group_name', 'priority', 'skills', 'reason']
        # For output, we want these read-only
        read_only_fields = ['student', 'service_group', 'priority', 'skills', 'reason']


class AgeglotSelectionInputSerializer(serializers.ModelSerializer):
    """
    Serializer for INPUT selection preferences.
    """
    class Meta:
        model = AgeglotSelection
        fields = ['service_group', 'priority', 'skills', 'reason']


class BulkSelectionSerializer(serializers.Serializer):
    """
    Serializer for bulk submitting 3 choices.
    """
    selections = AgeglotSelectionInputSerializer(many=True)

    def validate_selections(self, value):
        if len(value) != 3:
            raise serializers.ValidationError("You must submit exactly 3 choices.")
        
        priorities = [item['priority'] for item in value]
        if sorted(priorities) != [1, 2, 3]:
            raise serializers.ValidationError("Priorities must be 1, 2, and 3.")
            
        groups = [item['service_group'] for item in value]
        if len(set(groups)) != 3:
            raise serializers.ValidationError("You cannot select the same service group multiple times.")
            
        return value


class FamilyMemberSerializer(serializers.ModelSerializer):
    """
    Serializer to display a student member in a family list.
    """
    name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email']


class FamilySerializer(serializers.ModelSerializer):
    father = FamilyContactSerializer(read_only=True)
    mother = FamilyContactSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    siblings = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ['id', 'name', 'father', 'mother', 'religious_father', 'member_count', 'siblings']

    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_siblings(self, obj):
        # We want to return other members of the family.
        # However, 'request.user' context is needed to exclude "self".
        request = self.context.get('request')
        current_user = request.user if request and request.user.is_authenticated else None
        
        # Get all students in this family
        memberships = obj.members.select_related('student').all()
        # Extract users
        users = [m.student for m in memberships]
        
        # Filter out current user if present
        if current_user:
            users = [u for u in users if u.id != current_user.id]
            
        return FamilyMemberSerializer(users, many=True).data


class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'photo', 'status', 'created_by_name', 'created_at']


class ServiceGroupMembershipSerializer(serializers.ModelSerializer):
    service_group_name = serializers.CharField(source='service_group.name', read_only=True)
    
    class Meta:
        model = ServiceGroupMembership
        fields = ['id', 'service_group', 'service_group_name', 'role', 'status', 'joined_at']


class ServiceAttendanceSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateTimeField(source='event.start_date', read_only=True)

    class Meta:
        model = ServiceAttendance
        fields = ['id', 'event', 'event_title', 'event_date', 'status', 'remark', 'recorded_at']
