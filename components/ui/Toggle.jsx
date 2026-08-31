"use client";

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-matcha" : "bg-latte"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
      {(label || description) && (
        <span>
          {label && (
            <span className="block text-sm font-bold text-espresso">
              {label}
            </span>
          )}
          {description && (
            <span className="mt-0.5 block text-xs text-espresso-soft">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
