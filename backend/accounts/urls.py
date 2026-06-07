from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import RegisterView

urlpatterns = [
    # 新規登録
    path("register/", RegisterView.as_view(), name="register"),
    # ログイン: username/password → access/refresh トークンを返す
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # refresh トークンから access トークンを再発行
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
