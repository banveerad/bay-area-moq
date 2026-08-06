DROP VIEW IF EXISTS public.meetup_rsvp_counts;

ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS rsvp_count integer NOT NULL DEFAULT 0;

UPDATE public.meetups m
SET rsvp_count = COALESCE((SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = m.id), 0);

CREATE OR REPLACE FUNCTION public.sync_rsvp_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.meetups SET rsvp_count = rsvp_count + 1 WHERE id = NEW.meetup_id;
    RETURN NEW;
  ELSE
    UPDATE public.meetups SET rsvp_count = GREATEST(rsvp_count - 1, 0) WHERE id = OLD.meetup_id;
    RETURN OLD;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_rsvp_count() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvps_sync_count ON public.rsvps;
CREATE TRIGGER rsvps_sync_count
AFTER INSERT OR DELETE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.sync_rsvp_count();

-- has_role only ever inspects the caller's own rows, which the
-- "Users can view their own roles" policy already allows, so it does
-- not need elevated privileges.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;