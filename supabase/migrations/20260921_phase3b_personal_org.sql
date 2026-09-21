-- Phase 3B: jenis org + personal-org otomatis. Aditif.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'company'
    CHECK (kind IN ('personal','company'));

CREATE OR REPLACE FUNCTION public.ensure_personal_org(p_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_uid uuid := auth.uid(); v_org public.organizations%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'login dulu'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND role = 'owner') THEN
    RAISE EXCEPTION 'khusus akun owner';
  END IF;
  SELECT * INTO v_org FROM public.organizations WHERE owner_id = v_uid AND kind = 'personal' LIMIT 1;
  IF v_org.id IS NULL THEN
    IF p_name IS NULL OR length(trim(p_name)) < 3 THEN RAISE EXCEPTION 'nama usaha minimal 3 huruf'; END IF;
    INSERT INTO public.organizations (name, owner_id, needs_owner, kind)
    VALUES (trim(p_name), v_uid, false, 'personal') RETURNING * INTO v_org;
    INSERT INTO public.org_members (org_id, user_id, role, scope_cafe_ids)
    VALUES (v_org.id, v_uid, 'owner', NULL) ON CONFLICT DO NOTHING;
    INSERT INTO public.org_audit (org_id, actor_id, action, target_user_id, detail)
    VALUES (v_org.id, v_uid, 'org_created', v_uid, '{"kind":"personal"}'::jsonb);
  END IF;
  RETURN jsonb_build_object('org_id', v_org.id);
END $$;
GRANT EXECUTE ON FUNCTION public.ensure_personal_org(text) TO authenticated;
