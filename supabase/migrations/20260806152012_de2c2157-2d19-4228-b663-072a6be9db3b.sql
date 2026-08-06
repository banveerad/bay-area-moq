DROP TRIGGER IF EXISTS rsvps_sync_count ON public.rsvps;
CREATE TRIGGER rsvps_sync_count
AFTER INSERT OR DELETE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.sync_rsvp_count();

DROP TRIGGER IF EXISTS rsvps_recount_on_update ON public.rsvps;
CREATE TRIGGER rsvps_recount_on_update
AFTER UPDATE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.recount_rsvps();