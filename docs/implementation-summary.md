# ドラフトアプリ 実装サマリー

## Phase 1: 基盤

### shadcn/ui コンポーネント
- button, card, input, select, badge, table, separator, dialog, alert, scroll-area をインストール

### `src/lib/types.ts` — 型定義
- Member, Team, Round1Pick, LotteryResult, DraftPhase, DraftState, DraftLogEntry

### `src/lib/draft-utils.ts` — ユーティリティ関数
- シャッフル（Fisher-Yates）
- 1巡目の競合解決（抽選）
- スネーク順計算（確定が遅い順）
- ラウンドごとのピック順取得（偶数:正順、奇数:逆順）

### `src/lib/draft-reducer.ts` — Reducer
- `INIT_DRAFT` — チーム・メンバー初期化
- `SET_ROUND1_PICK` — 1巡目の指名セット
- `RESOLVE_ROUND1` — 競合チェック・抽選・確定処理
- `SNAKE_PICK` — スネークドラフトでの指名
- `COMPLETE_DRAFT` — ドラフト完了
- `RESET` — 初期状態にリセット

### `src/lib/draft-context.tsx` — React Context
- `DraftProvider` でアプリ全体をラップ
- `useDraft` フックで状態とdispatchにアクセス

## Phase 2: 共通コンポーネント

| ファイル | 説明 |
|---|---|
| `src/components/shared/member-badge.tsx` | メンバー名バッジ |
| `src/components/shared/team-card.tsx` | チーム表示カード（メンバー一覧付き） |
| `src/components/shared/step-indicator.tsx` | 進行ステップ表示（4ステップ） |
| `src/components/shared/page-header.tsx` | ページヘッダー（タイトル・説明文） |

## Phase 3: 画面実装（5画面）

### `/` — トップページ
- モード選択（シンプルUI / 演出あり → Coming Soon）
- 「ドラフトを始める」ボタンで `/setup` へ遷移

### `/setup` — セットアップ画面
- チーム名入力（動的追加・削除、最低2チーム）
- メンバープール入力（動的追加・削除）
- バリデーション（重複チェック、チーム数以上のメンバー数チェック）
- 開始ボタンで `INIT_DRAFT` → `/round1` へ遷移

### `/round1` — 1巡目くじ引き画面
- 全チームが同時にメンバーを選択
- 「決定」で競合チェック → 抽選アニメーション → 結果表示
- 外れたチームは再指名（全チーム確定まで繰り返し）
- 完了後、スネーク順を計算して `/draft` へ遷移

### `/draft` — スネークドラフト画面
- 上部: ピック順バー（現在の順番をハイライト）
- 中央: ドラフトボード（チーム×ラウンドの表）
- 下部: 現在のチームの指名UI（残りメンバーから選択）
- 全メンバー指名完了で `/results` へ遷移

### `/results` — 結果画面
- チームごとの最終メンバー一覧（カード形式）
- ドラフトログ（指名履歴、巡目・チーム名・メンバー名）
- 「新しいドラフトを始める」ボタンで `/` へリセット

## Phase 4: アニメーション・その他

### Framer Motion アニメーション
- 各ページのフェードイン
- 抽選結果のスライドイン表示
- チームカード・ログのスタガーアニメーション
- 指名UIの切り替えアニメーション

### ルートガード
- 各ページでDraft状態を確認し、不正アクセス時は `/` へリダイレクト

### ビルド
- `npm run build` でエラーなしを確認済み
