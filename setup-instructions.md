# セットアップ手順

## バックエンドの起動

1. バックエンドディレクトリに移動:
```bash
cd backend
```

2. 依存関係のインストール（まだの場合）:
```bash
npm install
```

3. Prismaクライアントの生成とマイグレーション:
```bash
# Prismaクライアントを生成
npx prisma generate

# データベースマイグレーションを実行
npx prisma migrate deploy

# 開発環境でのマイグレーション（新規作成の場合）
# npx prisma migrate dev
```

4. バックエンドサーバーの起動:
```bash
npm run dev
# または
npm start
```

## フロントエンドの起動

別のターミナルで:

1. フロントエンドディレクトリに移動:
```bash
cd frontend
```

2. 依存関係のインストール（まだの場合）:
```bash
npm install
# または
pnpm install
```

3. Expoアプリの起動:
```bash
npx expo start
```

## 接続確認

1. バックエンドが http://localhost:5000 で起動していることを確認
2. フロントエンドでログイン/新規登録を試す
3. ネットワークタブでAPIリクエストが正しく送信されているか確認

## トラブルシューティング

### CORS エラーの場合
バックエンドの`index.js`で`cors()`が設定されていることを確認

### 401 Unauthorized エラー
- JWTトークンが正しく保存/送信されているか確認
- `SECRET_KEY`が設定されているか確認

### データベース接続エラー
- PostgreSQL/Supabaseの接続情報が正しいか確認
- ファイアウォール設定を確認（Supabaseの場合）