# CLAUDE.md - ドラフトアプリ

## 回答スタイル
- 日本語で出力して

## プロジェクト概要
プロ野球ドラフト会議風のチームメンバー編成Webアプリ。
1台のデバイスで操作し、くじ引き＋スネークドラフトでチーム編成を行う。

## 技術構成
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **アニメーション**: Framer Motion
- **DB**: Neon DB (PostgreSQL)
- **ORM**: Drizzle ORM
- **デプロイ**: Vercel

## ディレクトリ構成
```
src/
├── app/          # Next.js App Router（ページ・レイアウト）
├── components/   # UIコンポーネント（shadcn/ui含む）
│   └── ui/       # shadcn/uiコンポーネント
├── lib/          # ユーティリティ、DB接続
└── types/        # 型定義
docs/             # 仕様書
memo/             # 議事録
```

## 開発コマンド
```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint実行
```

## コミットメッセージ規則
```
種別: 内容
```
- feat: 機能追加
- fix: バグ修正
- refactor: リファクタ
- docs: ドキュメント
- style: 見た目のみ
- chore: その他

## ブランチ運用
- `main` — 本番用（直接push禁止）
- `develop` — 開発用
- `feature/*` — 機能開発

## コーディング規約
- コンポーネントはアロー関数で定義
- パスエイリアスは `@/*` を使用（`src/*` にマッピング）
- shadcn/uiコンポーネントは `src/components/ui/` に配置

