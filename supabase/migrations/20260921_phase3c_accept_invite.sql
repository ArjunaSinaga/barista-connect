-- Phase 3C: terima undangan via token. Aditif; alur kode lama tetap jalan (deprecated).
CREATE OR REPLACE FUNCTION public.accept_invite(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_uid uuid := auth.uid(); v_inv public.invitations%ROWTYPE; v_name text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'login dulu'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'owner') THEN
    RAISE EXCEPTION 'khusus akun owner';
  END IF;
  SELECT * INTO v_inv FROM public.invitations WHERE token = upper(trim(p_token));
  IF v_inv.id IS NULL THEN RAISE EXCEPTION 'undangan tidak ditemukan'; END IF;
  IF v_inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'undangan sudah dipakai'; END IF;
  IF v_inv.expires_at < now() THEN RAISE EXCEPTION 'undangan kedaluwarsa'; END IF;
  IF EXISTS (SELECT 1 FROM public.org_members WHERE org_id = v_inv.org_id AND user_id = v_uid) THEN
    RAISE EXCEPTION 'kamu sudah member PT ini';
  END IF;
  INSERT INTO public.org_members (org_id, user_id, role, scope_cafe_ids)
  VALUES (v_inv.org_id, v_uid, v_inv.role, v_inv.scope_cafe_ids);
  UPDATE public.invitations SET accepted_at = now() WHERE id = v_inv.id;
  SELECT name INTO v_name FROM public.organizations WHERE id = v_inv.org_id;
  INSERT INTO public.org_audit (org_id, actor_id, action, target_user_id, detail)
  VALUES (v_inv.org_id, v_uid, 'invite_accepted', v_uid, jsonb_build_object('role', v_inv.role)),
         (v_inv.org_id, v_uid, 'member_joined', v_uid, jsonb_build_object('via', 'invite', 'role', v_inv.role));
  RETURN jsonb_build_object('org_id', v_inv.org_id, 'org_name', v_name, 'role', v_inv.role);
END $$;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated;
