# SNS リアル人物ポートレート・プロンプト

[繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · **日本語** · [English](README.md)

短い人物シーンのアイデアを、Midjourney、Stable Diffusion、Nano Banana、GPT Image 2 で使える英語の写実ポートレート用プロンプトへ変換する Agent Skill です。

派手で AI らしい演出よりも、実在する SNS 投稿のような自然さを優先します。生活感のある背景、自然な肌の質感、一貫した光、作り込み過ぎない表情、各プラットフォームに合った書式を重視します。

## 主な機能

- 性別、年齢、人数を問わない架空人物のポートレートに対応。
- 30 個の写実化テクニックから、各画像に必要な 3〜5 個だけを選択。
- 人が読みやすい 4 部構成、または厳密に解析可能な JSON を出力。
- Midjourney、Stable Diffusion、Nano Banana、GPT Image 2 の形式を自動で切り替え。
- 子どもとティーンの人物像は、年齢に適した非性的な日常表現に限定。
- 一般論ではなく、その場面に合わせた失敗回避の助言を提示。

## クイックスタート

人物、動作、場面、用途、プラットフォームを入力します。

```text
Midjourney：60代の男性がカフェの窓から外を見る、Instagram向け、右側にコピー用の余白
```

機械可読の出力が必要な場合は、`JSON`、`API`、`構造化`、`machine-readable` を追加します。

```text
Nano Banana 2、JSON：9歳の子どもが雨具で住宅街の水たまりを踏む、家族が偶然撮った写真のように
```

## 標準の出力形式

JSON を指定しない場合、Skill は繁体字中国語の案内と英語のコピペ用プロンプトを返します。

1. **【場景美學解析】**：リアルさと SNS での視認性を作る方法。
2. **【本次啟用的 SKILL】**：今回選んだ 3〜5 個のテクニック。
3. **【複製即用提示詞】**：そのまま使える英語プロンプト。
4. **【大師級避坑指引】**：場面固有の実用的な調整案。

## 対応モデルと書式

| 対象 | 出力ルール |
|---|---|
| Midjourney | 3:4 が必要な場合、英語 prompt の末尾に `--ar 3:4` を置く。 |
| Stable Diffusion／SDXL／SD 3.x | Midjourney のパラメータを prompt に入れない。比率は UI/API で設定し、必要な時だけ短い negative prompt を追加する。 |
| Nano Banana | 完全な自然言語の指示文を使う。Nano Banana、Nano Banana Pro、Nano Banana 2 に対応。 |
| GPT Image 2 | 階層の明確な自然言語を使う。Image 2、image2、GPT Image 2、`gpt-image-2` に対応。 |

> JSON はこの Skill のワークフロー用ラッパーです。対象モデルが Structured Outputs を受け取るという意味ではありません。

## 使用原則

1. 華やかさより自然さを優先する。
2. `masterpiece`、`8K`、`perfect face` のような空疎な品質語を重ねず、見える事実を記述する。
3. 光源、影、背景、姿勢が一つの撮影可能な場面として成立するようにする。
4. 手が重要な画面でのみ、手と物体の接触関係を詳しく書く。
5. 指定がない限り、性別、年齢、民族性、人物関係を勝手に補わない。
6. 未成年は年齢に合った非性的な内容だけを扱う。

## インストール

このリポジトリ全体を Agent プロジェクトの Skill ディレクトリにコピーします。

```text
.agents/skills/sns-realistic-portrait-prompt/
```

エントリーポイントは `SKILL.md` です。モデル書式、JSON 契約、例、テクニック表を必要に応じて読むため、同階層の `references/` を残してください。

## リポジトリ構成

```text
.
├── SKILL.md                         # 実行ルールと出力契約
├── MANUAL.md                        # 詳細な繁体字中国語マニュアル
├── SPEC.md                          # 範囲、保守、検証契約
├── SOURCES.md                       # 情報源と設計判断
└── references/
    ├── technique-matrix.md          # 30 の写実化テクニック
    ├── platform-adaptation.md       # モデル別の書式ガイド
    ├── json-output-contract.md      # JSON schema と例
    └── transformed-examples.md      # 正常例、堅牢例、アンチパターン
```

## ドキュメント

- [詳細マニュアル（繁體中文）](MANUAL.md)
- [実行ルール](SKILL.md)
- [モデル別書式](references/platform-adaptation.md)
- [JSON 出力契約](references/json-output-contract.md)
- [30 テクニック表](references/technique-matrix.md)

## 制限事項

テキストプロンプトは手、文字、遮蔽、複数人物の遠近法の失敗を減らせますが、完全には保証できません。モデル名、利用可能な比率、API は変わるため、本番統合の前に各プラットフォームの公式ドキュメントを確認してください。
