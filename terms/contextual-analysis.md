---
title: "文脈解析"
description: "前後の文章や会話の流れから代名詞の指示対象や発話意図を理解する自然言語処理の高レベルな解析工程です。"
date: "2026.04.21"
furigana: "ぶんみゃくかいせき"
category: "AI基礎概念"
---

## 文脈解析とは
文脈解析（Contextual Analysis / Discourse Analysis）は、単独の文だけでなく前後の文章や会話の流れを含めて、全体的な意図を理解する [自然言語処理](/terms/nlp) の高レベルな解析工程です。「それは楽しかったね」の「それ」が直前の会話の何を指すのかを特定する処理が代表例です。

## AIチャットの要
ChatGPTのようなAIチャットボットが過去のやり取りを踏まえた自然な応答を返せるのは、文脈解析の技術によるものです。[形態素解析](/terms/morphological-analysis)→[構文解析](/terms/syntactic-analysis)→[意味解析](/terms/semantic-analysis)→文脈解析という4段階を経てAIは人間の複雑で曖昧な言葉を理解していきます。
