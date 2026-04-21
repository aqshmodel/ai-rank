---
title: "学習率"
description: "モデルのパラメータを更新する際の「歩幅」を決める係数。大きすぎても小さすぎても学習がうまくいきません。"
date: "2026.04.21"
furigana: "がくしゅうりつ"
category: "AI基礎概念"
---

## 学習率とは
学習率（Learning Rate）は、[機械学習](/terms/machine-learning) のモデルが [損失関数](/terms/loss-function) の値を減らすために [パラメータ](/terms/parameter) を更新する際の「歩幅」を制御する [ハイパーパラメータ](/terms/hyperparameter) です。山の斜面を下って谷底（最適解）を探す際の一歩の大きさに例えられます。

## 設定のバランス
学習率が大きすぎると最適解を飛び越えてしまい学習が不安定になり、小さすぎると収束に時間がかかりすぎたり [局所最適解](/terms/local-global-optimum) に留まったりします。学習の途中で学習率を徐々に小さくする「学習率スケジューリング」や、AdamやSGDなどの [最適化アルゴリズム](/terms/optimization-algorithm) が適切な学習率調整を支援します。
