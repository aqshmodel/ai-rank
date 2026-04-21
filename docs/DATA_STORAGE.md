# 🗄 登録データの保管先について

## TL;DR

登録フォーム（氏名・メール・会社名・ランク等）から送信されたデータは、以下に保存されます：

1. **PostgreSQL の `signups` テーブル**（永続・メイン保存先）
2. **Node.js (PM2) ログ**（`console.log` — **PII をマスクした最小情報のみ**）
3. **ユーザーのブラウザ**（`localStorage` — 再訪時のオートフィル用のみ）

テーブル定義は [`schema.sql`](../schema.sql) を参照。

---

## 📊 データの流れ

```
 [ User Browser ]
      │
      ├─ localStorage: 'airank:auth' (再訪時の autofill)
      │
      │  POST /api/signup
      ▼
[ Express Route Handler ]
      │
      ├─ Origin / Referer / Rate limit / Honeypot
      │
      ├─ console.log('[AIRANK:signup]', {masked}) ──> [ Node.js Logs · PII はマスク済 ]
      │
      └─ pool.query(...) ─────────────────────────────> [ PostgreSQL ✅ ]
```

- 環境変数による PostgreSQL 接続 (`DATABASE_URL` または `PGHOST` 等) が未設定の場合、DB書き込みはスキップされ警告ログが出ます。
- `hp`（ハニーポット）や異常値は自動で弾かれます

---

## 🔍 データの閲覧

PostgreSQL クライアントツール（psql、DBeaver、PgAdmin 等）を使用して接続し閲覧します。

### SQL集計
```sql
-- 最新10件
select client_at, name, email, company, rank 
from signups order by id desc limit 10;

-- ランク分布
select rank, count(*) from signups group by rank order by rank;
```

---

## 📋 保存カラム

| カラム | 型 | 内容 |
|---|---|---|
| `id` | uuid | 自動採番 |
| `created_at` | timestamptz | サーバー受信時刻 |
| `name` | text | 氏名（100文字以内） |
| `email` | text | メール（200文字以内、RFC+使い捨てドメインブロック） |
| `company` | text | 会社名（200文字以内・API層で必須）※DBスキーマ上は `null` 可だが `/api/signup` では必須バリデーション |
| `rank` | smallint \| null | 診断結果のランク（0〜9） |
| `client_at` | timestamptz \| null | クライアント時刻（参考値） |
| `url` | text | 登録時のページURL |
| `referrer` | text | 参照元URL |
| `user_agent` | text | User Agent（500文字以内） |
| `ip` | text | 送信元IP（X-Forwarded-For） |

---

## 🔐 セキュリティ（自動で有効）

現状の `api/signup.js` は以下をデフォルトで実施：

- ✅ **Origin チェック** — `ai-rank.aqsh.co.jp` / `the-ai-rank.vercel.app` / localhost からのみ受付
- ✅ **Referer チェック** — 別サイトからの POST をブロック
- ✅ **ハニーポット** — 隠しフィールド `hp` にボットが入力すると無言でスルー
- ✅ **IPレートリミット** — 同一IPから1分間に5回超えでブロック
- ✅ **メール厳密検証** — 正規表現 + 使い捨てメールドメインをブロック
- ✅ **最大文字数制限** — name 100 / email 200 / company 200
- ✅ **Row Level Security** — DB側で制御されている場合、PostgreSQLの権限設定が適用されます
- ✅ **環境変数** — `DATABASE_URL` などはバックエンド環境変数のみに格納され、フロント非公開
- ✅ **Cache-Control: no-store** — キャッシュ汚染防止
- ✅ **X-Robots-Tag: noindex** — 検索エンジンにクロールされない
- ✅ **ログ側の PII マスク** — サーバーログには `email_masked` / `email_domain` / `ip_present` 等のみ出力し、氏名・会社名・生のメール・User-Agent はログに残さない

---

## 📤 X（Twitter）シェア時のフロー

1. 診断完了 → 「SHARE TO X」クリック
2. 未登録なら → **登録モーダルが開く**
3. 氏名・メール・会社名を入力
4. 「登録して続ける」押下 → `completeAuth()`
   - 1. `POST /api/signup` → **PostgreSQL に保存**（サーバー確定が最優先）
   - 2. localStorage に保存（再訪 autofill 用。サーバー成功後のみ）
   - 3. モーダル閉じる
5. X の投稿画面に `/c?rank=N&name=X` の URL が含まれる
6. X が URL を fetch → ランク別の認定証 OG 画像を表示

再訪時は登録済みなので、モーダルなしで直接シェアできます。

---

## 🛠 トラブルシュート

### データが来ない・エラーになる
1. サーバーのログ（VPS上の `pm2 logs` など）で `[AIRANK:signup]` を検索
2. `[AIRANK:db_not_configured]` が出ている → 環境変数が不足しています
3. DBインサートエラーが出ている → テーブルが存在しないかスキーマが異なります。 `schema.sql` を確認してください。
4. 何もログに出ていない → フロント側の問題。DevTools Network で `/api/signup` を確認

### 「Origin not allowed」 が返る
`api/signup.js` の `ALLOWED_ORIGINS` に本番ドメインを追加

### 「Too many requests」 が返る
同一IPから連投。60秒で解除。本番で緩めたい場合は `RATE_LIMIT_MAX` を調整

### DBを使用せず外部転送のみにしたい
- カスタムロジックで外部の Webhook へ送信するように `api/signup.js` 全体を改修してください。

---

## ❓ 質疑応答の戻るボタン

- ✅ 各質問カードの左上に「← 前の質問」ボタン（Q1は「氏名入力に戻る」）
- ✅ 結果画面に「質問に戻る」ボタン（最後の質問に戻れる）
- ✅ 「最初からやり直す」ボタン（診断をリセット）

---

最終更新: 2026-04-19
