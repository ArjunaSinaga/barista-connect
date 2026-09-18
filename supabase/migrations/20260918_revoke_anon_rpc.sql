-- Cabut hak PUBLIC atas 5 SECURITY DEFINER functions (temuan advisor 2026-09-18).
-- Pelajaran: grant ke PUBLIC mencakup anon — revoke dari anon SAJA tidak mempan
-- ( diverifikasi via routine_privileges: grant PUBLIC tetap ada). Maka revoke dari PUBLIC,
-- lalu grant balik execute ke authenticated untuk 2 RPC yang dipakai app.
-- get_or_create_conversation + resign_application punya guard auth.uid() di badan,
-- trigger functions (auto_confirm_user, sync_team_member, rls_auto_enable) tanpa grant publik.
-- Applied live via MCP 2026-09-18 (migrasi revoke_anon_rpc + revoke_public_rpc).
revoke all on function public.auto_confirm_user() from public;
revoke all on function public.rls_auto_enable() from public;
revoke all on function public.get_or_create_conversation(uuid, uuid, uuid) from public;
revoke all on function public.resign_application(uuid) from public;
revoke all on function public.sync_team_member() from public;
grant execute on function public.get_or_create_conversation(uuid, uuid, uuid) to authenticated;
grant execute on function public.resign_application(uuid) to authenticated;
