# AI Rank 用語集拡張（開発・インフラ用語26件の追加）

## 目的
「AI Terminology Dictionary（用語集）」に対し、ユーザー指定の開発・インフラ関連用語26件を新規作成します。単なる一般的なIT用語解説にとどまらず、「**AI活用時代における特有の用途、注意点、セキュリティリスク等**」 を全用語に独自の切り口として盛り込み、AI Rankのターゲット（非エンジニアや経営層）に有益なコンテンツへと昇華させます。

## User Review Required

以下の実装プランおよび「AI活用時代の切り口」のアプローチをご確認いただき、問題なければ承認をお願いいたします。

## 用語と「AI活用時代の切り口」の方針

すべての用語ファイル（`.md`）に `## AI導入・活用にどう関わるか（注意点）` のセクションを設け、以下のようなテーマで執筆します。

### エディタ・環境系
- **IDE (`ide.md`)** / **VSCode (`vscode.md`)**:
  AI拡張機能を組み込むための「AIアシスタントのプラットフォーム」としての重要性。
- **Docker (`docker.md`)** / **開発コンテナ (`devcontainer.md`)**:
  AIエージェントにコードを扱わせる際、メインPC環境を壊されないための「安全なサンドボックス（隔離環境）」としての価値。

### ファイル・設定系
- **環境変数 (`environment-variables.md`)** / **.env (`env-file.md`)**:
  【重要】APIキーなどを設定する場所。LLM・AIエージェントにプロジェクトファイルを読み取らせる際、これをマスキング・除外しないと情報漏えいの致命的インシデントになるという強い注意喚起。
- **.gitignore (`gitignore.md`)**:
  `.env` や秘密鍵をGitHub等にアップロードしない、あるいはAIツールにクロールさせない設計のための防波堤としての役割。
- **mkdir (`mkdir.md`)** / **rm (`rm.md`)**:
  AIエージェントに自律的なターミナル権限を与えた際、自動でディレクトリが作られたり、誤って重要ファイルが削除されるリスクと権限制御の教訓。

### バージョン管理系
- **Git (`git.md`)** / **GitHub (`github.md`)**:
  人間が書いたコードとAIが書いたコードを安全にマージ・管理・巻き戻しするための「命綱」。AIが自動でPull Requestを出す時代の働き方。

### Webアプリ・アーキテクチャ系
- **フロントエンド (`frontend.md`)** / **バックエンド (`backend.md`)** / **フレームワーク (`framework.md`)**:
  AIによる「ノーコード／ローコード生成」が発達する中で、人間のエンジニアとAIがどのように前後の役割分担をしていくべきかの全体像。
- **データベース (`database.md`)** / **キャッシュ (`cache.md`)** / **API (`api.md`は既存のためスキップ)**:
  RAGシステムを実現するためのデータベースの重要性や、AIを頻繁に呼び出す際のコストを削減するためのキャッシュ戦略。

### ネットワーク・セキュリティ系
- **IPアドレス (`ip-address.md`)** / **DNS (`dns.md`)** / **Cookie (`cookie.md`)**:
  AI搭載の悪意あるボットによるアクセス急増や、認証周りを突破されないためのネットワーク防御の概念。
- **暗号化 (`encryption.md`)** / **秘密鍵 (`private-key.md`)** / **SSH (`ssh.md`)** / **FTP (`ftp.md`)**:
  AI生成のコードをサーバーへデプロイする際、安全な通信プロトコル（SSHなど）を通す理由。また「秘密鍵をAIのプロンプト内に絶対にベタ書きしてはいけない」という教育。

### 運用・保守系
- **デプロイ (`deploy.md`)** / **デバッグ (`debug.md`)** / **ログ (`log.md`)**:
  AIがバグを一瞬で特定し、ログを読み解いて直す時代における「AI主導のデバッグフロー」と、人間が最終判断する「ヒューマン・イン・ザ・ループ」の重要性。

---

## 提案するファイル構成（展開予定）

各ファイルは `/terms/` ディレクトリ内に配置し、既存のフロントマター（`title`, `description`, `date`, `furigana`, `category`）のフォーマットと完全に統一します。

### [NEW] 26ファイルの作成
- `/terms/ide.md`
- `/terms/vscode.md`
- `/terms/devcontainer.md`
- `/terms/environment-variables.md`
- `/terms/env-file.md`
- `/terms/mkdir.md`
- `/terms/rm.md`
- `/terms/gitignore.md`
- `/terms/git.md`
- `/terms/github.md`
- `/terms/frontend.md`
- `/terms/backend.md`
- `/terms/framework.md`
- `/terms/database.md`
- `/terms/cache.md`
- `/terms/cookie.md`
- `/terms/ip-address.md`
- `/terms/dns.md`
- `/terms/encryption.md`
- `/terms/private-key.md`
- `/terms/ssh.md`
- `/terms/ftp.md`
- `/terms/docker.md`
- `/terms/deploy.md`
- `/terms/debug.md`
- `/terms/log.md`

## Verification Plan
1. 全ファイルが `terms/` に作成されたかを確認。
2. 内部のビルドコマンドや静的チェックを通してエラーがないか確認。
