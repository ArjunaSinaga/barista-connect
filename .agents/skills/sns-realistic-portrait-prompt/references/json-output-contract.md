# JSON 輸出契約

當使用者要求 JSON、API、結構化或機器可讀輸出時，輸出以下單一物件。不要包在 Markdown code fence 中。

## Schema

```json
{
  "model": "gpt-image-2",
  "mode": "text_to_image",
  "output_format": "json",
  "aspect_ratio": "3:4",
  "scene_analysis_zh_tw": "繁體中文場景解析",
  "activated_techniques": [
    {
      "id": 4,
      "name_zh_tw": "自然瞬間"
    },
    {
      "id": 14,
      "name_zh_tw": "光影一致"
    },
    {
      "id": 21,
      "name_zh_tw": "動態牆原生感"
    }
  ],
  "prompt_en": "English prompt only",
  "negative_prompt_en": null,
  "master_tip_zh_tw": "繁體中文避坑指引"
}
```

## 欄位規則

| 欄位 | 規則 |
|---|---|
| `model` | 使用正式 ID：`midjourney`、使用者指定的 SD model ID、`gemini-2.5-flash-image`、`gemini-3-pro-image`、`gemini-3.1-flash-image` 或 `gpt-image-2` |
| `mode` | 無附圖時為 `text_to_image`；有附圖且要求修改時為 `image_edit` |
| `output_format` | 固定為 `json` |
| `aspect_ratio` | 預設 `3:4`；使用者明示其他比例時覆蓋 |
| `scene_analysis_zh_tw` | 2–3 句繁體中文，不使用 Markdown |
| `activated_techniques` | 3–5 個物件，`id` 為 1–30 的整數且與 prompt 對應 |
| `prompt_en` | 純英文；依模型規則決定是否包含平台參數 |
| `negative_prompt_en` | Stable Diffusion 有必要時使用英文字串；其他模型預設 `null` |
| `master_tip_zh_tw` | 一個可執行的繁體中文建議 |

## 多模型輸出

使用者要求多模型 JSON 時，保留頂層共同分析並把模型版本放進 `variants`：

```json
{
  "output_format": "json",
  "aspect_ratio": "3:4",
  "scene_analysis_zh_tw": "繁體中文場景解析",
  "activated_techniques": [
    {
      "id": 4,
      "name_zh_tw": "自然瞬間"
    },
    {
      "id": 6,
      "name_zh_tw": "柔和自然光"
    },
    {
      "id": 21,
      "name_zh_tw": "動態牆原生感"
    }
  ],
  "variants": [
    {
      "model": "gemini-2.5-flash-image",
      "mode": "text_to_image",
      "prompt_en": "English Nano Banana prompt",
      "negative_prompt_en": null
    },
    {
      "model": "gpt-image-2",
      "mode": "text_to_image",
      "prompt_en": "English GPT Image 2 prompt",
      "negative_prompt_en": null
    }
  ],
  "master_tip_zh_tw": "繁體中文避坑指引"
}
```

## Nano Banana JSON 範例

```json
{
  "model": "gemini-2.5-flash-image",
  "mode": "text_to_image",
  "output_format": "json",
  "aspect_ratio": "3:4",
  "scene_analysis_zh_tw": "以晨間窗光與使用中的早餐桌建立生活痕跡。人物在動作中短暫望向窗外，使畫面更像自然發布的社群照片。",
  "activated_techniques": [
    {
      "id": 3,
      "name_zh_tw": "生活感背景"
    },
    {
      "id": 4,
      "name_zh_tw": "自然瞬間"
    },
    {
      "id": 6,
      "name_zh_tw": "柔和自然光"
    },
    {
      "id": 30,
      "name_zh_tw": "自然優先"
    }
  ],
  "prompt_en": "Create a realistic vertical social photograph of a fictional man in his early seventies preparing breakfast beside an apartment window. Capture him halfway through placing a slice of toast on an ordinary ceramic plate, glancing toward the morning street instead of posing for the camera. Keep natural age lines, a used coffee mug, folded dish towel, and a few breakfast crumbs visible as believable lived-in details. Use soft window light with gentle falloff, restrained true-to-life color, realistic skin texture, believable fabric folds, and lightly imperfect smartphone framing. Favor an understated candid moment over polished glamour.",
  "negative_prompt_en": null,
  "master_tip_zh_tw": "若畫面仍像型錄，增加一個正在發生的動作，並刪除 luxury、perfect、editorial 等廣告化詞彙。"
}
```

## GPT Image 2 JSON 範例

```json
{
  "model": "gpt-image-2",
  "mode": "text_to_image",
  "output_format": "json",
  "aspect_ratio": "3:4",
  "scene_analysis_zh_tw": "以雨後街角的單一暖光建立視覺焦點，濕地反射只作陪襯。清楚交代手與雨傘的接觸，可降低肢體和道具融合的風險。",
  "activated_techniques": [
    {
      "id": 8,
      "name_zh_tw": "偏離鏡頭視線"
    },
    {
      "id": 11,
      "name_zh_tw": "手部完整"
    },
    {
      "id": 14,
      "name_zh_tw": "光影一致"
    },
    {
      "id": 17,
      "name_zh_tw": "電影空氣感"
    }
  ],
  "prompt_en": "Create a realistic vertical portrait of a fictional nonbinary adult waiting at a quiet street corner just after rain. They hold a closed transparent umbrella at their side with a relaxed hand and clearly visible, naturally spaced fingers, while looking toward an approaching bus rather than at the camera. A single warm convenience-store light illuminates the left side of their face and produces matching soft shadows. Keep the wet pavement reflections restrained, the background slightly out of focus, the skin texture natural, and the overall color believable. The result should feel like an unplanned cinematic moment photographed for a personal social feed, not a fashion advertisement. Avoid waxy skin, fused fingers, warped umbrella geometry, conflicting light directions, and excessive neon saturation.",
  "negative_prompt_en": null,
  "master_tip_zh_tw": "若手與雨傘仍融合，把握柄完整放進身體輪廓之外，避免手部與深色衣服重疊。"
}

## 驗證

- 用標準 JSON parser 可直接解析。
- 所有 key 使用雙引號；不得使用註解、尾逗號、`undefined` 或 Markdown。
- `activated_techniques` 數量為 3–5，且每項都能在 `prompt_en` 找到語意對應。
- `negative_prompt_en` 沒有內容時使用 `null`，不要使用空字串或省略欄位。
