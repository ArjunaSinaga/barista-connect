-- Phase 3A: peran eksplisit member + undangan + audit. Aditif, aman di DB kosong/isi.
ALTER TABLE public.org_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'manager'
    CHECK (role IN ('owner','manager','viewer'));

-- Backfill berprinsip: pendiri org (organizations.owner_id) = owner, sisanya tetap manager.
UPDATE public.org_members m SET role = 'owner'
WHERE m.role = 'manager'
  AND EXISTS (SELECT 1 FROM public.organizations g WHERE g.id = m.org_id AND g.owner_id = m.user_id);

-- Undangan ganti kode statis abadi.
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('manager','viewer')),
  scope_cafe_ids uuid[] NULL,
  token text NOT NULL UNIQUE DEFAULT (upper(substr(encode(extensions.gen_random_bytes(12), 'hex'), 1, 8)) || '-' || upper(substr(encode(extensions.gen_random_bytes(12), 'hex'), 1, 8))),
  invited_by uuid REFERENCES public.profiles(id),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit: riwayat ke belakang per org (siapa gabung/keluar/diubah, kapan, oleh siapa).
CREATE TABLE IF NOT EXISTS public.org_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL CHECK (action IN ('member_joined','member_removed','member_role_changed','invite_created','invite_revoked','invite_accepted','scope_changed','org_created')),
  target_user_id uuid NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inv_read ON public.invitations;
CREATE POLICY inv_read ON public.invitations FOR SELECT USING (
  public.is_org_member(org_id, (SELECT auth.uid())) OR public.org_owner_of(org_id) = (SELECT auth.uid())
);
DROP POLICY IF EXISTS inv_write ON public.invitations;
CREATE POLICY inv_write ON public.invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.org_members m WHERE m.org_id = invitations.org_id AND m.user_id = (SELECT auth.uid()) AND m.role IN ('owner','manager'))
);
DROP POLICY IF EXISTS inv_revoke ON public.invitations;
CREATE POLICY inv_revoke ON public.invitations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.org_members m WHERE m.org_id = invitations.org_id AND m.user_id = (SELECT auth.uid()) AND m.role IN ('owner','manager'))
);
DROP POLICY IF EXISTS audit_read ON public.org_audit;
CREATE POLICY audit_read ON public.org_audit FOR SELECT USING (
  public.is_org_member(org_id, (SELECT auth.uid())) OR public.org_owner_of(org_id) = (SELECT auth.uid())
);
DROP POLICY IF EXISTS audit_write ON public.org_audit;
CREATE POLICY audit_write ON public.org_audit FOR INSERT WITH CHECK (
  public.is_org_member(org_id, (SELECT auth.uid())) OR public.org_owner_of(org_id) = (SELECT auth.uid())
);
