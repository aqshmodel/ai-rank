---
title: "VAE（変分オートエンコーダー）"
description: "データを潜在空間に圧縮し、そこから新しいデータを生成できるオートエンコーダの発展型。画像生成AIの基盤技術です。"
date: "2026.04.21"
furigana: "ぶいえーいー"
category: "ディープラーニング"
---

## VAEとは
VAE（Variational Autoencoder：変分オートエンコーダー）は、[オートエンコーダ](/terms/autoencoder) を確率的に拡張した [生成モデル](/terms/generative-model) です。データを「潜在空間」と呼ばれるコンパクトな表現に圧縮（エンコード）し、そこからデータを復元（デコード）する過程で [確率分布](/terms/probability-distribution) を学習します。

## 画像生成AIとの関係
Stable Diffusionなどの [拡散モデル](/terms/diffusion-model) では、画像をそのまま処理すると計算が膨大になるため、VAEで画像を潜在空間に圧縮してからノイズ除去を行い、最後にVAEのデコーダーで画像に戻す「潜在拡散モデル」方式が採用されています。生成画像の品質と計算効率の両立を可能にした重要な技術です。
