-- Fix transfer_org_owner: owner baru dapat baris member role owner,
-- owner lama turun jadi manager (sebelumnya: ganda/nyangkut).
-- Ditemukan saat uji transfer round-trip 2026-09-22.
CREATE OR REPLACE FUNCTION public.transfer_org_owner(p_org uuid, p_new_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_new uuid; v_old uuid;
BEGIN
  v_old := public.org_owner_of(p_org);
  IF v_old IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'khusus owner'; END IF;
  SELECT id INTO v_new FROM public.profiles WHERE email = trim(p_new_email) AND role = 'owner';
  IF NOT FOUND THEN RAISE EXCEPTION 'email tak terdaftar sebagai owner'; END IF;
  IF v_new = auth.uid() THEN RAISE EXCEPTION 'itu emailmu sendiri'; END IF;
  UPDATE public.organizations SET owner_id = v_new, needs_owner = false WHERE id = p_org;
  -- owner baru: pastikan baris member role owner (bukan tanpa baris)
  DELETE FROM public.org_members WHERE org_id = p_org AND user_id = v_new;
  INSERT INTO public.org_members (org_id, user_id, role, scope_cafe_ids) VALUES (p_org, v_new, 'owner', NULL);
  -- owner lama: turun jadi manager (jangan nyangkut role owner ganda)
  UPDATE public.org_members SET role = 'manager' WHERE org_id = p_org AND user_id = v_old AND role = 'owner';
  INSERT INTO public.org_audit (org_id, actor_id, action, target_user_id, detail)
  VALUES (p_org, auth.uid(), 'member_role_changed', v_new, jsonb_build_object('from', v_old, 'to', v_new, 'kind', 'owner_transfer'));
END $$;
