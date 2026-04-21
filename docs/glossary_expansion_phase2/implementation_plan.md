# AI用語集拡充 Phase 2 — 57件追加計画

## 概要
Phase 1（103件）に続き、残りの未登録AI用語57件を追加する。
すべての用語についてGoogle検索で最新情報を確認し、既存フォーマット（frontmatter + h2構成）に準拠して作成する。

## ワークフロー（各バッチ共通）
1. **Google検索**: バッチ内の用語をまとめて3回程度検索し、正確な定義・読み方・最新動向を確認
2. **エントリ作成**: 検索結果を元に用語集ファイルを作成（内部リンク配置含む）
3. **進捗更新**: task.mdのチェックリストを更新

## バッチ分割（10件×5 + 7件×1）

---

### Batch A: DL基盤・モデル構造（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | MLP（多層パーセプトロン） | `mlp.md` |
| 2 | BERT | `bert.md` |
| 3 | LSTM | `lstm.md` |
| 4 | VAE（変分オートエンコーダー） | `vae.md` |
| 5 | 拡散モデル（Diffusion Model） | `diffusion-model.md` |
| 6 | 人工ニューラルネットワーク（ANN） | `ann.md` |
| 7 | エンベディング | `embedding.md` |
| 8 | コンテキストウィンドウ | `context-window.md` |
| 9 | トークン化 | `tokenization.md` |
| 10 | 事前学習 | `pretraining.md` |

---

### Batch B: 学習手法・テクニック（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | アンダーフィッティング | `underfitting.md` |
| 2 | ゼロショット学習 | `zero-shot-learning.md` |
| 3 | 知識蒸留 | `knowledge-distillation.md` |
| 4 | 連合学習 | `federated-learning.md` |
| 5 | Q学習 | `q-learning.md` |
| 6 | 学習率 | `learning-rate.md` |
| 7 | バッチサイズ | `batch-size.md` |
| 8 | 局所最適解 / 大域最適解 | `local-global-optimum.md` |
| 9 | 最適化アルゴリズム | `optimization-algorithm.md` |
| 10 | 正答率 / 適合率 | `accuracy-precision.md` |

---

### Batch C: データ・前処理（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | アノテーション | `annotation.md` |
| 2 | 学習用データ | `training-data.md` |
| 3 | 合成データ | `synthetic-data.md` |
| 4 | データ前処理 | `data-preprocessing.md` |
| 5 | 二値分類モデル | `binary-classification.md` |
| 6 | 感情分析 | `sentiment-analysis.md` |
| 7 | 画像認識 | `image-recognition.md` |
| 8 | 画像生成AI | `image-generation-ai.md` |
| 9 | ベクトルデータベース | `vector-database.md` |
| 10 | 音声認識 / 音声合成 | `speech-recognition.md` / `speech-synthesis.md` |

> [!NOTE]
> 音声認識・音声合成は関連が強いが、既存のSTT/TTSとの役割分担を意識。STT/TTSはツール名、こちらは技術概念として解説する。

---

### Batch D: AI概念・社会（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | AI効果 | `ai-effect.md` |
| 2 | AIエンジニア | `ai-engineer.md` |
| 3 | AI開発 | `ai-development.md` |
| 4 | AI推論 | `ai-inference.md` |
| 5 | AIモデル | `ai-model.md` |
| 6 | AIシステム | `ai-system.md` |
| 7 | AI TRiSM | `ai-trism.md` |
| 8 | AI OCR | `ai-ocr.md` |
| 9 | 強いAI / 弱いAI | `strong-weak-ai.md` |
| 10 | アルゴリズムバイアス | `algorithm-bias.md` |

---

### Batch E: プロンプト・対話・セキュリティ（10件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | プロンプト | `prompt.md` |
| 2 | ゴールシークプロンプト | `goal-seek-prompt.md` |
| 3 | 敵対的プロンプト | `adversarial-prompt.md` |
| 4 | チャットボット | `chatbot.md` |
| 5 | 人工無脳 | `rule-based-chatbot.md` |
| 6 | 生成AI | `generative-ai.md` |
| 7 | ディープフェイク | `deepfake.md` |
| 8 | 意味ネットワーク | `semantic-network.md` |
| 9 | OWASP Top 10 for LLM | `owasp-llm.md` |
| 10 | クラウドAI | `cloud-ai.md` |

---

### Batch F: ツール・その他（7件）
| # | 用語 | ファイル名 |
|:--|:--|:--|
| 1 | Hugging Face | `hugging-face.md` |
| 2 | TPU | `tpu.md` |
| 3 | Vertex AI | `vertex-ai.md` |
| 4 | Whisper | `whisper.md` |
| 5 | ImageFX | `imagefx.md` |
| 6 | 量子AI | `quantum-ai.md` |
| 7 | 連合学習 | （Batch Bに含む） |

> [!IMPORTANT]
> 連合学習はBatch Bに含めたため、Batch Fは実質6件。合計57件。

---

## 品質基準
- すべての用語についてGoogle検索を実施し、2026年時点の最新情報を反映
- frontmatter: `title`, `description`, `date`, `furigana`, `category` を必須
- 本文: h2セクション2つ構成（概要 + 応用/関連）
- 内部リンク: 関連する既存用語への `/terms/xxx` リンクを最低2箇所配置
- 文体: 「です・ます」調、専門用語を平易に解説

## 検証計画
- 全バッチ完了後に `ls terms/ | wc -l` でファイル総数を確認（目標: 275件前後）
- ファイル名とfrontmatterの整合性をスポットチェック
