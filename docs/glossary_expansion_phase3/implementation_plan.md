# AI用語集拡充 Phase 3 — 50件追加計画

## 概要
Phase 1（103件）、Phase 2（57件）に続き、残りの未登録AI用語50件を追加する。
すべての用語についてGoogle検索で最新情報を確認してから作成する。

> **同義・重複の整理**
> - スマートスピーカー ≒ 既存 `ai-speaker.md` → 追加しない
> - デジタルトランスフォーメーション ≒ 既存 `dx.md` → 追加しない
> - ベイズ分析 ≒ 既存 `bayesian-statistics.md` → 追加しない
> - Veo ≒ 既存 `google-veo.md` → 追加しない
> - エージェント型AI ≒ 既存 `agent.md` → 追加しない（内容が十分）

## ワークフロー（各バッチ共通）
1. **Google検索**: バッチ内の用語をまとめて2〜3回検索し、正確な定義・読み方・最新動向を確認
2. **エントリ作成**: 検索結果を元に用語集ファイルを作成（内部リンク配置含む）
3. **進捗更新**: task.mdのチェックリストを更新

## バッチ分割（10件×5）

---

### Batch A: AI基礎概念・理論（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | アルゴリズム | `algorithm.md` |
| 2 | インメモリー・コンピューティング | `in-memory-computing.md` |
| 3 | エンボディドAI | `embodied-ai.md` |
| 4 | コグニティブ・コンピューティング | `cognitive-computing.md` |
| 5 | 潜在空間 | `latent-space.md` |
| 6 | データサイエンス | `data-science.md` |
| 7 | ASI（超知能） | `asi.md` |
| 8 | AIチップ | `ai-chip.md` |
| 9 | AI駆動開発 | `ai-driven-development.md` |
| 10 | DoT（Diagram of Thought） | `dot.md` |

---

### Batch B: AI応用・スマート系（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | 壁打ち | `kabeuchi.md` |
| 2 | スマートシティ | `smart-city.md` |
| 3 | スマートオフィス | `smart-office.md` |
| 4 | スマートストア | `smart-store.md` |
| 5 | スマートディスプレイ | `smart-display.md` |
| 6 | スマート農業 | `smart-agriculture.md` |
| 7 | スマートホーム | `smart-home.md` |
| 8 | Society 5.0 | `society-5.md` |
| 9 | 社内ソーシャルAI | `internal-social-ai.md` |
| 10 | ローカル5G | `local-5g.md` |

---

### Batch C: AI応用・ビジネス（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | ハイパーパーソナライゼーション | `hyper-personalization.md` |
| 2 | AIOps | `aiops.md` |
| 3 | AI農業 | `ai-agriculture.md` |
| 4 | AI PC | `ai-pc.md` |
| 5 | AI音声 | `ai-voice.md` |
| 6 | AIタレント | `ai-talent.md` |
| 7 | AIイヤーブック | `ai-yearbook.md` |
| 8 | 落とし物クラウドfind | `otoshimono-cloud-find.md` |
| 9 | FinTech | `fintech.md` |
| 10 | Worldcoin | `worldcoin.md` |

---

### Batch D: ツール・サービス（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | Cursor | `cursor.md` |
| 2 | DeepL | `deepl.md` |
| 3 | Adobe Firefly | `adobe-firefly.md` |
| 4 | Adobe Sensei | `adobe-sensei.md` |
| 5 | Alexa | `alexa.md` |
| 6 | AWS | `aws.md` |
| 7 | Azure OpenAI Service | `azure-openai.md` |
| 8 | Runway | `runway.md` |
| 9 | Sora | `sora.md` |
| 10 | tsuzumi | `tsuzumi.md` |

---

### Batch E: 技術手法・その他（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | テキストマイニング | `text-mining.md` |
| 2 | マシンビジョン | `machine-vision.md` |
| 3 | フレーム補間 | `frame-interpolation.md` |
| 4 | LoRA | `lora.md` |
| 5 | GPT-4o | `gpt-4o.md` |
| 6 | Google Lens | `google-lens.md` |
| 7 | Googleナウキャスト | `google-nowcast.md` |
| 8 | I2V / T2V / V2V | `i2v.md` / `t2v.md` / `v2v.md` |
| 9 | EPP | `epp.md` |
| 10 | MROC | `mroc.md` |

> [!NOTE]
> I2V/T2V/V2Vは密接に関連するため3件を1セットとして扱う。Batch Eは実質12ファイル。

---

## 品質基準
- すべての用語についてGoogle検索を実施し、2026年時点の最新情報を反映
- frontmatter: `title`, `description`, `date`, `furigana`, `category` を必須
- 本文: h2セクション2つ構成（概要 + 応用/関連）
- 内部リンク: 関連する既存用語への `/terms/xxx` リンクを最低2箇所配置
- 文体: 「です・ます」調、専門用語を平易に解説

## 検証計画
- 全バッチ完了後に `find terms/ -name "*.md" | wc -l` でファイル総数を確認（目標: 325件前後）
