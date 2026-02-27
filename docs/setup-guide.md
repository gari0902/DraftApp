# 環境構築ガイド

## 前提条件

| ツール | バージョン |
|---|---|
| Node.js | v24 系（v24.14.0 で動作確認済み） |
| npm | v11 系 |
| Git | 最新版 |

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion

---

## Windows 環境構築

### 1. Node.js のインストール

公式サイトからインストーラーをダウンロードしてインストールする。

https://nodejs.org/

インストール後、PowerShell またはコマンドプロンプトで確認:

```powershell
node --version
npm --version
```

> **補足**: nvm-windows を使う場合:
> ```powershell
> nvm install 24
> nvm use 24
> ```

### 2. Git のインストール

https://git-scm.com/download/win からインストーラーをダウンロード。

デフォルト設定のままインストールすればOK。

### 3. リポジトリのクローン

```powershell
git clone https://github.com/<org>/DraftApp.git
cd DraftApp
```

### 4. 依存パッケージのインストール

```powershell
npm install
```

### 5. 環境変数の設定

`.env.example` をコピーして `.env` を作成する。

```powershell
copy .env.example .env
```

`.env` を開いて `DATABASE_URL` を設定する（MVP段階ではDBは使わないため、ダミー値のままでも動作する）。

### 6. 開発サーバーの起動

```powershell
npm run dev
```

ブラウザで http://localhost:3000 を開いてトップページが表示されることを確認する。

### 7. その他のコマンド

```powershell
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint 実行
```

---

## Mac 環境構築

### 1. Homebrew のインストール（未導入の場合）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Node.js のインストール

**方法A: Homebrew で直接インストール**

```bash
brew install node@24
```

**方法B: nvm を使う（推奨）**

```bash
brew install nvm
```

シェル設定ファイル（`~/.zshrc`）に以下を追加:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
```

ターミナルを再起動して Node.js をインストール:

```bash
nvm install 24
nvm use 24
```

バージョン確認:

```bash
node --version
npm --version
```

### 3. Git のインストール

Mac には Xcode Command Line Tools に Git が含まれている。未導入の場合:

```bash
xcode-select --install
```

または Homebrew でインストール:

```bash
brew install git
```

### 4. リポジトリのクローン

```bash
git clone https://github.com/<org>/DraftApp.git
cd DraftApp
```

### 5. 依存パッケージのインストール

```bash
npm install
```

### 6. 環境変数の設定

`.env.example` をコピーして `.env` を作成する。

```bash
cp .env.example .env
```

`.env` を開いて `DATABASE_URL` を設定する（MVP段階ではDBは使わないため、ダミー値のままでも動作する）。

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてトップページが表示されることを確認する。

### 8. その他のコマンド

```bash
npm run build     # プロダクションビルド
npm run start     # プロダクションサーバー起動
npm run lint      # ESLint 実行
```

---

## 共通: ブランチ運用ルール

| ブランチ | 用途 |
|---|---|
| `main` | 本番用（直接push禁止） |
| `develop` | 開発用 |
| `feature/*` | 機能開発 |

### 開発の流れ

```bash
# develop ブランチから feature ブランチを作成
git checkout develop
git pull origin develop
git checkout -b feature/機能名

# 開発・コミット
git add <ファイル>
git commit -m "feat: 機能の説明"

# push して PR を作成
git push -u origin feature/機能名
```

### コミットメッセージ規則

```
種別: 内容
```

| 種別 | 用途 |
|---|---|
| `feat` | 機能追加 |
| `fix` | バグ修正 |
| `refactor` | リファクタ |
| `docs` | ドキュメント |
| `style` | 見た目のみ |
| `chore` | その他 |

---

## トラブルシューティング

### `npm install` でエラーが出る

Node.js のバージョンが古い可能性がある。`node --version` で v24 系であることを確認する。

### ポート 3000 が使用中

```bash
# 別のポートで起動
npm run dev -- -p 3001
```

### shadcn/ui コンポーネントを追加したい場合

```bash
npx shadcn@latest add <コンポーネント名>
```
