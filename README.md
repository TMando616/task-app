# task-app

転職活動先スタック（Angular/Ionic + Django + TypeScript）学習用のタスク/メモ管理アプリ。
VibeCoding で段階的に構築する。Docker 前提。

## スタック

| 層 | 技術 |
|----|------|
| Frontend | Angular 20 + Ionic 8（M3 以降で追加）|
| Backend | Django 5.2 + Django REST Framework |
| DB | PostgreSQL 16 |
| 認証 | JWT（simplejwt, M2 で追加予定）|

## 起動

```bash
cp .env.example .env          # 初回のみ
docker compose up -d          # db + backend 起動
docker compose logs -f backend
```

- API: http://localhost:8000/api/tasks/ （ブラウザで DRF の画面も見られる）
- 管理画面: http://localhost:8000/admin/ （要 superuser 作成）
- DB ポート: ホスト 5433 →（dev-init の 5432 と衝突回避）

## よく使うコマンド

```bash
# マイグレーション
docker compose run --rm backend python manage.py makemigrations
docker compose run --rm backend python manage.py migrate

# 管理ユーザー作成
docker compose run --rm backend python manage.py createsuperuser

# 停止 / 破棄
docker compose down            # コンテナ停止
docker compose down -v         # DB データごと削除
```

## マイルストーン

- [x] **M1** Django + DRF で Task の CRUD API（Docker 上で動作確認済み）
- [ ] **M2** JWT 認証 + タスクの所有者（owner）制御
- [ ] **M3** Angular + Ionic でフロント疎通（HttpClient / Interceptor）
- [ ] **M4** CRUD 画面 + signals による状態管理
- [ ] **M5** PWA 化
