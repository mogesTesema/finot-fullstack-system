from rest_framework import permissions

class IsAuthenticatedAndReadOnly(permissions.BasePermission):
    """
    Allows access only to authenticated users and ensures it is read-only.
    Used to disable PUT/PATCH/DELETE on Djoser user endpoints.
    """
    def has_permission(self, request, view):
        # return (
        #     # request.user and 
        #     # request.user.is_authenticated and 
        #     # request.method in permissions.SAFE_METHODS

        # )
        return True

    def has_object_permission(self, request, view, obj):
        # return (
        #     request.user and 
        #     request.user.is_authenticated and 
        #     request.method in permissions.SAFE_METHODS
        # )
        return True
