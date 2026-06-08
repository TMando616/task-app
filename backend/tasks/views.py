from rest_framework import filters, viewsets
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Task
from .serializers import CategorySerializer, TaskSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """カテゴリの CRUD。タスクと同じく owner で分離する。"""

    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    """1クラスで一覧/取得/作成/更新/削除を提供する。

    Laravel の Resource Controller 相当。ルーティングは urls.py の Router が自動生成。
    認証は settings の DEFAULT_PERMISSION_CLASSES（IsAuthenticated）が効く。
    """

    serializer_class = TaskSerializer
    # settings の DEFAULT_FILTER_BACKENDS（3種）に対して、各機能の対象を指定する
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # 完全一致フィルタ: ?done=true / ?category=3
    filterset_fields = ["done", "category"]
    # 部分一致検索: ?search=語（タイトル・本文を横断）
    search_fields = ["title", "body"]
    # 並び替え: ?ordering=created_at / ?ordering=-title（先頭は既定）
    ordering_fields = ["created_at", "updated_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """ログインユーザー自身のタスクだけに絞る（他人のタスクは見えない）。

        この絞り込みの「後に」filter_backends（検索/フィルタ/並び替え）が
        適用されるため、他人のタスクが検索に混ざる心配はない。
        """
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """作成時に owner をログインユーザーで自動設定する。"""
        serializer.save(owner=self.request.user)
