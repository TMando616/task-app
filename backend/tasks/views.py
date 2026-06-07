from rest_framework import viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """1クラスで一覧/取得/作成/更新/削除を提供する。

    Laravel の Resource Controller 相当。ルーティングは urls.py の Router が自動生成。
    認証は settings の DEFAULT_PERMISSION_CLASSES（IsAuthenticated）が効く。
    """

    serializer_class = TaskSerializer

    def get_queryset(self):
        """ログインユーザー自身のタスクだけに絞る（他人のタスクは見えない）。"""
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """作成時に owner をログインユーザーで自動設定する。"""
        serializer.save(owner=self.request.user)
