ALTER TABLE public.meetups
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS waitlist_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'going';

CREATE OR REPLACE FUNCTION public.validate_rsvp_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('going', 'waitlist') THEN
    RAISE EXCEPTION 'invalid rsvp status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_rsvp_status() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvps_validate_status ON public.rsvps;
CREATE TRIGGER rsvps_validate_status
BEFORE INSERT OR UPDATE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.validate_rsvp_status();

-- Assign going/waitlist based on remaining capacity
CREATE OR REPLACE FUNCTION public.assign_rsvp_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cap integer;
  taken integer;
BEGIN
  SELECT capacity INTO cap FROM public.meetups WHERE id = NEW.meetup_id;
  IF cap IS NULL THEN
    NEW.status := 'going';
  ELSE
    SELECT count(*) INTO taken FROM public.rsvps
      WHERE meetup_id = NEW.meetup_id AND status = 'going';
    NEW.status := CASE WHEN taken >= cap THEN 'waitlist' ELSE 'going' END;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_rsvp_status() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvps_assign_status ON public.rsvps;
CREATE TRIGGER rsvps_assign_status
BEFORE INSERT ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.assign_rsvp_status();

-- Recount + promote from waitlist when a confirmed spot frees up
CREATE OR REPLACE FUNCTION public.sync_rsvp_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target uuid := COALESCE(NEW.meetup_id, OLD.meetup_id);
  cap integer;
  taken integer;
  promote uuid;
BEGIN
  SELECT capacity INTO cap FROM public.meetups WHERE id = target;

  IF cap IS NOT NULL THEN
    LOOP
      SELECT count(*) INTO taken FROM public.rsvps
        WHERE meetup_id = target AND status = 'going';
      EXIT WHEN taken >= cap;
      SELECT id INTO promote FROM public.rsvps
        WHERE meetup_id = target AND status = 'waitlist'
        ORDER BY created_at ASC LIMIT 1;
      EXIT WHEN promote IS NULL;
      UPDATE public.rsvps SET status = 'going' WHERE id = promote;
      promote := NULL;
    END LOOP;
  END IF;

  UPDATE public.meetups m SET
    rsvp_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = target AND r.status = 'going'),
    waitlist_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = target AND r.status = 'waitlist')
  WHERE m.id = target;

  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_rsvp_count() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS rsvps_sync_count ON public.rsvps;
CREATE TRIGGER rsvps_sync_count
AFTER INSERT OR DELETE OR UPDATE OF status ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.sync_rsvp_count();

UPDATE public.meetups m SET
  rsvp_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = m.id AND r.status = 'going'),
  waitlist_count = (SELECT count(*) FROM public.rsvps r WHERE r.meetup_id = m.id AND r.status = 'waitlist');

-- Organisers need member names for the manage page
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));