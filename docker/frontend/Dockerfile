# Angular 20 は Node 22 以上が必要
FROM node:22-slim

WORKDIR /app/frontend

# 依存だけ先にコピーしてレイヤキャッシュを効かせる
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

# Ionic 慣習の 8100 番で開発サーバを公開
EXPOSE 8100

# 0.0.0.0 で待ち受けてコンテナ外（ホスト）からアクセス可能にする
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "8100"]
