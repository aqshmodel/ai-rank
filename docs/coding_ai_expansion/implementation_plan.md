# 用語集追加 実装計画（AIコーディングエージェント・ツール群）

提供されたSランク〜Eランクの「AIコーディングエージェント・ツールリスト」と、現在のThe AI Rank用語集（`terms/` ディレクトリ）の既存ファイルを照合・調査しました。

## 調査結果：既存の用語（重複・内包されているもの）
以下のツールや構成は、すでにプロジェクト内に専用の解説ページが存在する、もしくは既存のページ（CursorやClaude Codeなど）の中で包含して語るべき内容です。これらについては**今回新規のMarkdownファイルとしての追加は行いません**（必要に応じて既存ファイルへの数行程度の追記で対応します）。

- **Claude Code関連** (Opus 4.7, Max 20x, CLI, VSCode, Skills, MCP連携等) → 既存 `claude-code.md`, `mcp.md` 等に包含
- **Cursor関連** (Cursor × Opus接続, Cursor Agent, Cursor Tab補完) → 既存 `cursor.md`
- **Cowork関連** (Cowork, Cowork + Claude Code) → 既存 `claude-cowork.md`
- **Antigravity関連** (Antigravity + Opus, Antigravity) → 既存 `antigravity.md`
- **v0 by Vercel** → 既存 `v0.md`
- **ChatGPT関連** (ChatGPTコード生成, ChatGPT Codex) → 既存 `chatgpt.md`, `codex.md`
- **Copilot関連** (Copilot Chat, GitHub Copilot素) → 既存 `github-copilot.md`
- **Gemini (コード生成)** → 既存 `gemini.md`
- **Perplexity Labs** → 既存 `perplexity.md`
- **Manus** → 先ほど作成済みの `munus.md` (記載はMunus/マナス)

## 実装内容（新規追加する用語：全25件）
調査の結果、**まだ用語集に存在しないツール群（全25件の親カテゴリ）**を抽出しました。それぞれのツールごとに、提示された用途・特徴と、「The AI Rank」特有の「ビジネスROI視点・開発生産性視点」を交えて、`terms/` 内に新規Markdownファイルを作成します。

### ■ Web / UI生成・フルスタック系ツール
1. `lovable.md` (Lovable / Lovable × Supabase含む)

### ■ Anthropic / Google クラウドネイティブ系ツール
2. `claude-projects.md` (Claude Projects ＋ Code)
3. `claude-for-excel.md` (Claude for Excel)
4. `claude-for-powerpoint.md` (Claude for PowerPoint)
5. `claude-in-chrome.md` (Claude in Chrome)
6. `gemini-cli.md` (Gemini CLI)
7. `gemini-code-assist.md` (Gemini Code Assist)

### ■ IDE / エディタ内蔵型ツール
8. `windsurf.md` (Windsurf)
9. `zed-ai.md` (Zed AI)

### ■ ブラウザ型クラウドIDE・エージェント
10. `replit.md` (Replit Agent / Replit AI)

### ■ ターミナル・CLI / 自律エージェント系
11. `warp.md` (Warp / Warpエージェント)
12. `cline.md` (Cline素)
13. `roo-code.md` (Roo Code)
14. `aider.md` (Aider)

### ■ 特定用途・法人向け・大規模リポジトリ解析
15. `augment-code.md` (Augment Code)
16. `sourcegraph-cody.md` (Cody / Cody Enterprise)
17. `amazon-q-dev.md` (Amazon Q Dev)
18. `tabnine.md` (Tabnine)
19. `jetbrains-ai.md` (JetBrains AI)

### ■ コード補完・リポジトリ検索・小規模拡張
20. `qwen-code.md` (Qwen Code)
21. `iflow.md` (iFlow)
22. `continue.md` (Continue ＋ 設定済 / Continue素)
23. `kilo-code.md` (Kilo Code)
24. `supermaven.md` (Supermaven)
25. `pieces.md` (Pieces)
26. `phind.md` (Phind)
27. `codeium.md` (Codeium単体)

*(※ リストの集約により全27件を新規に執筆)*

## オープンクエスチョン・ご確認事項
> [!IMPORTANT]
> ユーザへの確認事項
> 新規ファイルとして **27件分** を作成いたします。これらは各ファイルのFrontmatter（title, description, category 等）と、The AI Rank特有の「ビジネス・マネジメント層向けROI解説」をすべて個別に書き起こす巨大なバッチ処理となります。
> 
> これら27件について、一連のタスクとして全て作成してよろしいでしょうか？（問題なければ、タスクリストを作成し実行に入ります。もし特定のツールのみに絞りたい場合はお知らせください）
