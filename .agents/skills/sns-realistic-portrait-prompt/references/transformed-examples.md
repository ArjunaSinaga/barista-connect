# 轉化範例

## Happy path：咖啡店日常照

Input: `一位六十多歲的男性在咖啡店看窗外，適合 Instagram`  
Platform: Midjourney

Output:

**【場景美學解析】**  
以窗邊柔光與使用過的咖啡杯建立「真的坐過一會兒」的生活痕跡。視線略過鏡頭、構圖保留呼吸空間，讓畫面像自然貼文而非商業棚拍。

**【本次啟用的 SKILL】**  
啟用技巧 ③ 生活感背景 + ④ 自然瞬間 + ⑥ 柔和自然光 + ㉑ 動態牆原生感 + ㉚ 自然優先

**【複製即用提示詞】**

```text
A fictional man in his mid-sixties seated beside a cafe window, turning toward the street with a quiet half-smile instead of posing for the camera, natural age lines and realistic skin texture, a partly finished coffee and a casually folded jacket on the neighboring chair, authentic lived-in cafe details, soft overcast window light with gentle falloff, relaxed feed-native composition, restrained natural color and understated photographic finish, realism over glamour --ar 3:4
```

**【大師級避坑指引】**  
若成品仍像廣告，先刪除所有「luxury、perfect、editorial」類詞，再把人物動作改成喝完咖啡後放下杯子的瞬間。

## Robust variant：兒童雨天日常

Input: `九歲小孩穿雨衣踩水窪，要像家人隨手拍`  
Platform: Stable Diffusion

Output:

**【場景美學解析】**  
兒童畫面以正在發生的遊戲動作與符合年齡的雨衣穿著建立自然感。讓雙腳與水窪接觸清楚、保留略帶歪斜的家庭快拍構圖，可避免成人時尚攝影式的違和感。

**【本次啟用的 SKILL】**  
啟用技巧 ② 手機隨手拍 + ④ 自然瞬間 + ⑨ 日常片段 + ⑮ 預防高風險部位 + ㉙ 防扭曲合成感

**【複製即用提示詞】**

```text
A fictional nine-year-old child in a practical yellow raincoat and rubber boots jumping into a shallow neighborhood puddle, laughing toward a nearby family member rather than posing for the camera, both legs clearly visible with readable knee and ankle positions, small natural splash, ordinary residential sidewalk after light rain, lightly tilted smartphone framing, soft cloudy daylight, age-appropriate candid family snapshot, realistic perspective and natural proportions
Negative prompt: adult styling, heavy makeup, fashion pose, distorted legs, extra limbs, warped boots, oversized splash, studio lighting
```

**【大師級避坑指引】**  
將畫布設為 3:4；若腿部或水花變形，降低跳躍高度，讓雙腳分開並完整落在畫面中央三分之一區域。

## Anti-pattern + correction

Bad:

```text
perfect beautiful girl, flawless porcelain skin, masterpiece, best quality, 8k, ultra detailed, cinematic, DSLR, smartphone photo, 35mm, 50mm, 85mm, dramatic soft hard lighting, no bad hands, no deformation --ar 3:4
```

Problems:

- `girl` 年齡與人物意圖不明；應依使用者提供的年齡描述，或改用中性的虛構人物稱呼。
- 完美瓷肌與真人膚理目標衝突。
- 同時指定手機、DSLR 與三種鏡頭，攝影語言互相衝突。
- `no bad hands` 不描述可見的正確姿態。
- 品質堆詞沒有提供場景資訊。

Corrected:

```text
A fictional nonbinary adult pausing at the entrance of a neighborhood bookstore, one hand resting naturally on a canvas tote strap with all fingers visible, looking slightly past the camera as if they have just noticed a friend, faint skin texture and subtle facial asymmetry, soft late-afternoon daylight from camera left with matching shadows, lightly imperfect smartphone framing, ordinary posters and a bicycle in the background, restrained true-to-life color, candid social photo --ar 3:4
```
