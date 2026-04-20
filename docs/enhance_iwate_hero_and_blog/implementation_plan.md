# The AI Rank 岩手法人向けLP改修 & ブログ記事拡充 計画

本計画は、`iwate.html` ファーストビュー（ヒーローセクション）の大幅なデザインブラッシュアップを中心に、CTAボタンのレイアウト修正、およびSEOブログ記事の実装を対象とします。

## User Review Required

> [!IMPORTANT]
> **LPヒーローセクションのブラッシュアップについて**
> 現在のシンプルな中央揃えのテキストから、「ファーストビューで強烈なインパクトと信頼性を与える」BtoB向けのモダンなレイアウトへ変更します。
> 以下のデザインへ変更して進めてよろしいでしょうか？
> 1.  **左側（コピー＆CTA）と右側（ビジュアル／実績）の2カラム構成** に変更。
> 2.  **権威性バッジの配置**：上部に「世界標準のAIスキル測定システム開発チームが岩手から直接支援」といったマイクロコピーを配置。
> 3.  **CTAのリッチ化**：The AI Rank 本体でも使用している `.hero-cta.primary` のデザインを継承し、ファーストビューでのクリック率を高める。
> 4.  **実績の強調**：下部に「導入実績」「効果」のハイライトをミニマルな数字（Stat）として配置。
> 
> ※また、前回ご提案した「岩手AIコンサル記事の4500文字への拡充（『DXコンサルの屍』などの泥臭い執筆）」および「CTAボタンのズレ修正（`display: inline-flex` からの解消）」も、この計画に基づき同時進行いたします。

## Proposed Changes

### Frontend (Templates & Styles)

#### [MODIFY] [iwate.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/iwate.html)
- ヒーローセクション（`.local-hero`）のHTML構造を大幅に変更します。
- これまでの中央揃えのワンカラム型から、テキストと統計情報/ビジュアルを含む非対称なレイアウトを作成します。
- CSS（`<style>`タグ内）に、ヒーローセクション用のリッチなデザインクラスを追加します。

#### [MODIFY] [article-template.html](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/views/article-template.html)
- 記事下部のCTAコンポーネントにおける「▸」のズレを解消します。
- インラインスタイルで `flex-direction: row; align-items: center; justify-content: center; gap: 12px;` などを設定し、1行の美しいボタンとして整理します。

### Content (SEO Blog Post)

#### [MODIFY] [iwate-ai-consulting.md](file:///Users/tsukadatakahiro/Python/app/the-ai-rank/posts/iwate-ai-consulting.md)
- 約600文字の現状から、4500〜5000文字のフラグシップ記事へと加筆・再構築します。
- **執筆方針**:
  - `Human-Like Style` ガイドラインを適用。「」（直角括弧）の全削除。現場への泥臭い伴走支援を、少々バランスを崩した人間味ある主観的表現で記述する。
  - 地方が直面する人手不足、高額なDXコンサルの屍、自社専用のAIエージェント開発事例、THE AI RANK を活用した社員研修など、見出しで構成。
  - 自然な形で多数の内部リンク（`/`, `/iwate.html`, その他記事）を埋め込む。

## Open Questions

> [!NOTE]
> * ヒーローセクションの右側（ビジュアル領域）に、仮で置ける画像（工場の風景やオフィスの風景）はありますか？ なければ、数字（Stat）やタイポグラフィ、または The AI Rank のコンセプト画像（`og-image.png`等）を用いた抽象的なグラフィックデザインでカバーします。
> * ブログ記事に架空の事例（例：岩手の製造業C社でのAI導入）を厚めに盛り込んでもよろしいでしょうか？

## Verification Plan
1. `npm run dev` にて、変更後の `iwate.html` のヒーローセクションがPC/SP共に美しくレスポンシブに表示されるか目視検証。
2. CTAの矢印ズレが解消されていることを目視検証。
3. `iwate-ai-consulting.md` の文字数が4500文字を超え、指定したライティングルール（「」削除、人間らしい表現）が徹底されているかを分析。
