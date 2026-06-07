from rest_framework import viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """1クラスで一覧/取得/作成/更新/削除を提供する。

    Laravel の Resource Controller 相当。ルーティングは urls.py の Router が自動生成。
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
