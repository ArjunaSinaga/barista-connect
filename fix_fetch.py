import pathlib, re
p = pathlib.Path('C:/Users/pongo/.config/opencode/opencode.jsonc')
t = p.read_text(encoding='utf-8')
t2 = re.sub(r',\s*"fetch"\s*:\s*\{[^}]+\}', '', t, flags=re.DOTALL)
p.write_text(t2, encoding='utf-8')
print('fetch' in t2.lower(), 'done')
