# PostgreSQL構築・管理画面作成・Webhook削除 実装計画（レビュー修正版）

「自前のPostgreSQLでの独立稼働」においてセキュリティやデプロイフローに隙がないよう、スタッフエンジニア目線で全体をレビューし、不足していた点を補完した完全版の計画となります。

## 第三者目線でのレビューによる指摘・修正ポイント

**1. デプロイフローとSecretsの連携不足**
* **課題:** ユーザーの指示に「パスワードはGitHub Secretsに登録する」とあるが、現状のVPSへのデプロイワークフロー（`.github/workflows/deploy.yml`）には、Secretsの値を読み出してVPS上の `.env` ファイルに転記するステップが存在しない。このままではVPSのNodeアプリがパスワードを参照できない。
* **解決策:** `deploy.yml` にステップを追加し、デプロイ時にGitHubの `$SECRET` を `~/app/the-ai-rank/.env` へ動的に書き出す自動化フローを追加する。

**2. Supabase依存残骸の完全なクリーンアップ**
* **課題:** 「Supabaseは使わない」とするなら、`api/_supabase.js` など使われなくなるファイルが残留するのは負債になる。
* **解決策:** 不要ファイル・パスワード以外の不要環境変数読み込みを明確に削除対象（DELETE）とする。

**3. データベース構築の再現性欠如（DB Schema化）**
* **課題:** コマンドラインで手動でテーブルを作ると、本番VPSや別のテストサーバーを立てる際に手間となり管理しづらくなる。
* **解決策:** プロジェクト内に `schema.sql` を配置し、スキーマ定義をコード管理（IaC化）する。これによりVPS内でコマンド1つでテーブルを初期化できるようにする。

**4. 管理画面の実用性の欠如（CSVとレートリミット）**
* **課題:** 単に見られる画面（HTML表示）だけでは、実案件の「問い合わせ対応」や「顧客リストのエクスポート」などの運用フローに対応できない。また Basic認証はブルートフォース攻撃を受けやすい。
* **解決策:** 管理画面には認証保護下で「CSVダウンロード機能」を標準搭載し、APIエンドポイントへの回数制限（レートリミット）をかけてセキュリティを担保する。

---

## 具体的な実装ステップ

### Phase 1: CI/CD フローの改修と環境変数の設定
- **[MODIFY]** `.github/workflows/deploy.yml`
  * Secrets（`ADMIN_PASSWORD`等）をVPS内部の `~/app/the-ai-rank/.env` に展開して書き出すステップを追加します。
  * `DATABASE_URL` （ローカルPostgres用接続文字列）も `.env` に書き出させます。

### Phase 2: Webhook転送・Supabaseファイルの削除
- **[MODIFY]** `api/signup.js` および `api/enterprise.js`
  * 環境変数 `SIGNUP_FORWARD_URL` を利用して外部APIを叩いている部分を完全に削除します。
- **[DELETE]** `api/_supabase.js`
  * Supabaseクライアントの初期化ファイルを削除し、`api/_db.js` (Postgresローカル接続)のみを利用する構成に一本化させます。

### Phase 3: 管理画面（Admin）とセキュリティの構築
- **[MODIFY]** `package.json`
  * `express-basic-auth` パッケージを追加依存として組み込みます。
- **[MODIFY]** `server.js`
  * `/admin` エンドポイントを作成し、ユーザーID: `tsukada-t@aqsh.co.jp` / パスワード: `process.env.ADMIN_PASSWORD` を用いたBasic認証を実装します。
- **[NEW]** `api/admin.js` (または server.js内記述)
  * `signups` テーブル、`enterprise_inquiries` テーブル全件のSELECT、およびCSV形式でダウンロードさせる専用ルートを構築します。
- **[NEW]** `views/admin.html`
  * 認証通過後に表示される軽量でモダンな一覧UIを構築します。

### Phase 4: VPS上でのインフラ構築 (PostgreSQL)
こちら（ローカルPC）からVPSにSSH（`tsukada@162.43.31.17`）経由で接続し、以下の作業を実施します。
1. **インストール**: Ubuntuの `apt` コマンドでPostgreSQL（`postgresql`, `postgresql-contrib`）をインストールします。
2. **データベース・ユーザー作成**: `sudo -u postgres psql` を介して、データベース `airank` および専用のユーザー `airank_user` を作成します。
3. **初期化 (Seed)**: プロジェクト内に新設する `schema.sql` をPSQLコマンドで流し込み、テーブルを安全に構築します。

## 検証とゴール
* [ ] コードを GitHub へ push し、GitHub Actions で自動デプロイと `.env` 生成が成功すること。
* [ ] VPS上のPostgreSQLが稼働しており、フロントエンドからのテスト送信が正常にデータベースへと保存されること。
* [ ] ブラウザで `/admin` にアクセスでき、指定のID・パスワードで認証とデータの閲覧・CSVダウンロードに成功すること。

## 【付帯作業】IDEで検出されたエラーの修正（Pythonスクリプト関連）
* **課題:** IDEのインメモリスクリプトで、`img` や `output_path`、`terms` などの未定義変数エラーおよびインデント構文エラー（Parse error: Unexpected indentation）が検出されています。
* **解決策:** `scratch/generate_to_webp.py` など、関連するPythonスクリプト群やMarkdownコードブロック等の構文・インデント・変数スコープを再度点検し、エラーのない正常なコードに修正します。
