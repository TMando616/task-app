from django.contrib import admin

from .models import Category, Task


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "created_at")
    list_filter = ("owner",)
    search_fields = ("name",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "owner", "done", "created_at")
    list_filter = ("done", "category", "owner")
    search_fields = ("title", "body")
