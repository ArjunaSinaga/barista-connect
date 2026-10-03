-- Queue notifikasi lamaran: trigger INSERT/UPDATE applications -> notifications.
-- Idempotent (IF NOT EXISTS / DROP IF EXISTS). Reversible: see DOWN block at end.
CREATE OR REPLACE FUNCTION public.notify_application_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_title text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT jp.owner_id INTO v_owner FROM public.job_posts jp WHERE jp.id = NEW.job_post_id;
    v_title := 'Lamaran baru masuk';
    IF v_owner IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (v_owner, v_title, 'Ada pelamar baru untuk lowongan Anda.');
    END IF;
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (NEW.barista_id, 'Lamaran terkirim', 'Lamaran Anda sudah diteruskan ke pemilik kafe.');
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      v_title := CASE NEW.status
        WHEN 'accepted' THEN 'Lamaran diterima'
        WHEN 'rejected' THEN 'Lamaran ditolak'
        ELSE 'Status lamaran: ' || NEW.status
      END;
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (NEW.barista_id, v_title, 'Ada update untuk lamaran Anda.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application_change ON public.applications;
CREATE TRIGGER trg_notify_application_change
AFTER INSERT OR UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.notify_application_change();

-- RLS: user hanya baca notifikasi miliknya
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_notifications_select" ON public.notifications;
CREATE POLICY "own_notifications_select" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- DOWN (rollback manual bila perlu):
-- DROP TRIGGER IF EXISTS trg_notify_application_change ON public.applications;
-- DROP FUNCTION IF EXISTS public.notify_application_change();
-- DROP POLICY IF EXISTS "own_notifications_select" ON public.notifications;
