---
name: docx-maker
description: Use when creating/editing .docx with python-docx on Windows. Handles py launcher (py -m pip) fallback, verifies install, generates documents, and writes llm-wiki docs without filesystem_write_file failures.
license: MIT
compatibility: opencode
---

# Docx Maker

## When to Use
- Install/use `python-docx` to create/edit Word documents
- Previous `pip`/`python` commands failed with CommandNotFoundException
- Need to save result to LLM Wiki (`wiki/*.md`)

## Install (Windows - py launcher required)

`pip` and `python` are NOT on PATH. Always use `py`:

```powershell
py -m pip install python-docx --quiet
py -c "import docx; print(docx.__version__)"
# expected: 1.2.0
```

Fallback chain: `py -m pip` -> `python -m pip` -> `pip`. Verify with `py -c "import docx"`.

## Generate Document

```powershell
py -c "import docx; d=docx.Document(); d.add_heading('Title',0); d.add_paragraph('Hello World'); d.save('out.docx'); print('saved out.docx')"
```

Common API:
```python
import docx
doc = docx.Document()
doc.add_heading("Judul", 0)
doc.add_paragraph("Text")
table = doc.add_table(rows=1, cols=2)
table.cell(0,0).text = "A"
doc.save("output.docx")
```

## LLM Wiki Save (avoid Tool execution aborted)

Do NOT use `filesystem_write_file` directly to `wiki/`. Use llm-wiki tool or write to temp then verify:

1. Check allowed dirs: `filesystem_list_allowed_directories`
2. Write via `filesystem_write_file` to `wiki/<name>.md` - ensure parent `wiki/` exists
3. If `filesystem_write_file Failed: Tool execution aborted`, retry with `llm-wiki` API or `bash` fallback:
```powershell
Set-Content -LiteralPath "wiki/python-docx.md" -Value $content
```
4. Embed: `llm_wiki_embed_page` with `path=wiki/<name>.md`

Wiki page must include: install snippet with `py -m pip`, verify version, usage example, env note.

## Troubleshooting
- `NativeCommandError`/`RemoteException` on `pip install` -> switch to `py -m pip`
- `ModuleNotFoundError: No module named 'docx'` -> reinstall with `py -m pip install python-docx`
- Wiki write aborted -> check `wiki/` exists, use `Set-Content` fallback
