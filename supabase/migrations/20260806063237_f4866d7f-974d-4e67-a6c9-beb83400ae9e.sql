CREATE OR REPLACE FUNCTION public.recount_rsvps()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target uuid := COALESCE(NEW.meetup_id, OLD.meetup_id);
BEGIN
  UPDATE public.meetups m SET
    rsvp_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = target AND r.status = 'going'),
    waitlist_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = target AND r.status = 'waitlist')
  WHERE m.id = target;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recount_rsvps() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvps_recount_on_update ON public.rsvps;
CREATE TRIGGER rsvps_recount_on_update
AFTER UPDATE OF status ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.recount_rsvps();

CREATE POLICY "Admins can move rsvps"
ON public.rsvps FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can remove any rsvp"
ON public.rsvps FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));