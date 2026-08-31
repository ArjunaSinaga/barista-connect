"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Bottom sheet on mobile, centered dialog on desktop.
 */
export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-rise relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:max-w-lg sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-espresso">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full p-1.5 text-espresso-soft hover:bg-cream-dark hover:text-espresso"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
