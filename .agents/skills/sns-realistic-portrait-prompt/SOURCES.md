# Sources And Decisions

## Source inventory

| Source | Trust | Contribution | Usage constraints |
|---|---|---|---|
| User-provided 30-technique brief, 2026-07-12 | Primary | Intent, technique taxonomy, four-section output | Adapted into compact runtime rules; Japanese wording not copied wholesale |
| [Midjourney Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List) and [Aspect Ratio](https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio), accessed 2026-07-12 | Primary | Parameters belong at prompt end; `--ar #:#` syntax | Platform-specific and subject to product changes |
| [Stability AI API reference](https://platform.stability.ai/docs/api-reference), accessed 2026-07-12 | Primary | Prompt, negative prompt and aspect ratio are distinct request fields | API behavior does not represent every third-party SD interface |
| [Google Gemini image generation guide](https://ai.google.dev/gemini-api/docs/image-generation) and [Gemini 2.5 Flash Image model](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image), accessed 2026-07-12 | Primary | Nano Banana family names, official model IDs, natural-language generation and editing | Model aliases and availability may change |
| [OpenAI GPT Image 2 model docs](https://developers.openai.com/api/docs/models/gpt-image-2), accessed 2026-07-12 | Primary | Official `gpt-image-2` ID, generation/editing support, no Structured Outputs | API capabilities and snapshots may change |
| Local `skill-writer` workflow and references | Primary local | Skill structure, SPEC, examples, triggers and validation | Maintenance guidance only |

## Source adaptation

- Source intent: turn short scene ideas into believable SNS portrait prompts using a selective 30-technique toolkit.
- Local target: a portable Agent Skill with strict output, platform-aware formatting and fictional subjects across genders, ages and group compositions.
- Fidelity boundary: preserve Traditional Chinese communication, pure English prompts, 3–5 selected techniques and four output sections.
- Local replacements: split Midjourney and Stable Diffusion parameter handling; replace broad quality promises with observable visual checks.
- Omitted material: repetitive Japanese explanations and the unfinished final sentence because they add no executable rule.
- Rights and attribution: user-provided material is paraphrased and structurally transformed; official docs are summarized, not reproduced.

## Decisions

| Decision | Status | Rationale |
|---|---|---|
| Classify as generic expert/generator skill | Adopted | It generates domain prompts rather than authoring skills or integrating an API |
| Use reference-backed-expert shape | Adopted | Every run needs the short workflow; deep technique lookup and platform variants are optional branches |
| Keep exact four-section response | Adopted | Explicit user contract |
| Default unspecified platform to Midjourney | Adopted | Required output explicitly ends with `--ar 3:4` |
| Put `--ar` in Stable Diffusion prompts | Rejected | Aspect ratio is normally a separate UI/API setting, not Midjourney syntax |
| Map `image2` to `gpt-image-2` | Adopted | Matches the current official OpenAI model name and user wording |
| Treat Nano Banana as one fixed model | Rejected | Official documentation uses Nano Banana, Pro and Nano Banana 2 variants |
| Offer strict JSON response mode | Adopted | User requested machine-readable output; schema preserves the four original information groups |
| Claim JSON means model-native Structured Outputs | Rejected | GPT Image 2 model documentation marks Structured Outputs unsupported |
| Restrict all portraits to adult women | Rejected | User expanded scope to multiple genders, ages and group compositions |
| Allow age-appropriate child portraits | Adopted | Ordinary non-sexual child portraits are within the updated portrait scope |
| Add scripts or subagents | Rejected | No fragile deterministic transformation or independent work units justify them |

## Coverage matrix

| Dimension | Status | Location |
|---|---|---|
| Happy path | Covered | `references/transformed-examples.md` |
| Robust/failure-aware path | Covered | `references/transformed-examples.md` |
| Anti-pattern and correction | Covered | `references/transformed-examples.md` |
| 30-technique selection | Covered | `references/technique-matrix.md` |
| Platform variance | Covered | `references/platform-adaptation.md` |
| Nano Banana variants | Covered | `references/platform-adaptation.md` |
| GPT Image 2 alias and behavior | Covered | `references/platform-adaptation.md` |
| JSON single- and multi-model schemas | Covered | `references/json-output-contract.md` |
| Output contract | Covered | `SKILL.md` |
| Safety and identity boundary | Covered | `SKILL.md`, `SPEC.md` |
| Gender and age diversity | Covered | `SKILL.md`, `references/transformed-examples.md`, `references/json-output-contract.md` |
| Real-world holdout outcomes | Gap | No user-rated generations supplied yet |

## Trigger test set

Should trigger:

- 幫我把「女生在雨天便利店門口」寫成真實人像 prompt
- 想要一張像 Threads 隨手拍、不像 AI 的成年女性照片
- 優化這段 Midjourney 人像提示詞，皮膚不要塑料感
- 給我 Stable Diffusion 的自然咖啡店肖像 prompt
- 用 Nano Banana 寫一段自然早餐人像 prompt
- Image 2 幫我做雨夜街頭人像，輸出 JSON
- 同時給 Nano Banana 2 和 GPT Image 2 的 JSON variants
- 做一張能留右側文案空間的 Instagram 真人感封面
- 幫我寫一張六十五歲男性的自然咖啡店人像 prompt
- 九歲小孩穿雨衣踩水窪，做成非擺拍的家庭照片
- 做一張非二元人物的書店街拍

Should not trigger:

- 幫我畫一隻水彩風格的貓
- 推薦一台街拍相機
- 把年齡不明的人物拍成性感成人廣告
- 分析這張照片的 EXIF
- 幫我製作動漫角色立繪

## Retrieval stopping rationale

使用者原始框架、技能編寫規範及四類目標平台的官方格式文件已涵蓋高影響決策。繼續蒐集第三方 prompt 清單只會增加風格偏見，對目前版本的執行契約收益低。

## Open gaps

- 尚無實際生成結果與使用者評分，無法校準不同模型對技巧措辭的敏感度。
- Midjourney、Stability AI、Google 與 OpenAI 會持續更新；模型 ID、參數與能力應定期重查官方文件。
