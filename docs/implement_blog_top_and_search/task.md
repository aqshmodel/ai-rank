# ブログTOPページおよび検索機能実装タスク

- [x] `server.js` に全記事データ（タイトル、概要、日付など）を取得してJSONで返す `/api/articles` の実装を追加する
- [x] `server.js` にブログTOPページ用ルーティング `/articles` を追加する
- [x] 記事一覧および検索用インターフェースとなる `views/articles-index.html` を新規作成する
- [x] `views/articles-index.html` 内に、`/api/articles` の情報を取得してリアルタイムにカードと検索結果を描画するJavaScriptロジックを実装する
- [x] `style.css` に検索ボックスおよび記事一覧のカードグリッドデザイン（ホバーエフェクト等含む）を追加する
- [x] `views/article-template.html` の記事末尾CTAをリッチで視認性の高いパネル型デザインにブラッシュアップする
- [x] `style.css` の `.step-desc` を修正し、`index.html` の診断フォーム名前入力欄上の不自然な余白を削除する
- [x] すべてのHTMLファイル（`index.html`, `iwate.html`, `privacy.html`, `views/article-template.html`）のヘッダーにある「ブログ・事例」リンクを `/articles` へ変更する
- [x] ローカル環境で一覧表示と検索フィルターが正常に動作するかテストする
- [x] 完了後、ウォークスルーを作成する
