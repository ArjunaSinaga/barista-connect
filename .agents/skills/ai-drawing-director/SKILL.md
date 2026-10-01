---
name: ai-drawing-director
description: Unified AI drawing prompt director — photorealistic portraits, female portraits, SD/Midjourney/Flux/GPT-Image/Gemini adaptation, anti-AI look, image-to-prompt. Use when user wants realistic image prompt, portrait, less-AI look, or reverse-engineer a photo into prompt. Output in Indonesian explanation + English copy-paste prompt. Routes to 4 modes: ultrareal / female-portrait / intent-generator / photo-reverse.
---

# AI Drawing Director (Unified)

Gabungan 4 skill (dedup, nama baru):
1. `ultrareal-prompt-architect` — foto-realisme umum, anti-AI look, multi-model
2. `female-portrait-director` — portrait wanita dewasa, 5-paragraf director mode
3. `intelligent-prompt-generator` — intent parsing + consistency check (ethnicity/makeup/lighting)
4. `image-to-prompt` (kosong di GitHub — diganti mode reverse manual) + `sns-realistic-portrait-prompt` lokal (teknik candid/asymmetry/grain)

Aturan global:
- Penjelasan selalu Bahasa Indonesia. Prompt selalu English di code block.
- Jangan pernah keluarkan `--ar` di dalam prompt SD. Canvas diatur terpisah.
- Default fictional adult. Tolak sexualized minor, non-consensual identity, explicit nudity.
- Jangan堆 quality spam: no `8K masterpiece ultra detailed flawless perfect`.

## Router — pilih 1 mode

| User bilang | Mode | Output |
|---|---|---|
| "realistic", "less AI", "foto", umum / produk / street / landscape | `ultrareal` | Main Prompt + Negative (bila SD/MJ) + Suggested Settings |
| portrait wanita, pose/baju/style spesifik, e-commerce model | `female-portrait` | Parameter lock + 5-paragraf prompt + negative, 2 code block `text` |
| request ambigu / anime / IP character / perlu cek konsistensi ethnicity-makeup-lighting | `intent-generator` | Intent ringkas + prompt final + koreksi inkonsistensi |
| upload foto / "tirukan foto ini", bedakan pro vs amatir | `photo-reverse` | breakdown 7-slot jadi prompt + setting |

Hanya 1 mode per request. Jangan campur template.

## Mode ultrareal (default)

Urutan: Medium → Subject spesifik → Action/pose (tangan kerja nyata) → Environment (tempat+waktu+cuaca) → Lighting (sumber→arah→softness→warna→bayangan→bounce, SATU key light) → Materials (2-3 saja: kulit pori/minyak, kain lipatan, metal/glass) → Composition (satu ide + tinggi kamera + eye contact) → Camera (job-based: headshot 85-105mm f/1.8-2.8 / env 50mm / street 28-35mm / phone 24-26mm; satu identitas capture saja) → Colour relationship → Imperfection 1-4 (asymmetry, flyaway, blemish, grain) → Constraint bila perlu.

Anti-AI pass: poreless→pores+directional micro-shadow; simetri→asymmetry; jewel eyes→catchlight sesuai key; extra fingers→tangan sibuk/crop; HDR/crunchy→natural DR; floating→contact shadow.

Model dialect:
- SD/SDXL: token phrases + Negative pendek spesifik. Saran: CFG 5-8, 20-35 steps, native res (cth 832x1216 untuk 3:4).
- Midjourney: natural language + flags di akhir (`--raw --s 20-80 --ar 3:2/2:3/16:9/4:5/9:16`), `--no` hemat.
- Flux.2: no negative — masukkan constraint ke positif.
- GPT/DALL-E: kalimat penuh + kata `photorealistic`.
- Gemini/Nano Banana: shot type + subject + setting + light + angle + lens.

## Mode female-portrait

Lock semua parameter eksplisit user (jangan diganti diam-diam). Bangun 1 momen foto koheren: time slice + event kecil + action chain + gaze target + 2-3 detail lingkungan.
Final fused prompt = tepat 5 paragraf: (1) person/age/face/makeup/temperament (2) time/event/pose/action/gaze (3) body/clothing/palette/material/accessory (4) scene/detail/depth/camera/komposisi/DOF (5) lighting/filter/warna/tekstur.
Dua code block `text` terpisah: prompt & negative. Ukuran/aspect di kalimat pertama prompt.
Hanya generate image bila user eksplisit minta ("generate/generate image").

## Mode intent-generator

Parse intent: subject(gender/ethnicity/age) + clothing + hairstyle + makeup(era+culture: ancient+Chinese→traditional_chinese, modern→natural) + lighting(wajib! default natural; cinematic/neon/zhang_yimou/dramatic sesuai keyword) + atmosphere(theme/director_style) + visual_style.
Consistency check: East_Asian→brown/black eyes (tolak green/blue kecuali cosplay), ancient scene→tolak neon, anime=teknik gambar bukan ethnicity, cyberpunk=atmosphere→neon light.
Koreksi otomatis yang jelas, tanyakan yang edge-case. Supplement semantik untuk IP/character/action yang tak ada di DB (deskripsikan visual detail English).

## Mode photo-reverse (pengganti image-to-prompt kosong)

Dari foto: baca 7-slot (subject/pose/env/light/material/composition/camera/colour/imperfection) → tulis ulang jadi prompt + setting + 1 kalimat beda pro vs amatir (sensor/lensa/computational smoothing/grain/cahaya tunggal).

## Output format (semua mode)

**Penjelasan** (Indonesia, 2-3 kalimat)
**Positive prompt:** code block siap copy
**Negative prompt:** code block siap copy (atau "Not used for this model" untuk Flux/Gemini/GPT)
**Setting:** Canvas/Steps/CFG/Sampler atau flags model — hanya yang relevan, siap copy, tidak ada yang perlu dihapus user.

Quality gate (10): ide utuh, fisik mungkin, 1 logika cahaya, kamera cocok, tempat terfoto bukan composite, material benar, ada imperfection, no spam, AI-tell ter-counter, fotografer bisa motret brief ini.
