# SNS Realistic Portrait Prompt

[繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · **English**

An agent skill that turns a short portrait idea into a natural, photorealistic, SNS-ready English prompt for Midjourney, Stable Diffusion, Nano Banana, or GPT Image 2.

Its priority is believable everyday photography over glossy AI spectacle: natural skin and texture, coherent lighting, candid expression, lived-in context, and platform-correct prompt formatting.

## What it does

- Supports fictional people of any gender, age, and group composition.
- Selects only 3–5 relevant techniques from a 30-technique realism toolkit.
- Returns either a four-part human-readable response or a strict JSON object.
- Routes prompt syntax for Midjourney, Stable Diffusion, Nano Banana, and GPT Image 2.
- Preserves age-appropriate, non-sexual treatment for children and teenagers.
- Provides scene-specific troubleshooting instead of generic quality-word stuffing.

## Quick start

Give the skill a scene idea, intended platform, and optional output format:

```text
Midjourney: a man in his sixties looking out a cafe window, suitable for Instagram, leave copy space on the right
```

For machine-readable output, add `JSON`, `API`, `structured`, or `machine-readable`:

```text
Nano Banana 2, JSON: a nine-year-old child in a raincoat jumping in a puddle, like an unposed family snapshot
```

## Default output

Unless JSON is requested, the response uses Traditional Chinese for guidance and English for the copy-ready prompt:

1. **Scene aesthetic analysis** — why the image can feel real and catch attention.
2. **Activated techniques** — the 3–5 selected techniques.
3. **Copy-ready prompt** — English only, in a code block.
4. **Master-level pitfall guidance** — one practical adjustment for that scene.

## Supported models

| Target | Prompt rule |
|---|---|
| Midjourney | Put `--ar 3:4` at the end of the prompt when 3:4 is requested. |
| Stable Diffusion / SDXL / SD 3.x | Keep Midjourney parameters out of the prompt; use the UI/API for size and add a focused negative prompt only when useful. |
| Nano Banana | Use a complete natural-language instruction. Supported aliases: Nano Banana, Nano Banana Pro, Nano Banana 2. |
| GPT Image 2 | Use a layered natural-language instruction. Supported aliases: Image 2, image2, GPT Image 2, `gpt-image-2`. |

> JSON is the skill's response wrapper for workflows. It is not a claim that the target image model accepts Structured Outputs.

## Core principles

1. Prefer naturalness over glamour.
2. Describe observable details, not empty phrases such as `masterpiece`, `8K`, or `perfect face`.
3. Use a single coherent lighting situation and an achievable pose.
4. Add hand anatomy guidance only when hands matter in the frame.
5. Do not invent a person's gender, age, ethnicity, or relationship when the user did not provide it.
6. Treat minors only in age-appropriate, non-sexual contexts.

## Installation

Copy this repository into your agent's project skill directory:

```text
.agents/skills/sns-realistic-portrait-prompt/
```

The required entry point is `SKILL.md`. Keep the `references/` directory beside it, because the skill routes to those files for model formatting, JSON output, examples, and the technique matrix.

## Repository layout

```text
.
├── SKILL.md                         # Runtime behavior and output contract
├── MANUAL.md                        # Detailed Traditional Chinese manual
├── SPEC.md                          # Scope, maintenance, and validation contract
├── SOURCES.md                       # Source provenance and decisions
└── references/
    ├── technique-matrix.md          # 30 realism techniques
    ├── platform-adaptation.md       # Per-model formatting guidance
    ├── json-output-contract.md      # JSON schemas and examples
    └── transformed-examples.md      # Happy path, robust, and anti-pattern examples
```

## Documentation

- [Detailed manual (繁體中文)](MANUAL.md)
- [Runtime instructions](SKILL.md)
- [Platform adaptation](references/platform-adaptation.md)
- [JSON output contract](references/json-output-contract.md)
- [Technique matrix](references/technique-matrix.md)

## Limitations

Text prompts reduce, but cannot guarantee the absence of, malformed hands, text, occlusion, or complex multi-person perspective. Model names, supported aspect ratios, and APIs change frequently; verify provider documentation before production integrations.
