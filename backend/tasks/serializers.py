from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Task モデル ⇔ JSON の変換。Laravel の API Resource に相当。"""

    class Meta:
        model = Task
        fields = ["id", "title", "body", "done", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
