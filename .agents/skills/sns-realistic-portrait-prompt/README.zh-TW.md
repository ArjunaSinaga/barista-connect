# SNS 寫實人像提示詞導演

**繁體中文** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [English](README.md)

這是一個 Agent Skill，能把簡短的人像畫面構想，轉成適用於 Midjourney、Stable Diffusion、Nano Banana 與 GPT Image 2 的純英文寫實攝影提示詞。

它優先追求像真實社群貼文般自然可信的照片感：生活痕跡、自然膚理、一致光影、非擺拍表情與正確的平台格式，而不是華麗但明顯 AI 化的視覺效果。

## 核心能力

- 支援不同性別、年齡與多人組合的虛構人物肖像。
- 從 30 項寫實技巧中，每次只精選最相關的 3–5 項。
- 可輸出四段式人類可讀格式，或嚴格可解析的 JSON。
- 自動分流 Midjourney、Stable Diffusion、Nano Banana 與 GPT Image 2 的提示詞格式。
- 兒童與青少年可用於正常、符合年齡且非性化的日常人像。
- 提供針對場景的避坑建議，而非堆疊空泛品質詞。

## 快速開始

輸入人物、動作、場景、用途與平台即可：

```text
Midjourney：六十多歲男性在咖啡店看窗外，適合 Instagram，右側留文案空間
```

若需要機器可讀結果，加上 `JSON`、`API`、`結構化` 或 `機器可讀`：

```text
Nano Banana 2，JSON：九歲小孩穿雨衣在住宅區踩水窪，像家人隨手拍
```

## 預設輸出格式

未指定 JSON 時，Skill 使用繁體中文提供解析與指引，並給出純英文 prompt：

1. **【場景美學解析】**：畫面如何兼顧真實感與 SNS 吸睛度。
2. **【本次啟用的 SKILL】**：列出本次精選的 3–5 項技巧。
3. **【複製即用提示詞】**：可直接貼用的英文提示詞。
4. **【大師級避坑指引】**：一個具體可操作的微調建議。

## 支援模型與格式規則

| 目標模型 | 輸出規則 |
|---|---|
| Midjourney | 需要 3:4 時，將 `--ar 3:4` 放在英文 prompt 最末尾。 |
| Stable Diffusion／SDXL／SD 3.x | 不將 Midjourney 參數寫入 prompt；比例在 UI/API 設定，必要時才加簡短負向提示。 |
| Nano Banana | 使用完整自然語言指令；支援 Nano Banana、Nano Banana Pro、Nano Banana 2。 |
| GPT Image 2 | 使用清楚分層的自然語言；支援 Image 2、image2、GPT Image 2、`gpt-image-2`。 |

> JSON 是本 Skill 的工作流封裝格式，不表示目標圖像模型原生支援 Structured Outputs。

## 使用原則

1. 自然感優先於華麗感。
2. 寫可見細節，不堆 `masterpiece`、`8K`、`perfect face` 等空泛字詞。
3. 光源、陰影、背景與姿勢必須能存在於同一個可拍攝場景。
4. 手入鏡時才針對手部與物件接觸進行描述。
5. 未明示時，不自行補充性別、年齡、族裔或人物關係。
6. 未成年人只處理符合年齡、非性化的內容。

## 安裝方式

將整個資料夾放入 Agent 專案的技能目錄：

```text
.agents/skills/sns-realistic-portrait-prompt/
```

入口檔案是 `SKILL.md`；請保留同層的 `references/`，因為 Skill 會依需求讀取模型格式、JSON 契約、範例與技巧矩陣。

## 檔案結構

```text
.
├── SKILL.md                         # 執行規則與輸出契約
├── MANUAL.md                        # 詳細繁體中文使用手冊
├── SPEC.md                          # 範圍、維護與驗收條件
├── SOURCES.md                       # 來源與決策紀錄
└── references/
    ├── technique-matrix.md          # 30 項寫實技巧
    ├── platform-adaptation.md       # 各模型格式差異
    ├── json-output-contract.md      # JSON schema 與範例
    └── transformed-examples.md      # 成功、穩健與反例修正
```

## 延伸文件

- [詳細使用手冊](MANUAL.md)
- [執行規則](SKILL.md)
- [模型格式差異](references/platform-adaptation.md)
- [JSON 輸出契約](references/json-output-contract.md)
- [30 項技巧矩陣](references/technique-matrix.md)

## 限制

純文字提示可降低手部、文字、遮擋與多人透視錯誤，但無法保證完全不出錯。模型名稱、可用比例與 API 會持續更新，正式整合前請再核對平台官方文件。
