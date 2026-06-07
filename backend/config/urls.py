from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),  # 登録・ログイン・トークン更新
    path("api/", include("tasks.urls")),  # タスク CRUD
]
