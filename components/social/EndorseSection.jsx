"use client";

import { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { skillLabel } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

// C1: endorse skill — tombol jempol per skill, 1 viewer = 1 endorse per skill.
export default function EndorseSection({ baristaId, skills = [], viewerId }) {
  const toast = useToast();
  const [counts, setCounts] = useState({});
  const [mine, setMine] = useState(new Set());
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!baristaId) return;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("barista_endorsements")
        .select("skill, endorser_id")
        .eq("barista_id", baristaId);
      const c = {};
      const m = new Set();
      for (const r of data ?? []) {
        c[r.skill] = (c[r.skill] ?? 0) + 1;
        if (r.endorser_id === viewerId) m.add(r.skill);
      }
      setCounts(c);
      setMine(m);
    })();
  }, [baristaId, viewerId]);

  async function toggle(skill) {
    if (!viewerId) {
      toast("Masuk dulu untuk memberi endorse", "error");
      return;
    }
    setBusy(skill);
    try {
      const supabase = createClient();
      if (mine.has(skill)) {
        const { error } = await supabase
          .from("barista_endorsements")
          .delete()
          .eq("barista_id", baristaId)
          .eq("endorser_id", viewerId)
          .eq("skill", skill);
        if (error) throw error;
        setMine((p) => { const n = new Set(p); n.delete(skill); return n; });
        setCounts((p) => ({ ...p, [skill]: Math.max(0, (p[skill] ?? 1) - 1) }));
      } else {
        const { error } = await supabase
          .from("barista_endorsements")
          .insert({ barista_id: baristaId, endorser_id: viewerId, skill });
        if (error) throw error;
        setMine((p) => new Set(p).add(skill));
        setCounts((p) => ({ ...p, [skill]: (p[skill] ?? 0) + 1 }));
      }
    } catch {
      toast("Gagal menyimpan endorse", "error");
    } finally {
      setBusy(null);
    }
  }

  if (!skills.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {skills.map((s) => {
        const endorsed = mine.has(s);
        return (
          <button
            key={s}
            type="button"
            disabled={busy === s}
            onClick={() => toggle(s)}
            className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              endorsed
                ? "bg-caramel text-white"
                : "bg-cream text-espresso hover:bg-caramel/15"
            }`}
          >
            <span>{skillLabel(s)}</span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <ThumbsUp size={13} className={endorsed ? "fill-white" : ""} />
              {counts[s] ?? 0}
            </span>
          </button>
        );
      })}
      <p className="text-[11px] text-espresso-soft">Ketuk skill untuk endorse — 1 orang 1 suara per skill.</p>
    </div>
  );
}
