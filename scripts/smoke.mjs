// Smoke minimal: tiap route publik kritis harus 200. Jalan: `npm run start & npm run smoke`.
// ponytail: stdlib only (fetch + assert bawaan node), tanpa framework/dep baru.
import assert from "node:assert";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const ROUTES = ["/", "/jobs", "/api/healthz"];

for (const r of ROUTES) {
  const res = await fetch(BASE + r);
  assert.equal(res.status, 200, `${r} -> ${res.status}`);
  console.log(`${r} -> 200`);
}
console.log("smoke OK");
