# ブログ実装拡張：タグ機能およびフィルタリングの導入計画

ユーザーの要望に基づき、ブログ記事（Markdown）にタグの概念を導入し、ブログトップページで「タグによる記事の絞り込み機能」を実装するための計画です。

## User Review Required

> [!IMPORTANT]
> **タグUIのデザインと動作についての確認**
> タグをクリックして絞り込む際の挙動について、以下の設計で進めてよろしいでしょうか？
> 
> 1. **記事一覧ページ (`articles-index.html`)**
>    - 検索ボックスの下に、登録されている全記事のタグを重複を弾いて抽出し、「タグクラウド（またはボタン一覧）」として表示します。
>    - いずれかのタグをクリックすると、そのタグが含まれる記事だけが即座にフィルタリングされて表示されます。
>    - 検索キーワードの絞り込みとタグの絞り込みは組み合わせて動作する（AND検索）ようにします。
> 2. **個別記事ページ (`article-template.html`)**
>    - タイトルの下（日付の横など）に、その記事に紐づくタグをバッジ形式で表示します。
>    - 将来的にはこのバッジをクリックして一覧ページヘ遷移し、そのタグで絞り込まれた状態にする設計も可能です。（今回はUIの表示にとどめるか、リンク化するかを選択できます。まずは「表示のみ」で小さく始めることを推奨します）

## Proposed Changes

### Backend Logic

#### [MODIFY] [server.js](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/server.js)
- `/api/articles` のレスポンスペイロードに、フロントマターから抽出した `tags: data.tags || []` を含めるようにします。
- `/articles/:slug` の個別記事レンダリング処理において、`data.tags` をもとに `<span class="article-tag">#タグ名</span>` などのHTML文字列を生成し、テンプレート側の `{{tags}}` に置換する処理を追加します。

### Frontend Templates & Styles

#### [MODIFY] [views/articles-index.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/views/articles-index.html)
- 検索ボックスUIの周辺に `<div id="filter-tags"></div>` を追加。
- APIから返ってきた全記事データのタグを Set にまとめてボタン要素を生成するJavaScriptを追加。
- ライブ検索のフィルター関数をアップデートし、特定のタグが選択（アクティブ）されている場合は、そのタグを配列内に保持している記事のみを描画するようにロジックを修正。

#### [MODIFY] [views/article-template.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/views/article-template.html)
- 記事のヘッダー領域（`<header class="md-header">` 内）に `{{tags}}` のプレースホルダを挿入する。

#### [MODIFY] [style.css](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/style.css)
- 新規追加されるタグバッジ要素（`.article-tag`, `.filter-tag` 等）のための、The AI Rankの世界観（丸みのある角、アクセントカラー、ホバー効果）に合わせた CSS を追加します。

### Content Metadata

#### [MODIFY] [posts/*.md](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/posts)
- `iwate-ai-consulting.md` と `local-ai-failure.md` のフロントマターに、`tags: ["AI導入", "事例", "地方企業"]` など、実用的なタグ配列を追加します。

## Open Questions

> [!NOTE]
> * 各記事に表示されるタグは、とりあえず「クリックで記事一覧ページへ遷移＋そのタグで絞り込み」という機能まで実装してしまって良いでしょうか？それとも、現時点では「どんなタグが付いているか見せるだけ」が良いでしょうか？（お勧めは回遊性を高める前者の機能です）
> * 特に指定したいタグの文字列（例: `BtoB`, `コンサルティング`, `AI人材育成` など）があればお知らせください。

## Verification Plan

### Automated Tests
- 実装後、ローカルサーバを起動し `/articles` へのアクセスでタグ一覧が正常に生成されているか確認。
- 任意のタグをクリックした際、対象となる記事のみが一覧に残るかをブラウザ上で操作テスト。

### Manual Verification
- 個別記事のMarkdownが表示される際、タグの有無（CSSのスタイリング崩れ等）が起きないか目視で検証。
