"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

// H-32: error saat loker gagal dimuat — tombol coba lagi, filter di URL tetap utuh.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-espresso">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
          <TriangleAlert size={22} />
        </span>
        <h1 className="mt-4 text-lg font-extrabold">Loker gagal dimuat</h1>
        <p className="mt-1 text-sm text-espresso-soft">
          Koneksi bermasalah atau server sibuk. Filter pencarianmu tetap tersimpan.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-coffee px-6 text-sm font-bold text-white hover:bg-[#2e2015]"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
