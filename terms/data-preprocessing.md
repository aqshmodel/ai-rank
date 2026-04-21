---
title: "データ前処理"
description: "生データを整形・変換してAIが学習しやすい状態に整える工程。AI開発で最も時間を費やす作業です。"
date: "2026.04.21"
furigana: "でーたぜんしょり"
category: "データサイエンス"
---

## データ前処理とは
データ前処理（Data Preprocessing）は、収集した生のデータを [機械学習](/terms/machine-learning) モデルが学習しやすい形に整える工程です。[欠損値](/terms/missing-value) の補完、[外れ値](/terms/outlier) の除去、データ形式の統一、[正規化](/terms/normalization)、カテゴリ変数の数値変換などが含まれます。

## AI開発の要
実務ではAI開発の全工程のうち70〜80%がデータ前処理に費やされるとも言われます。[Pandas](/terms/pandas) や [NumPy](/terms/numpy) がこの工程の主役ツールであり、前処理の品質がモデルの精度を大きく左右します。「Garbage In, Garbage Out（ゴミを入れればゴミが出る）」という格言が示すとおり、どれだけ優れたアルゴリズムもデータの質が悪ければ意味をなしません。
