"""accounts（登録・JWT発行）の API テスト。"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_register_creates_user(api_client):
    """登録APIでユーザーが作成され、パスワードがハッシュ化される。"""
    res = api_client.post(
        "/api/auth/register/",
        {"username": "newbie", "password": "Str0ng-pass!"},
        format="json",
    )
    assert res.status_code == 201
    user = User.objects.get(username="newbie")
    # 生パスワードがそのまま保存されていないこと（ハッシュ化の確認）
    assert user.password != "Str0ng-pass!"
    assert user.check_password("Str0ng-pass!")


@pytest.mark.django_db
def test_register_rejects_weak_password(api_client):
    """短すぎるパスワードは validate_password で弾かれる。"""
    res = api_client.post(
        "/api/auth/register/",
        {"username": "weak", "password": "123"},
        format="json",
    )
    assert res.status_code == 400
    assert not User.objects.filter(username="weak").exists()


@pytest.mark.django_db
def test_token_returns_access_and_refresh(api_client, user):
    """ログインAPIが access / refresh を返す。"""
    res = api_client.post(
        "/api/auth/token/",
        {"username": "alice", "password": "pass-12345"},
        format="json",
    )
    assert res.status_code == 200
    assert "access" in res.data
    assert "refresh" in res.data


@pytest.mark.django_db
def test_token_refresh_issues_new_access(api_client, user):
    """refresh トークンで新しい access を再発行できる。"""
    tokens = api_client.post(
        "/api/auth/token/",
        {"username": "alice", "password": "pass-12345"},
        format="json",
    ).data
    res = api_client.post(
        "/api/auth/token/refresh/",
        {"refresh": tokens["refresh"]},
        format="json",
    )
    assert res.status_code == 200
    assert "access" in res.data
