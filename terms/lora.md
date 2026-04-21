---
title: "LoRA"
description: "巨大AIモデルを少ない計算コストで効率的に微調整できる軽量ファインチューニング技術です。"
date: "2026.04.21"
furigana: "ろーら"
category: "ディープラーニング"
---

## LoRAとは
LoRA（Low-Rank Adaptation）は、巨大な [AIモデル](/terms/ai-model) の本体パラメータは固定したまま、小さな追加パラメータだけを学習させることで、高効率な [ファインチューニング](/terms/fine-tuning) を実現する技術です。Microsoftの研究者が2021年に発表しました。

## なぜ画期的か
[LLM](/terms/llm) のフル・ファインチューニングには膨大な [GPU](/terms/gpu) リソースが必要ですが、LoRAは必要メモリと計算量を大幅に削減します。特定のキャラクターの画風で画像を生成させたり、特定の口調で応答させたりするカスタマイズが個人のPCでも可能になり、[Hugging Face](/terms/hugging-face) では多数のLoRAアダプターが共有されています。
