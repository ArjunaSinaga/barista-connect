-- Bug: LEFT JOIN + (m.scope_cafe_ids IS NULL) cocok untuk NON-member (baris NULL),
-- sehingga my_scope_cafes mengembalikan kafe milik owner lain (bocor antar-owner).
-- Ditemukan saat recheck 2026-09-22: dashboard recheck.owner001 menampilkan kafe+loker
-- milik ujicoba.owner001. Fix: akses org wajib baris membership; NULL scope =
-- full-org hanya bila member. Terverifikasi: dashboard kembali hanya data sendiri.
CREATE OR REPLACE FUNCTION public.can_manage_cafe(c uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR c IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.cafes WHERE id = c AND owner_id = v_uid) THEN RETURN true; END IF;
  IF EXISTS (
    SELECT 1 FROM public.cafes cf
    JOIN public.organizations o ON o.id = cf.org_id
    WHERE cf.id = c AND o.owner_id = v_uid
  ) THEN RETURN true; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.cafes cf
    JOIN public.org_members m ON m.org_id = cf.org_id AND m.user_id = v_uid
    WHERE cf.id = c
      AND (m.role = 'owner' OR m.scope_cafe_ids IS NULL OR c = ANY(m.scope_cafe_ids))
  );
END $function$;
