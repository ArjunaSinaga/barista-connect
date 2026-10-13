"use client";

import { useCallback, useEffect, useState } from "react";
import JobsResults from "@/components/jobs/JobsResults";
import JobDetailPanel from "@/components/jobs/JobDetailPanel";

// Pembungkus instan /jobs: klik = set state klien (<100ms),
// tanpa navigasi server dan tanpa link berubah.
// Ulasan diambil malas via API ringan hanya untuk tab Ulasan.
export default function JobsBrowser({
  jobs,
  appliedIds,
  savedIds,
  showApply,
  qs,
  canApply,
  initialSelectedId = null,
  initialReviews = { avg: null, count: 0, reviews: [] },
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [reviewState, setReviewState] = useState({ id: initialSelectedId, data: initialReviews });

  const selected = selectedId ? (jobs.find((j) => j.id === selectedId) ?? null) : null;
  const reviews = reviewState.id === selected?.id ? reviewState.data : { avg: null, count: 0, reviews: [] };

  useEffect(() => {
    if (!selected) return;
    // Bila panel awal dari server, ulasan sudah ada — jangan fetch ulang.
    if (selected.id === initialSelectedId && initialReviews.count > 0) return;
    if (reviewState.id === selected.id) return;
    let cancel = false;
    fetch(`/api/jobs/${selected.id}/reviews`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancel && d) setReviewState({ id: selected.id, data: d });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = useCallback(() => setSelectedId(null), []);

  // Escape menutup panel (perilaku dialog wajar).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const selTypes = selected
    ? selected.employment_types?.length
      ? selected.employment_types
      : selected.employment_type
        ? [selected.employment_type]
        : []
    : [];
  const selCafeName = selected ? (selected.cafes?.name ?? selected.owners?.business_name ?? "-") : "";

  return (
    <div className={`fx-grid-smooth grid items-start gap-4 lg:h-full ${selected ? "lg:grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
      <div className="min-w-0">
        <JobsResults
          jobs={jobs}
          selectedId={selected?.id}
          appliedIds={appliedIds}
          savedIds={savedIds}
          showApply={showApply}
          qs={qs}
          onSelect={setSelectedId}
        />
      </div>
      {selected && (
        <div key={selected.id} className="fx-panel-enter min-w-0 xl:sticky xl:top-20">
          <JobDetailPanel
            job={selected}
            cafeName={selCafeName}
            cafeHref={selected.cafe_id ? `/cafes/${selected.cafe_id}` : null}
            types={selTypes}
            avg={reviews.avg}
            count={reviews.count}
            reviews={reviews.reviews}
            applied={appliedIds.includes(selected.id)}
            saved={savedIds.includes(selected.id)}
            canApply={canApply}
            onClose={close}
          />
        </div>
      )}
    </div>
  );
}
