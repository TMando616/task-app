from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "owner", "done", "created_at")
    list_filter = ("done", "owner")
    search_fields = ("title", "body")
