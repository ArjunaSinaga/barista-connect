// ponytail: querySelector satu baris, ganti manual focus per form bila butuh
export function focusFirstError(errs) {
  const first = Object.keys(errs ?? {})[0];
  if (!first || typeof document === "undefined") return;
  const el = document.querySelector(`[name="${first}"]`);
  el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  el?.focus?.({ preventScroll: true });
}
