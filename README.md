# task-app

**Angular / Ionic + Django** を学ぶための、JWT認証付きタスク/メモ管理アプリ（PWA対応）。
TypeScript(Next.js)中心だった自分が、転職先スタック（フロント Angular/Ionic、バック Python/Django）を
実際に手を動かして習得するための学習用プロジェクト。VibeCoding で段階的に構築している。

> 各ファイルに「なぜこう書くか」のコメントを残しており、コミットもマイルストーン単位で分けている。
> `git log` を追うと習得プロセスがそのまま辿れる構成。

---

## 構成（アーキテクチャ）

```
ブラウザ (PWA)
   │  http://localhost:8100
   ▼
┌─────────────────────────┐     REST + JWT      ┌─────────────────────────┐
│ frontend                │  Authorization:     │ backend                 │
│ Angular 20 + Ionic 8    │  Bearer <token>     │ Django 5.2 + DRF        │
│ (standalone / signals)  │ ──────────────────▶ │ (REST API)              │
└─────────────────────────┘  http://:8000/api   └───────────┬─────────────┘
                                                             │
                                                       ┌─────▼─────┐
                                                       │ PostgreSQL │
                                                       └───────────┘
```

| 層 | 技術 | ポート |
|----|------|--------|
| Frontend | Angular 20 + Ionic 8（standalone components / signals）| 8100 |
| Backend | Django 5.2 + Django REST Framework + SimpleJWT | 8000 |
| DB | PostgreSQL 16 | 5433（ホスト側）|

すべて Docker Compose で起動する。

---

## セットアップ

```bash
cp .env.example .env          # 初回のみ
docker compose up -d --build  # 全サービス起動（初回はビルドで数分）
```

- フロント: http://localhost:8100/
- API（DRFブラウザUIも見られる）: http://localhost:8000/api/
- Django管理画面: http://localhost:8000/admin/

### 使い方
1. http://localhost:8100/ を開く → ログイン画面
2. 「新規登録」タブでユーザー作成（パスワードは8文字以上）→ 自動ログイン
3. タスクの追加（右下＋）／完了チェック／左スワイプで削除／タップで編集

---

## ディレクトリ構成

```
task-app/
├── docker-compose.yml          # frontend / backend / db
├── docker/
│   ├── backend/Dockerfile      # Python 3.12
│   └── frontend/Dockerfile     # Node 22
├── backend/                    # Django
│   ├── config/                 # settings / urls / wsgi
│   ├── accounts/               # ユーザー登録・JWT発行
│   └── tasks/                  # Task モデル + CRUD API
└── frontend/                   # Angular + Ionic
    └── src/app/
        ├── core/               # 横断的な仕組み
        │   ├── models/         # 型定義（Task など）
        │   ├── services/       # AuthService / TaskService（signalで状態保持）
        │   ├── interceptors/   # JWTを全リクエストに自動付与
        │   └── guards/         # 未ログイン時のリダイレクト
        ├── auth/               # ログイン/登録画面
        └── tasks/              # 一覧 / 作成・編集画面
```

---

## API エンドポイント

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| POST | `/api/auth/register/` | 不要 | ユーザー登録 |
| POST | `/api/auth/token/` | 不要 | ログイン（access/refresh 発行）|
| POST | `/api/auth/token/refresh/` | 不要 | access トークン再発行 |
| GET | `/api/tasks/` | 必要 | 自分のタスク一覧 |
| POST | `/api/tasks/` | 必要 | タスク作成 |
| GET/PATCH/DELETE | `/api/tasks/{id}/` | 必要 | 取得 / 更新 / 削除 |

---

## 学習ポイント（Next.js / Laravel 経験者の視点）

### Angular（React/Next.js との違い）
- **standalone components**: `NgModule` 不要。各コンポーネントが `imports: []` で依存を宣言する（このプロジェクトは全て standalone）。
- **signals**: `signal()` / `computed()` で状態を持つ。React の `useState` に近いが、サービス(DI)に置けてアプリ全体で共有できる。テンプレートでは `tasks()` のように関数呼び出しで読む。
- **新制御フロー**: `@if` / `@for` / `@empty`（旧 `*ngIf` / `*ngFor` の置き換え。`@for` は `track` 必須）。
- **DI（依存性注入）**: `inject(SomeService)` でサービスを取得。Interceptor / Guard もこの仕組みで動く。
- **HTTP Interceptor**: 全リクエストに JWT を自動付与（`core/interceptors/auth.interceptor.ts`）。React には無い、認証付け忘れを構造的に防ぐ仕組み。
- **Reactive Forms**: フォーム状態を TS 側で型安全に管理（`fb.nonNullable.group(...)`）。

### Django / DRF（Laravel 経験が活きる）
- **ModelViewSet + Router**: 数行で CRUD 5エンドポイントを自動生成（Laravel の Resource Controller 相当）。
- **ModelSerializer**: モデル ⇔ JSON 変換（API Resource 相当）。`read_only_fields` で入力不可項目を制御。
- **所有者制御**: `get_queryset` で `request.user` のタスクだけに絞り、`perform_create` で owner を自動設定。
- **JWT 認証**: SimpleJWT。access（短命）でAPIアクセス、refresh（長命）で再発行。

### JWT 認証フロー
```
登録 → ログイン(/token/) → access/refresh をlocalStorageに保存
     → 以降のAPIは Interceptor が Authorization: Bearer を自動付与
     → access 失効時は /token/refresh/ で再発行（拡張ポイント）
```

---

## よく使うコマンド

```bash
# マイグレーション
docker compose run --rm backend python manage.py makemigrations
docker compose run --rm backend python manage.py migrate

# 管理ユーザー作成
docker compose run --rm backend python manage.py createsuperuser

# フロントのビルド確認（本番ビルド = PWA有効）
docker compose run --rm frontend npx ng build

# 停止 / 破棄
docker compose down            # 停止
docker compose down -v         # DBデータごと削除
```

---

## マイルストーン

- [x] **M1** Django + DRF で Task の CRUD API
- [x] **M2** JWT 認証 + タスクの所有者制御
- [x] **M3** Angular + Ionic 通信基盤（HttpClient / Interceptor / Guard / サービス）
- [x] **M4** ログイン・CRUD 画面（signals / Reactive Forms / 新制御フロー）
- [x] **M5** PWA 化（Service Worker / manifest）

### 今後の拡張アイデア
- access トークン失効時の refresh 自動リトライ（Interceptor 拡張）
- Capacitor でネイティブ（iOS/Android）化
- タスクの検索・並び替え、テスト（pytest / Karma）の追加
- 本番用 Nginx + Gunicorn 構成
