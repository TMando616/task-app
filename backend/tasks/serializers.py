from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Task モデル ⇔ JSON の変換。Laravel の API Resource に相当。"""

    # owner はサーバ側（ログインユーザー）で決めるので読み取り専用。
    # StringRelatedField で username を返す（User.__str__）
    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = ["id", "owner", "title", "body", "done", "created_at", "updated_at"]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]
