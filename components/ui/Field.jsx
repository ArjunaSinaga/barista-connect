export function Input({ label, error, className = "", id, ...props }) {
  const fieldId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-semibold text-[#fdf6ec]"
        >
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={`w-full rounded-xl border bg-white text-[#1c1412] px-4 py-2.5 text-sm text-[#1c1412] outline-none transition-colors placeholder:text-[#1c1412]/40 focus:border-[#d4a24e] focus:ring-2 focus:ring-[#d4a24e]/20 ${
          error ? "border-red-400" : "border-[#e7ddd0]"
        } ${className}`}
        {...props}
      />
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
          className="mb-1.5 block text-sm font-semibold text-[#fdf6ec]"
        >
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-xl border bg-white text-[#1c1412] px-4 py-2.5 text-sm text-[#1c1412] outline-none transition-colors placeholder:text-[#1c1412]/40 focus:border-[#d4a24e] focus:ring-2 focus:ring-[#d4a24e]/20 ${
          error ? "border-red-400" : "border-[#e7ddd0]"
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
          className="mb-1.5 block text-sm font-semibold text-[#fdf6ec]"
        >
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border bg-white text-[#1c1412] px-4 py-2.5 text-sm text-[#1c1412] outline-none transition-colors focus:border-[#d4a24e] focus:ring-2 focus:ring-[#d4a24e]/20 ${
          error ? "border-red-400" : "border-[#e7ddd0]"
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
