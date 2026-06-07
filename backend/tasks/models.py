from django.conf import settings
from django.db import models


class Task(models.Model):
    """タスク/メモ 1件。owner で「誰のタスクか」を管理する。"""

    # AUTH_USER_MODEL を参照（標準 User）。related_name で user.tasks でも辿れる
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # ユーザー削除時にそのタスクも削除
        related_name="tasks",
        verbose_name="所有者",
    )
    title = models.CharField("タイトル", max_length=200)
    body = models.TextField("本文", blank=True)
    done = models.BooleanField("完了", default=False)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
