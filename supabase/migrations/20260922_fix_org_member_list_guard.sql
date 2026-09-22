-- Temuan audit BugHunter 2026-09-22: org_member_list menolak manager full-scope.
-- org_scope_of() mengembalikan NULL untuk non-member MAUPUN member full-scope,
-- sehingga guard lama (scope_of IS NULL) ikut mengunci manager full-scope.
-- Guard diganti ke is_org_member() — arah gagal tetap tertutup (fail-closed).
CREATE OR REPLACE FUNCTION public.org_member_list(p_org uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF public.org_owner_of(p_org) IS DISTINCT FROM auth.uid()
     AND NOT public.is_org_member(p_org, auth.uid()) THEN
    RAISE EXCEPTION 'bukan anggota';
  END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'user_id', m.user_id,
      'name', o.business_name,
      'email', p.email,
      'scope', m.scope_cafe_ids
    ))
    FROM public.org_members m
    LEFT JOIN public.owners o ON o.id = m.user_id
    LEFT JOIN public.profiles p ON p.id = m.user_id
    WHERE m.org_id = p_org
  ), '[]'::jsonb);
END $function$;
