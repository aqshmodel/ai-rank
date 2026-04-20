# ブログTOPページおよび記事検索機能の追加

ブログ記事（Markdownファイル）が蓄積されていく基盤として、記事一覧を美しく表示する「ブログTOPページ（`/articles`）」と、「キーワードによる検索機能」を実装するための計画です。

## User Review Required

> [!IMPORTANT]
> この実装では、ユーザー体験を最優先し「**リアルタイム検索（ライブ検索）**」のアーキテクチャを採用することを提案します。
> 文字を打ち込むたびにページ遷移なしでサクサクと検索結果が絞り込まれる、モダンな体験を提供します。
> 以下の設計方針で進めて問題ないかご確認ください。

## 設計方針：リアルタイム検索の仕組み

ページ読み込みのたびにサーバーに通信する旧来の方式ではなく、以下の「**フロントエンド＋API方式**」を採用します。

1. **APIの新設 (`server.js`)**: 
   全記事のメタデータ（タイトル、概要、日付、URL、画像パス等）を一覧化した軽量なJSONを返すAPIエンドポイント `/api/articles` を作成します。
2. **一覧ページの描画 (`articles-index.html`)**: 
   `/articles` にアクセスした際、JavaScriptが裏側で `/api/articles` から記事データを一括取得します。
3. **検索フィルターの動作**: 
   ページ上部に設けた検索ボックスにキーワードを入力すると、JavaScriptがすでに取り込んでいる記事データからタイトルや概要を対象にフィルタリングを行い、即座に画面上のカードを書き換えます（ページ遷移なし）。

## Proposed Changes

### Backend (Routing & API)

#### [MODIFY] [server.js](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/server.js)
- **一覧表示用ルート (`/articles`)**: 
  `/articles/:slug` のルートの上に、`app.get('/articles', ...)` を追加し、`views/articles-index.html` を返すように実装します。
- **データ提供API (`/api/articles`)**: 
  `posts/` フォルダ内の `.md` ファイルを走査し、gray-matterでメタデータを抽出し、日付順でソートした記事オブジェクトの配列を返すエンドポイントを実装します。

### Frontend (Templates & Styles)

#### [MODIFY] [article-template.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/views/article-template.html)
- ブログ記事末尾のCTA（お問い合わせ誘導）が目立たない課題を解決。
- 背景色・ボーダー付きの専用パネル（ボックス）に変更し、The AI Rankの世界観に合わせた `hero-cta primary` クラスを流用したリッチなボタンにブラッシュアップします。

#### [MODIFY] [style.css](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/style.css)
- `index.html` 診断フォーム（STEP・00）における、「あなたの名前を証明書に刻みます。」の下にある不要な巨大余白を修正します。
- `.step-desc` の `margin-bottom` で `vh` を使用していることによる過剰な余白を、固定ピクセル値（`24px`程度）へ見直します。
- ブログTOPの検索ボックスおよび記事一覧のスタイリング追加も平行して行います。

#### [NEW] [articles-index.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/views/articles-index.html)
- ブログのTOPとなるHTMLファイル。
- **UIコンポーネント**: 検索ボックス機能（`input type="search"`）と、記事カードの一覧表示用コンテナ（`<div id="articles-container"></div>`）を配置。
- **ロジック (JavaScript)**: ページロード時に `/api/articles` にfetchし、初回レンダリングを実行。その後、検索窓の `input` イベントをリスンし、リアルタイムでの部分一致検索（タイトル、概要）を実行してDOMを更新するスクリプトを記述。

#### [MODIFY] [style.css](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/style.css)
- 検索ボックスのスタイリング。
- 記事カード型レイアウト（CSS Grid等を用いた2〜3カラムのレスポンシブなグリッドレイアウト）の追加。
- マウスホバー時のリッチなマイクロアニメーション（浮かび上がるエフェクト等）の追加。

### Global Navigation

#### [MODIFY] [グローバルナビゲーションを搭載した全HTML]
- 以下のファイルのヘッダーにある `<a href="/articles/local-ai-failure" class="gh-link">ブログ・事例</a>` を `<a href="/articles" class="gh-link">ブログ・事例</a>` に置換します。
  - `index.html`
  - `iwate.html`
  - `privacy.html`
  - `views/article-template.html`

## Verification Plan

### Manual Verification
1. ローカルサーバー（`server.js`）を起動し、ブラウザで `http://localhost:3333/articles` にアクセスする。
2. ブログ一覧が、カード型の美しいデザインで表示されることを確認する。
3. 検索ボックスにキーワードを入力し、瞬時（ページ遷移なし）に対象の記事だけが表示されるか確認する。
4. 各ページのヘッダーの「ブログ・事例」をクリックし、ブログTOPへ遷移するか確認する。
