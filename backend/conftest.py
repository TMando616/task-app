"""pytest の共通フィクスチャ。

fixture は「テストに引数名で渡せる準備済みの部品」。
各テスト関数の引数にこの名前を書くと、pytest が自動で値を注入する。
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    """未認証の API クライアント。"""
    return APIClient()


@pytest.fixture
def user(db):
    """テスト用ユーザー1（db フィクスチャでテスト用DBを有効化）。"""
    return User.objects.create_user(username="alice", password="pass-12345")


@pytest.fixture
def other_user(db):
    """テスト用ユーザー2（所有者分離の検証に使う）。"""
    return User.objects.create_user(username="bob", password="pass-12345")


@pytest.fixture
def auth_client(api_client, user):
    """user として認証済みのクライアント。

    force_authenticate でトークン発行を省略し、認証済み状態を作る。
    （トークン発行フロー自体は accounts のテストで別途検証する）
    """
    api_client.force_authenticate(user=user)
    return api_client
