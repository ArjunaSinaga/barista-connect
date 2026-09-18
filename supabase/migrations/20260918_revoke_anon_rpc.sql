-- Cabut hak anon atas 5 SECURITY DEFINER functions (temuan advisor 2026-09-18).
-- auto_confirm_user + sync_team_member + rls_auto_enable = trigger/event functions
-- (tak bisa dipanggil RPC bermakna, tapi haknya dicabut agar bersih).
-- get_or_create_conversation + resign_application punya guard auth.uid() di badan,
-- tapi anon tak perlu execute sama sekali. Authenticated tetap boleh (dipakai app).
-- Applied live via MCP 2026-09-18.
revoke all on function public.auto_confirm_user() from anon;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.get_or_create_conversation(uuid, uuid, uuid) from anon;
revoke all on function public.resign_application(uuid) from anon;
revoke all on function public.sync_team_member() from anon;
