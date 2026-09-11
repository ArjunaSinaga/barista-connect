export async function isPwned(password) {
  try {
    const enc = new TextEncoder().encode(password);
    const buf = await crypto.subtle.digest("SHA-1", enc);
    const hash = [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
    const prefix = hash.slice(0,5), suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { "Add-Padding": "true" }});
    if (!res.ok) return false; // fail open
    const text = await res.text();
    return text.split("\n").some(l => l.split(":")[0].trim() === suffix);
  } catch { return false; }
}
