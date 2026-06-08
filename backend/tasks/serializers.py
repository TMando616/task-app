from rest_framework import serializers

from .models import Category, Task


class CategorySerializer(serializers.ModelSerializer):
    """Category モデル ⇔ JSON の変換。"""

    owner = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "owner", "name", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    """Task モデル ⇔ JSON の変換。Laravel の API Resource に相当。"""

    # owner はサーバ側（ログインユーザー）で決めるので読み取り専用。
    # StringRelatedField で username を返す（User.__str__）
    owner = serializers.StringRelatedField(read_only=True)
    # 書き込みは category（カテゴリID）で行う。任意なので null 許可
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
    # 表示用にカテゴリ名も返す（フロントで毎回IDから引かなくて済む）
    category_name = serializers.CharField(
        source="category.name", read_only=True, default=None
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "owner",
            "category",
            "category_name",
            "title",
            "body",
            "done",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def validate_category(self, category):
        """他人のカテゴリを指定できないように検証する。

        PrimaryKeyRelatedField の queryset は全カテゴリなので、
        ここで「自分のカテゴリか」をチェックして越境を防ぐ。
        """
        if category is None:
            return category
        request = self.context.get("request")
        if request and category.owner_id != request.user.id:
            raise serializers.ValidationError("自分のカテゴリを指定してください。")
        return category
