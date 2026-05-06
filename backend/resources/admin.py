from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Material


@admin.register(Material)
class MaterialAdmin(ModelAdmin):
    list_display = ("title", "material_type", "course", "service_group", "uploaded_by", "created_at")
    list_filter = ("material_type",)
    search_fields = ("title", "description")
    readonly_fields = ("id", "created_at", "updated_at")
