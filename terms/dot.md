---
title: "DoT（Diagram of Thought）"
description: "AIの思考プロセスをグラフ構造で整理し、より高度な論理的推論を実現するLLMの推論フレームワークです。"
date: "2026.04.21"
furigana: "でぃーおーてぃー"
category: "AI基礎概念"
---

## DoTとは
DoT（Diagram of Thought）は、[LLM](/terms/llm) が複雑な問題を解く際の思考プロセスを有向非巡回グラフ（DAG）として構造化する推論フレームワークです。命題の提示→批評→修正→検証といったステップを柔軟に組み合わせ、直線的な思考よりも精度の高い論理的推論を行えます。

## 他の推論手法との比較
Chain of Thought（CoT）は直線的、Tree of Thoughts（ToT）は木構造で思考を整理しますが、DoTはグラフ構造により分岐・合流・フィードバックを含む複雑な [推論](/terms/reasoning) パターンを表現できます。[テスト時計算](/terms/test-time-compute) の効率化にも貢献する先進的なアプローチです。
