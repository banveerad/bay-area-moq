ALTER TABLE public.meetups ADD COLUMN is_draft boolean NOT NULL DEFAULT false;
ALTER TABLE public.meetups ALTER COLUMN is_draft SET DEFAULT true;

DROP POLICY "Meetups are viewable by everyone" ON public.meetups;

CREATE POLICY "Published meetups are viewable by everyone"
ON public.meetups FOR SELECT
TO anon, authenticated
USING (is_draft = false);

CREATE POLICY "Admins can view draft meetups"
ON public.meetups FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Event managers can view their draft meetups"
ON public.meetups FOR SELECT
TO authenticated
USING (is_meetup_manager(auth.uid(), id));