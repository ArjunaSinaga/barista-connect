-- Rating Shield: sembunyikan rating negatif dari publik (soft-hide, data tetap).
-- Simetris: barista sembunyikan ratings tentang dirinya; owner sembunyikan cafe_ratings tentang kafenya.
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.cafe_ratings ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

-- Publik hanya lihat yang tidak disembunyikan; kedua belah pihak selalu lihat barisnya sendiri.
DROP POLICY IF EXISTS ratings_public_read ON public.ratings;
CREATE POLICY ratings_public_read ON public.ratings FOR SELECT USING (
  NOT hidden OR owner_id = (SELECT auth.uid()) OR barista_id = (SELECT auth.uid())
);
DROP POLICY IF EXISTS cafe_ratings_public_read ON public.cafe_ratings;
CREATE POLICY cafe_ratings_public_read ON public.cafe_ratings FOR SELECT USING (
  NOT hidden OR owner_id = (SELECT auth.uid()) OR barista_id = (SELECT auth.uid())
);

-- RPC: yang dinilai menyembunyikan/menampilkan rating tentang dirinya. Cap 30%.
CREATE OR REPLACE FUNCTION public.set_rating_hidden(p_kind text, p_id uuid, p_hidden boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := (SELECT auth.uid()); v_total int; v_hidden int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'login dulu'; END IF;
  IF p_kind = 'tentang_saya_barista' THEN
    SELECT count(*), count(*) FILTER (WHERE hidden) INTO v_total, v_hidden
    FROM ratings WHERE barista_id = v_uid;
    IF p_hidden AND v_total > 0 AND (v_hidden + 1)::float / v_total > 0.3 THEN
      RAISE EXCEPTION 'maksimal 30 persen rating boleh disembunyikan';
    END IF;
    UPDATE ratings SET hidden = p_hidden WHERE id = p_id AND barista_id = v_uid;
    IF NOT FOUND THEN RAISE EXCEPTION 'rating tidak ditemukan'; END IF;
  ELSIF p_kind = 'tentang_kafe_saya' THEN
    SELECT count(*), count(*) FILTER (WHERE hidden) INTO v_total, v_hidden
    FROM cafe_ratings WHERE owner_id = v_uid;
    IF p_hidden AND v_total > 0 AND (v_hidden + 1)::float / v_total > 0.3 THEN
      RAISE EXCEPTION 'maksimal 30 persen rating boleh disembunyikan';
    END IF;
    UPDATE cafe_ratings SET hidden = p_hidden WHERE id = p_id AND owner_id = v_uid;
    IF NOT FOUND THEN RAISE EXCEPTION 'rating tidak ditemukan'; END IF;
  ELSE RAISE EXCEPTION 'jenis tidak dikenal';
  END IF;
END $$;
