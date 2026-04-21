# Phase 4: 既存用語（Phase 1 & 2）コンテンツ拡充計画

## 概要と目的
Phase 3で実施した「ビジネスでの活用メリット」や「AI導入のROI」に関する追記を、Phase 1およびPhase 2で作成した既存の275件（※対象274件）の用語ファイルに対しても適用します。すべての用語で「なぜ企業にこの技術・概念が必要か？」を明確にし、ビジネスパーソンにとって価値の高い体系的な用語集へのアップグレードを図ります。

## User Review Required
> [!IMPORTANT]
> 対象ファイルが274件と非常に膨大であるため、1バッチ20件前後の**全14バッチ**に分割して順次実行します。
> このままバッチ1から実行を開始してよろしいでしょうか？

## 拡充方針
1. **現状の構成維持**: 既存の `## 〇〇とは` 等のセクションは極力維持しつつ、末尾に `## ビジネスでの活用メリット` `## AI導入における役割` などの新規H2見出しを追加。
2. **Google検索の徹底**: 用語ごとに2026年時点の最新情報をビジネス観点で検索し、質の高いコンテキストを付与。
3. **継続的な成果報告**: 1つのバッチ（20件）が終わるごとにタスクリストを更新し、品質や方針のブレがないか確認しながら進めます。

---

## 実行スケジュール（バッチ分割）

### Batch 1 (20件)
`aaas.md` 〜 `ai-ocr.md`

### Batch 2 (20件)
`ai-orchestration.md` 〜 `bert.md`

### Batch 3 (20件)
`binary-classification.md` 〜 `contextual-analysis.md`

### Batch 4 (20件)
`cookie.md` 〜 `descriptive-statistics.md`

### Batch 5 (20件)
`devcontainer.md` 〜 `environment-variables.md`

### Batch 6 (20件)
`epoch.md` 〜 `github-copilot.md`

### Batch 7 (20件)
`github.md` 〜 `inferential-statistics.md`

### Batch 8 (20件)
`ip-address.md` 〜 `mkdir.md`

### Batch 9 (20件)
`mlp.md` 〜 `optimization.md`

### Batch 10 (20件)
`outlier.md` 〜 `prompt.md`

### Batch 11 (20件)
`psychological-safety.md` 〜 `rule-based-chatbot.md`

### Batch 12 (20件)
`saas.md` 〜 `statistical-test.md`

### Batch 13 (20件)
`stitch.md` 〜 `underfitting.md`

### Batch 14 (14件)
`unlearning.md` 〜 `zero-shot-learning.md`

---

## Verification Plan
### Automated Tests
- ローカル環境での `npm run build` による静的検証エラーの不在確認（全ファイルのフロントマターの無事など）。

### Manual Verification
- ユーザーに各バッチ完了時に生成された差分（ビジネスメリットの内容）を確認いただき、方針の合意を取りながら進めます。
