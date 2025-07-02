FROM node:20

# 作業ディレクトリ設定
WORKDIR /app

# 依存定義のみ先にコピー（キャッシュ活用）
COPY package*.json ./

# インストール時の詳細ログとタイムアウト指定
RUN npm install --loglevel verbose --fetch-timeout=600000 --timeout=600000

# アプリ本体コピー
COPY . .

# 起動コマンド
CMD ["node", "index.js"]
