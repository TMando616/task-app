from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """ユーザー新規登録用。password は write_only（レスポンスに含めない）。"""

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],  # settings の password validators を適用
    )

    class Meta:
        model = User
        fields = ["id", "username", "password"]

    def create(self, validated_data):
        # create_user を使うとパスワードが自動でハッシュ化される（平文保存を防ぐ）
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
