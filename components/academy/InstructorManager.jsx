"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

// ponytail: instruktur = array {name, credential}; tanpa tabel baru.
export default function InstructorManager({ academyId, initial }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [credential, setCredential] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(next) {
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("academy_profiles")
        .update({ instructors: next, updated_at: new Date().toISOString() })
        .eq("id", academyId);
      if (error) throw error;
      router.refresh();
    } catch {
      toast("Gagal menyimpan instruktur", "error");
    } finally {
      setBusy(false);
    }
  }

  const list = initial ?? [];

  return (
    <div>
      {list.length === 0 && (
        <p className="text-xs text-espresso-soft">Belum ada instruktur. Tambahkan nama + kredensial (cth. SCA AST, Q Grader).</p>
      )}
      <ul className="space-y-2">
        {list.map((ins, i) => (
          <li key={`${ins.name}-${i}`} className="flex items-center justify-between gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3 py-2 text-xs">
            <span className="min-w-0 truncate">
              <span className="font-bold text-espresso">{ins.name}</span>
              {ins.credential && <span className="text-espresso-soft"> · {ins.credential}</span>}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => save(list.filter((_, j) => j !== i))}
              className="shrink-0 font-bold text-red-600 hover:underline disabled:opacity-50"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          save([...list, { name: name.trim(), credential: credential.trim() }]);
          setName("");
          setCredential("");
        }}
      >
        <label htmlFor="ins-name" className="sr-only">Nama instruktur</label>
        <input
          id="ins-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama instruktur"
          maxLength={80}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-white px-3 text-xs text-espresso outline-none placeholder:text-[#b6a98f] focus:border-coffee"
        />
        <label htmlFor="ins-cred" className="sr-only">Kredensial</label>
        <input
          id="ins-cred"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          placeholder="Kredensial (cth. SCA AST)"
          maxLength={80}
          autoComplete="off"
          className="h-9 min-w-0 flex-1 rounded-full border border-[#e0d5bd] bg-white px-3 text-xs text-espresso outline-none placeholder:text-[#b6a98f] focus:border-coffee"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-coffee px-4 text-[11px] font-bold text-white hover:bg-[#2e2015] disabled:opacity-50"
        >
          Tambah
        </button>
      </form>
    </div>
  );
}
