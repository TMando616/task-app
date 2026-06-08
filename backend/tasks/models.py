from django.conf import settings
from django.db import models


class Category(models.Model):
    """タスクを分類するカテゴリ（例: 仕事 / プライベート）。

    Task から ForeignKey で参照される「1対多」の親側。
    owner を持たせ、カテゴリもユーザーごとに分離する。
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
        verbose_name="所有者",
    )
    name = models.CharField("名称", max_length=50)
    created_at = models.DateTimeField("作成日時", auto_now_add=True)

    class Meta:
        ordering = ["name"]
        # 同一ユーザー内でカテゴリ名の重複を禁止（他人と被るのはOK）
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_category_per_owner"
            )
        ]

    def __str__(self):
        return self.name


class Task(models.Model):
    """タスク/メモ 1件。owner で「誰のタスクか」を管理する。"""

    # AUTH_USER_MODEL を参照（標準 User）。related_name で user.tasks でも辿れる
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # ユーザー削除時にそのタスクも削除
        related_name="tasks",
        verbose_name="所有者",
    )
    # カテゴリ（任意）。null/blank 許可で「未分類」を表現。
    # カテゴリ削除時は SET_NULL でタスク自体は残す
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
        verbose_name="カテゴリ",
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
