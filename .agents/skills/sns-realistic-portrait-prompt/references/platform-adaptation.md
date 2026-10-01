# 平台輸出差異

## 判斷表

| 使用者平台 | 正向提示詞 | 負向提示詞 | 長寬比 |
|---|---|---|---|
| 未指定 | 採 Midjourney 格式 | 不另列 | 末尾 `--ar 3:4` |
| Midjourney | 一段自然語言攝影描述 | 必要時才用末尾 `--no`，不要堆長清單 | 末尾 `--ar 3:4` |
| Stable Diffusion／SDXL／SD 3.x | 純描述，不含 `--` 參數 | 另列短且針對風險的 `Negative prompt:` | 在介面設定 3:4，不寫進 prompt |
| Nano Banana family | 完整、敘事式自然語言指令 | 預設不另列；把限制寫成正向、可見的要求 | 在生成設定指定 3:4，不寫 `--ar` |
| GPT Image 2 | 完整、分層清楚的自然語言指令 | 預設不另列；直接說明要避免的可見結果 | 使用生成尺寸或介面設定最接近的直幅比例 |
| 多模型 | 各輸出一版 | 只在平台確實支援且有必要時另列 | 依各平台規則 |

## Midjourney

- 把參數放在描述文字之後。
- 參數前保留一個空格，不在 `--ar 3:4` 後加標點。
- 只有當使用者指定或結果確實需要時才增加其他參數；不要預設堆入版本、stylize、quality 或 chaos。

## Stable Diffusion

- 不假設所有 WebUI、API 或模型接受相同權重語法。
- 預設使用清楚的自然英文，讓提示詞能跨 SD 介面移植。
- Negative prompt 只處理本場景的高風險缺陷，例如：`waxy skin, fused fingers, inconsistent shadows, warped perspective`。
- 不把互相重複的品質詞塞滿正負提示詞。

## Nano Banana

| 使用者稱呼 | 正式 model ID | 適用方向 |
|---|---|---|
| Nano Banana | `gemini-2.5-flash-image` | 高速度、低延遲生成與對話式編修 |
| Nano Banana Pro | `gemini-3-pro-image` | 複雜指令、專業素材與較高文字保真需求 |
| Nano Banana 2 | `gemini-3.1-flash-image` | 高效率、高量生成與編修 |

- 使用「主體 → 動作 → 場景 → 構圖 → 光線／風格」的完整句子，不輸出逗號堆疊的 tag soup。
- 使用者有附圖時，用明確動詞描述要保留與要改變的部分；不要只寫「參考這張圖」。
- 把長寬比、解析度與參考圖放在模型或 API 的相應設定中；不要附加 Midjourney 參數。
- 若使用者只說 `Nano Banana`，預設映射到 `gemini-2.5-flash-image`；只有明示 Pro 或 2 才切換。

## GPT Image 2

- 將 `Image 2`、`image2`、`GPT Image 2` 映射到正式 model ID `gpt-image-2`。
- 用自然語言交代主體、場景、構圖、光源、色彩、真實質感與必須避免的具體結果。
- 需要編修附圖時，先說明哪些內容必須保留，再列出局部修改；不要假設文字權重語法。
- 不把 JSON prompt 包裝誤寫成模型的 Structured Outputs 能力；JSON 只供工作流傳遞與儲存。

## 可攜性說明

Midjourney 的 `--ar` 是提示詞尾端參數；Stable Diffusion、Nano Banana 與 GPT Image 2 的比例和尺寸通常由生成介面或 API 欄位控制。各模型可共用場景語意，但參數、負向提示與編修語法不可假設完全相容。
