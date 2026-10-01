# SNS 寫實人像提示詞導演：使用說明書

## 1. 這個 Skill 是什麼

`sns-realistic-portrait-prompt` 是一個把簡短人物畫面構想，轉為可直接用於 Midjourney、Stable Diffusion、Nano Banana 與 GPT Image 2 的英文寫實攝影提示詞的 Skill。

它的目標不是追求誇張華麗的 AI 圖，而是產出像真實社群貼文般自然、有生活感、能在快速滑動中吸引注意，又不會充滿塑料膚質、過度擺拍或合成感的畫面。

它支援女性、男性、兒童、青少年、長者、非二元人物，以及多人群像。人物的性別、年齡與關係只有在使用者明示時才寫入提示詞；資訊不足時，Skill 使用中性的 `a fictional person` 或 `a fictional group of people`，不自行編造人物設定。

## 2. 適用情境與不適用情境

### 適合使用

- 「幫我把『雨天便利店門口的人』寫成寫實人像 prompt。」
- 「要一張像 Threads 隨手拍、沒有 AI 感的照片。」
- 「做一張能留右側文案空間的 Instagram 人像封面。」
- 「給我 Nano Banana 2 的自然早餐人像 JSON。」
- 「把這段 Midjourney 人像 prompt 改掉塑料感與擺拍感。」
- 「九歲小孩穿雨衣踩水窪，要像家人拍到的日常照片。」
- 「做一張兩位長者在公園下棋的自然群像。」

### 不適合使用

- 非人物主導的題材，例如純風景、產品 3D 渲染、工程圖。
- 純動漫、插畫、像素風需求。
- 單純的相機選購、EXIF 分析或真實拍攝器材教學。
- 要求精確複製名人、私人真人或照片中人物身份的需求。
- 將未成年人或年齡不明人物性化、成人化或放進不合年齡情境的需求。

## 3. 快速開始

最簡單的輸入只需要：**人物／動作／場景／平台或用途**。

```text
Midjourney：六十多歲男性在咖啡店看窗外，適合 Instagram，右側留文案空間
```

Skill 會預設回傳四段內容：

1. 【場景美學解析】——說明如何讓畫面看起來真實、吸睛。
2. 【本次啟用的 SKILL】——列出精選的 3–5 項技巧。
3. 【複製即用提示詞】——只含英文，可直接貼到目標平台。
4. 【大師級避坑指引】——針對場景提供一個可操作修正。

若要機器可讀結果，直接加上 `JSON`、`API`、`結構化` 或 `機器可讀`：

```text
Nano Banana 2，JSON：九歲小孩穿雨衣在住宅區踩水窪，像家人隨手拍
```

此時輸出會改為一個可解析的 JSON object，不會再使用四段標題。

## 4. Skill 的工作流程

Skill 每次執行時依序完成下列決策：

| 步驟 | 做什麼 | 原因 |
|---|---|---|
| 1 | 擷取人物、動作、神情、場景、服裝、光線、構圖、SNS 用途、模型與輸出格式 | 把抽象構想變成可拍攝的場景 |
| 2 | 未給足資訊時採保守預設：虛構人物、日常場景、3:4 直幅、非名人、非廣告式擺拍 | 降低臆測與商業棚拍感 |
| 3 | 從 30 項技巧中挑 3–5 項 | 精準處理本次畫面的真實感與高風險部位 |
| 4 | 先寫可見事實，再寫攝影語言 | 避免只堆「masterpiece、8K」等空泛詞 |
| 5 | 檢查動作、光源、背景、陰影、景深是否能存在於同一場景 | 降低合成感與物理矛盾 |
| 6 | 選擇四段式或 JSON | 兼顧人類閱讀與工作流串接 |
| 7 | 依模型格式輸出 | 避免把 Midjourney 參數誤貼到其他平台 |

## 5. 30 項技巧如何使用

每張圖只選 3–5 項，而不是把 30 項全部塞進 prompt。選擇原則是：至少一項處理「真實感」、一項處理「場景風險」、一項處理「氛圍或 SNS 用途」。

### A. 真實存在感與照片感（①–⑩）

| 編號 | 技巧 | 何時選用 | 對應英文方向 |
|---|---|---|---|
| ① | SNS 真實存在感 | 日常貼文、個人帳號 | `fictional person, authentic social post` |
| ② | 手機隨手拍 | 限動、Threads、家庭快拍 | `smartphone photo, lightly imperfect framing` |
| ③ | 生活感背景 | 咖啡店、住家、日常空間 | `used mug, folded jacket, ordinary objects` |
| ④ | 自然瞬間 | 想減少擺拍臉 | `mid-gesture, relaxed expression, unposed` |
| ⑤ | 真實膚色 | 特寫、易出現美肌感 | `visible pores, subtle tonal variation` |
| ⑥ | 柔和自然光 | 窗邊、陰天、清晨 | `soft window light, gentle falloff` |
| ⑦ | 淺景深 | 讓人物從背景中自然浮現 | `lightly blurred background, optical bokeh` |
| ⑧ | 偏離鏡頭視線 | 想要放鬆、不直盯鏡頭 | `gaze slightly off-camera` |
| ⑨ | 日常片段 | 需要「正在發生」的感覺 | `candid slice-of-life portrait` |
| ⑩ | 手機直出色調 | 避免濃重濾鏡 | `restrained color, natural white balance` |

### B. 防崩壞與一致性（⑪–⑮）

| 編號 | 技巧 | 何時選用 | 實作重點 |
|---|---|---|---|
| ⑪ | 手部完整 | 手持物、托腮、全身照 | 寫清楚手與物件的接觸、手指位置 |
| ⑫ | 臉部微不對稱 | 臉部特寫 | 用自然左右差降低假人感 |
| ⑬ | 邊界清晰 | 捲髮、蕾絲、逆光 | 指明髮絲、布料、肌膚邊界可辨識 |
| ⑭ | 光影一致 | 混合光、室內外、夜景 | 指定單一主要光向與相符陰影 |
| ⑮ | 預防高風險部位 | 跳躍、肢體交疊、遮擋 | 簡化姿勢，讓關節與重疊關係清楚 |

### C. 專業氛圍與 SNS 構圖（⑯–㉕）

| 編號 | 技巧 | 何時選用 | 實作重點 |
|---|---|---|---|
| ⑯ | 適度留白 | 封面、專業肖像 | 保留人物周邊呼吸空間 |
| ⑰ | 電影空氣感 | 有故事性的畫面 | 用環境深度與克制色彩建立張力 |
| ⑱ | 清爽親和 | 個人品牌、生活方式 | 乾淨日常穿著與友善表情 |
| ⑲ | 收藏感 | Instagram 主貼文 | 一個可信但有記憶點的視覺母題 |
| ⑳ | 一秒世界觀 | 縮圖、快速滑動 | 一個主色或主環境訊號即可 |
| ㉑ | 動態牆原生感 | 非廣告感貼文 | 像使用者真正會發的構圖 |
| ㉒ | 頭像／封面裁切 | 頭像、封面 | 臉與肩清楚，保留安全裁切邊界 |
| ㉓ | 滑動攔截力 | 縮圖中也要看得懂 | 拉開臉部與背景的明度或色彩差 |
| ㉔ | 商業留白 | 後續要加標題或 CTA | 指明左或右側的乾淨留白 |
| ㉕ | 受眾共鳴 | 目標族群明確 | 服裝、表情、背景符合受眾生活脈絡 |

### D. 最終品質控制（㉖–㉚）

| 編號 | 技巧 | 何時選用 | 實作重點 |
|---|---|---|---|
| ㉖ | 去 AI 裝飾 | 過度華麗、皮膚塑料 | 移除合成光澤與多餘裝飾 |
| ㉗ | 照片可信度 | 高擬真要求 | 曝光、材質、細節符合物理直覺 |
| ㉘ | 全域細節清理 | 近景、高解析檢視 | 髮、皮膚、衣料、背景均連貫 |
| ㉙ | 防扭曲合成感 | 廣角、多人、複雜肢體 | 自然透視、乾淨遮擋、避免變形 |
| ㉚ | 自然優先 | 容易過度風格化的任何場景 | 把自然性放在華麗感之前 |

### 常用組合

| 場景 | 建議技巧起點 |
|---|---|
| 咖啡店日常照 | ③ + ④ + ⑥ + ㉑ + ㉚ |
| 手持商品但不似廣告 | ④ + ⑪ + ⑭ + ㉑ + ㉕ |
| 頭像或品牌封面 | ⑤ + ⑫ + ⑱ + ㉒ + ㉔ |
| 夜間街頭人像 | ⑧ + ⑬ + ⑭ + ⑰ + ㉙ |
| 手機自拍感 | ② + ⑤ + ⑩ + ㉓ + ㉚ |

## 6. 英文提示詞的組裝順序

英文 prompt 應依下列順序排列：

```text
[核心主體] + [動作與神情] + [場景與生活細節] + [構圖] + [光線與照片質感] + [平台參數（僅限需要時）]
```

範例：

```text
A fictional man in his mid-sixties seated beside a cafe window, turning toward the street with a quiet half-smile instead of posing for the camera, natural age lines and realistic skin texture, a partly finished coffee and a casually folded jacket on the neighboring chair, authentic lived-in cafe details, soft overcast window light with gentle falloff, relaxed feed-native composition, restrained natural color and understated photographic finish, realism over glamour --ar 3:4
```

避免使用以下堆詞，它們通常無法增加可控性，反而會讓畫面過度加工：

```text
perfect face, flawless skin, masterpiece, best quality, 8K ultra detailed, CGI, doll-like
```

也不要同時寫手機、DSLR、35mm、50mm、85mm 或相互衝突的「hard light」與「soft light」。每張圖只保留一組能解釋畫面的攝影語言。

## 7. 四種模型的輸出規則

| 模型 | 何時使用 | Prompt 寫法 | 比例與限制 |
|---|---|---|---|
| Midjourney | 需要直接貼進 Imagine bar | 自然語言描述，末尾才加參數 | 使用 `--ar 3:4`，前面留一個空格，後面不加標點 |
| Stable Diffusion／SDXL／SD 3.x | 需要正、負 prompt 控制 | 正向 prompt 純描述；必要時另列短的 negative prompt | 比例在 WebUI 或 API 設定，不把 `--ar` 寫入 prompt |
| Nano Banana | 需要快速、多模態或對話式編修 | 用完整敘事句，描述主體→動作→場景→構圖→光線 | 在介面／API 設定比例與參考圖，不加 Midjourney 參數 |
| GPT Image 2 | 需要高品質生成或編修 | 用完整、分層清楚的自然語言，直接交代要避免的可見結果 | 使用生成尺寸或介面比例設定，不加 Midjourney 參數 |

### 7.1 Midjourney

Midjourney 的參數必須置於 prompt 最後。例如：

```text
... restrained true-to-life color --ar 3:4
```

不要寫成 `--ar 3:4,`，也不要在參數後再加描述。只有使用者有明確理由時才增加 `--no`、`--stylize`、版本或其他控制參數。[Midjourney Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)

### 7.2 Stable Diffusion

Stable Diffusion 的正向與負向描述分開。負向 prompt 只處理本次場景的具體風險，不寫泛用超長清單：

```text
Negative prompt: waxy skin, fused fingers, inconsistent shadows, warped perspective
```

比例通常是 API／介面欄位；不同端點可接受的比例不同。Stability 官方部分端點採固定 `aspect_ratio` 列舉值，若沒有 3:4，請改選該端點可用的最接近直幅比例，而不是把 `--ar 3:4` 貼進正向 prompt。[Stability AI API reference](https://platform.stability.ai/docs/api-reference)

### 7.3 Nano Banana 家族

| 使用者說法 | 正式 model ID | 主要定位 |
|---|---|---|
| Nano Banana | `gemini-2.5-flash-image` | 高速度、低延遲、對話式編修 |
| Nano Banana Pro | `gemini-3-pro-image` | 複雜指令、專業素材與文字保真 |
| Nano Banana 2 | `gemini-3.1-flash-image` | 高效率、高量生成與編修 |

Nano Banana 偏好完整、具體的敘事式指令。若附上參考圖，應寫清楚「保留什麼」與「改變什麼」，例如：

```text
Preserve the subject's overall pose and the linen jacket from the reference image. Replace only the background with a quiet neighborhood bookstore, keep the same soft daylight direction, and make the result feel like a candid personal social photo.
```

Google 將 Nano Banana 定義為 Gemini 的原生圖像生成能力；模型名稱與可用變體可能更新，製作正式串接時請再核對官方模型頁。[Google Gemini image generation guide](https://ai.google.dev/gemini-api/docs/image-generation)

### 7.4 GPT Image 2

將 `Image 2`、`image2`、`GPT Image 2` 對應到 `gpt-image-2`。對附圖編修，先說明必須保留的內容，再提出局部改動。對純文字生成，直接描述畫面與想避免的可見失敗，而非假設權重語法存在。

```text
Create a realistic vertical portrait of a fictional nonbinary adult waiting at a quiet street corner just after rain. Keep the wet pavement reflections restrained, use one warm convenience-store light with matching soft shadows, and avoid waxy skin, fused fingers, warped umbrella geometry, and excessive neon saturation.
```

GPT Image 2 支援生成與編修，但模型頁標示不支援 Structured Outputs。因此本 Skill 的 JSON 是「提示詞工作流封裝」，不是要傳給 GPT Image 2 的 Structured Output schema。[GPT Image 2 model documentation](https://developers.openai.com/api/docs/models/gpt-image-2)

## 8. JSON 輸出模式

當使用者明示 JSON、API、結構化或機器可讀時，Skill 只輸出單一有效 JSON object：不加 Markdown code fence、不加前言、不加註解，也不加尾逗號。

### 單模型 schema

```json
{
  "model": "gpt-image-2",
  "mode": "text_to_image",
  "output_format": "json",
  "aspect_ratio": "3:4",
  "scene_analysis_zh_tw": "繁體中文場景解析",
  "activated_techniques": [
    {"id": 4, "name_zh_tw": "自然瞬間"},
    {"id": 14, "name_zh_tw": "光影一致"},
    {"id": 21, "name_zh_tw": "動態牆原生感"}
  ],
  "prompt_en": "English prompt only",
  "negative_prompt_en": null,
  "master_tip_zh_tw": "繁體中文避坑指引"
}
```

欄位說明：

| 欄位 | 用途 |
|---|---|
| `model` | 使用正式 model ID；Midjourney 可用 `midjourney` |
| `mode` | `text_to_image` 或有參考圖修改時的 `image_edit` |
| `output_format` | 固定 `json` |
| `aspect_ratio` | 預設 `3:4`；以使用者指定比例為準 |
| `scene_analysis_zh_tw` | 2–3 句繁中場景與真實感解析 |
| `activated_techniques` | 3–5 項已啟用技巧，需和 prompt 語意一致 |
| `prompt_en` | 純英文 prompt，依平台規則決定是否含參數 |
| `negative_prompt_en` | Stable Diffusion 有必要才填英文字串；其他模型預設 `null` |
| `master_tip_zh_tw` | 一個可以立刻執行的繁中修正建議 |

多模型輸出時，保留共同的分析與技巧清單，並把每個模型的 `model`、`mode`、`prompt_en` 與 `negative_prompt_en` 放入 `variants` 陣列。

## 9. 人物多樣性與安全邊界

### 年齡、性別與關係

- 使用者有指定時，忠實寫入，例如「六十五歲男性」、「非二元人物」、「兩位姊妹」、「九歲小孩」。
- 使用者未指定時，不補充性別、年齡、族裔或私人關係。
- 虛構人物是預設；涉及真實人物時，改用非識別性外觀與氛圍描述，避免承諾精確複製身份。

### 兒童與青少年

可以製作正常、非性化的兒童與青少年人像。例如校園、家庭、運動、節慶、雨天遊戲、閱讀或旅遊紀錄。服裝、姿勢、妝容、情境與鏡頭語言都必須合乎年齡。

不可製作未成年人或年齡不明人物的性化、成人化、誘惑性或不合年齡內容。

## 10. 最終品質檢查表

輸出前逐項確認：

- [ ] 主體、動作、光源、背景與景深可以存在於同一個真實場景。
- [ ] 只啟用 3–5 項技巧，且每一項都能在 prompt 中找到對應描述。
- [ ] 人物性別、年齡與關係沒有超出使用者提供的資訊。
- [ ] 手入鏡時，有交代手與物件、身體或表面的關係。
- [ ] 夜景或混合光只有一個合理主光向，陰影相符。
- [ ] 沒有 `perfect face`、`flawless skin`、`masterpiece` 等品質堆詞。
- [ ] Midjourney 的 `--ar` 在末尾；其他模型沒有 Midjourney 參數。
- [ ] Stable Diffusion 的 negative prompt 只針對此場景風險。
- [ ] JSON 模式能被標準 JSON parser 解析，且沒有 Markdown 包裝。
- [ ] 未成年人內容符合年齡且非性化。

## 11. 常見問題與修正

| 症狀 | 常見原因 | 修正方式 |
|---|---|---|
| 看起來像 AI 美妝廣告 | `perfect`、`flawless`、過度棚拍詞太多 | 加入生活痕跡、自然動作、真實膚理；移除奢華與完美詞 |
| 表情很僵 | 直盯鏡頭、只有姿勢沒有事件 | 改為看向窗外、朋友、路人或正在做的事 |
| 手指／物件融合 | 手部與道具關係不清 | 描述手指位置、握法、接觸面；必要時改腰上構圖 |
| 人物像貼在背景上 | 光源與陰影未統一 | 指定單一主光方向，讓臉、衣物和地面陰影一致 |
| 畫面太擁擠 | 每項需求都放進同一張圖 | 只保留一個主動作、一個視覺焦點與一組生活細節 |
| SD 貼上後比例無效 | 把 Midjourney 參數誤貼進 SD | 移除 `--ar`，在 WebUI／API 比例欄位設定 |
| JSON 無法被程式讀取 | 有 code fence、註解、尾逗號或空欄位 | 只輸出 JSON object；空負向提示用 `null` |

## 12. 維護與版本注意事項

- Midjourney、Stability AI、Google Gemini 與 OpenAI 的模型名稱、比例選項、參數及功能可能改版。
- 每次改動平台語法時，先更新 `references/platform-adaptation.md`，再同步修改本手冊。
- 收集成功與失敗的實際生成案例後，可補進 `references/transformed-examples.md`，讓技術選擇更貼近特定模型。
- 本 Skill 能降低失敗率，但無法保證所有圖像模型都不會出現手部、文字、遮擋或多人透視錯誤。

## 13. 檔案結構

```text
sns-realistic-portrait-prompt/
├── SKILL.md                         # 執行規則與輸出契約
├── MANUAL.md                        # 本說明書
├── SPEC.md                          # 維護範圍與驗收條件
├── SOURCES.md                       # 來源、決策與已知缺口
└── references/
    ├── technique-matrix.md          # 30 技巧矩陣
    ├── platform-adaptation.md       # 各模型提示詞差異
    ├── json-output-contract.md      # JSON schema 與範例
    └── transformed-examples.md      # 成功、穩健與反例修正
```

這個結構把「每次都要遵守的規則」留在 `SKILL.md`，把需要時才查看的細節放在 `references/`，以維持執行效率與可維護性。
