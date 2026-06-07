from rest_framework import generics, permissions

from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """ユーザー登録エンドポイント（POSTのみ）。

    未ログインでも使えるよう AllowAny で公開する
    （settings の既定 IsAuthenticated をここだけ上書き）。
    """

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
