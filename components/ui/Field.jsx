"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Input({ label, error, className = "", id, type, ...props }) {
  const fieldId = id || props.name;
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-semibold text-espresso"
        >
          {label}
        </label>
      )}
      <div className="relative">
      <input
        id={fieldId}
        type={isPassword && show ? "text" : type}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-espresso outline-none transition-colors placeholder:text-[#b6a98f] focus:border-coffee focus:ring-2 focus:ring-[#3d2c1e]/15 ${
          error ? "border-red-400" : "border-white/10"
        } ${isPassword ? "pr-11" : ""} ${className}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-espresso-soft hover:text-espresso"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = "", rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.name}
          className="mb-1.5 block text-sm font-semibold text-espresso"
        >
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-espresso outline-none transition-colors placeholder:text-[#b6a98f] focus:border-coffee focus:ring-2 focus:ring-[#3d2c1e]/15 ${
          error ? "border-red-400" : "border-white/10"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options = [], placeholder, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.name}
          className="mb-1.5 block text-sm font-semibold text-espresso"
        >
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-espresso outline-none transition-colors focus:border-coffee focus:ring-2 focus:ring-[#3d2c1e]/15 ${
          error ? "border-red-400" : "border-white/10"
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
