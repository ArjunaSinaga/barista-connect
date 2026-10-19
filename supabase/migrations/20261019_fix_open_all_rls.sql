-- Fix open_all RLS policies: replace public ALL with identity-scoped policies.
-- Audit ref: T-20261014-001 (kritis).

-- 1. credits_ledger: owner read only (writes via service role)
DROP POLICY IF EXISTS open_all ON public.credits_ledger;
CREATE POLICY credits_ledger_owner_read ON public.credits_ledger
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. earnings_payouts: owner read only (writes via service role)
DROP POLICY IF EXISTS open_all ON public.earnings_payouts;
CREATE POLICY earnings_payouts_owner_read ON public.earnings_payouts
  FOR SELECT TO authenticated
  USING (barista_id = auth.uid());

-- 3. notifications: owner read + update (mark read); writes via service role
DROP POLICY IF EXISTS open_all ON public.notifications;
CREATE POLICY notifications_owner_read ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notifications_owner_update ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. barista_availability: owner CRUD
DROP POLICY IF EXISTS open_all ON public.barista_availability;
CREATE POLICY barista_availability_owner_all ON public.barista_availability
  FOR ALL TO authenticated
  USING (barista_id = auth.uid())
  WITH CHECK (barista_id = auth.uid());

-- 5. cafe_staffing_needs: cafe owner CRUD
DROP POLICY IF EXISTS open_all ON public.cafe_staffing_needs;
CREATE POLICY cafe_staffing_needs_owner_all ON public.cafe_staffing_needs
  FOR ALL TO authenticated
  USING (cafe_id IN (SELECT id FROM public.cafes WHERE owner_id = auth.uid()))
  WITH CHECK (cafe_id IN (SELECT id FROM public.cafes WHERE owner_id = auth.uid()));

-- 6. check_ins: barista own CRUD + cafe owner read
DROP POLICY IF EXISTS open_all ON public.check_ins;
CREATE POLICY check_ins_barista_all ON public.check_ins
  FOR ALL TO authenticated
  USING (barista_id = auth.uid())
  WITH CHECK (barista_id = auth.uid());
CREATE POLICY check_ins_cafe_owner_read ON public.check_ins
  FOR SELECT TO authenticated
  USING (cafe_id IN (SELECT id FROM public.cafes WHERE owner_id = auth.uid()));

-- 7. follows: public read; follower insert/delete
DROP POLICY IF EXISTS open_all ON public.follows;
CREATE POLICY follows_public_read ON public.follows
  FOR SELECT TO public
  USING (true);
CREATE POLICY follows_follower_insert ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (follower_id = auth.uid());
CREATE POLICY follows_follower_delete ON public.follows
  FOR DELETE TO authenticated
  USING (follower_id = auth.uid());

-- 8. influencer anon write: drop anon ALL (keep public read + authenticated write)
DROP POLICY IF EXISTS influencer_assets_anon ON public.influencer_assets;
DROP POLICY IF EXISTS influencer_posts_anon ON public.influencer_posts;
