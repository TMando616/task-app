from django.db import models


class Task(models.Model):
    """タスク/メモ 1件。M2 で owner（ユーザー）を追加する予定。"""

    title = models.CharField("タイトル", max_length=200)
    body = models.TextField("本文", blank=True)
    done = models.BooleanField("完了", default=False)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)
    updated_at = models.DateTimeField("更新日時", auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
