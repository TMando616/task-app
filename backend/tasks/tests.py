"""tasks（タスク/カテゴリ）の API テスト。"""
import pytest

from .models import Category, Task


@pytest.mark.django_db
def test_list_requires_authentication(api_client):
    """未認証では一覧を取得できない（401）。"""
    res = api_client.get("/api/tasks/")
    assert res.status_code == 401


@pytest.mark.django_db
def test_create_sets_owner_automatically(auth_client, user):
    """作成時に owner がログインユーザーへ自動設定される。"""
    res = auth_client.post("/api/tasks/", {"title": "買い物"}, format="json")
    assert res.status_code == 201
    assert res.data["owner"] == user.username
    assert Task.objects.get(id=res.data["id"]).owner == user


@pytest.mark.django_db
def test_list_only_returns_own_tasks(auth_client, user, other_user):
    """他人のタスクは一覧に出ない（所有者分離）。"""
    Task.objects.create(owner=user, title="自分のタスク")
    Task.objects.create(owner=other_user, title="他人のタスク")

    res = auth_client.get("/api/tasks/")
    assert res.status_code == 200
    titles = [t["title"] for t in res.data["results"]]
    assert titles == ["自分のタスク"]


@pytest.mark.django_db
def test_cannot_access_other_users_task(auth_client, other_user):
    """他人のタスクには get_queryset の絞り込みで 404 になる。"""
    others = Task.objects.create(owner=other_user, title="秘密")
    res = auth_client.get(f"/api/tasks/{others.id}/")
    assert res.status_code == 404


@pytest.mark.django_db
def test_search_filters_by_keyword(auth_client, user):
    """?search= でタイトル/本文の部分一致検索ができる。"""
    Task.objects.create(owner=user, title="りんごを買う")
    Task.objects.create(owner=user, title="みかんを買う")

    res = auth_client.get("/api/tasks/?search=りんご")
    assert res.status_code == 200
    assert res.data["count"] == 1
    assert res.data["results"][0]["title"] == "りんごを買う"


@pytest.mark.django_db
def test_filter_by_done(auth_client, user):
    """?done= で完了状態の完全一致フィルタができる。"""
    Task.objects.create(owner=user, title="完了済み", done=True)
    Task.objects.create(owner=user, title="未完了", done=False)

    res = auth_client.get("/api/tasks/?done=true")
    assert res.data["count"] == 1
    assert res.data["results"][0]["title"] == "完了済み"


@pytest.mark.django_db
def test_cannot_assign_other_users_category(auth_client, other_user):
    """他人のカテゴリを指定するとバリデーションエラー（400）。"""
    foreign = Category.objects.create(owner=other_user, name="他人カテゴリ")
    res = auth_client.post(
        "/api/tasks/",
        {"title": "越境テスト", "category": foreign.id},
        format="json",
    )
    assert res.status_code == 400
    assert "category" in res.data


@pytest.mark.django_db
def test_category_crud_is_owner_scoped(auth_client, user, other_user):
    """カテゴリ一覧も自分のものだけが返る。"""
    Category.objects.create(owner=user, name="自分")
    Category.objects.create(owner=other_user, name="他人")

    res = auth_client.get("/api/categories/")
    assert res.status_code == 200
    names = [c["name"] for c in res.data["results"]]
    assert names == ["自分"]
