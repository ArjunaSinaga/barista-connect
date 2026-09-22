-- Guard: owner tidak bisa dibatasi ke nol kafe (anti lockout diri sendiri).
-- Ditemukan saat uji manusiawi 2026-09-22: tombol Batasi bisa bikin scope owner = []
-- sehingga dashboard owner kosong total.
DROP FUNCTION IF EXISTS public.set_manager_scope(uuid,uuid,uuid[]);
CREATE FUNCTION public.set_manager_scope(p_org uuid, p_user uuid, p_scope uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role text;
BEGIN
  IF public.org_owner_of(p_org) IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'khusus owner'; END IF;
  SELECT role INTO v_role FROM public.org_members WHERE org_id = p_org AND user_id = p_user;
  IF v_role IS NULL THEN RAISE EXCEPTION 'Bukan member org ini'; END IF;
  IF v_role = 'owner' AND (p_scope IS NULL OR coalesce(array_length(p_scope, 1), 0) = 0) THEN
    RAISE EXCEPTION 'Owner harus punya akses penuh, tidak bisa dibatasi ke nol kafe';
  END IF;
  UPDATE public.org_members SET scope_cafe_ids = p_scope WHERE org_id = p_org AND user_id = p_user;
  INSERT INTO public.org_audit(org_id, actor_id, action, target_user_id, detail)
  VALUES (p_org, auth.uid(), 'scope_changed', p_user, jsonb_build_object('scope', p_scope));
END $$;
