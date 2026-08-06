CREATE TABLE public.meetup_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (meetup_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.meetup_managers TO authenticated;
GRANT ALL ON public.meetup_managers TO service_role;

ALTER TABLE public.meetup_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own manager assignments"
  ON public.meetup_managers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all manager assignments"
  ON public.meetup_managers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can assign managers"
  ON public.meetup_managers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can remove managers"
  ON public.meetup_managers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.is_meetup_manager(_user_id uuid, _meetup_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meetup_managers
    WHERE user_id = _user_id AND meetup_id = _meetup_id
  )
$$;

REVOKE ALL ON FUNCTION public.is_meetup_manager(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_meetup_manager(uuid, uuid) TO authenticated, service_role;

CREATE POLICY "Event managers can update their meetup"
  ON public.meetups FOR UPDATE TO authenticated
  USING (public.is_meetup_manager(auth.uid(), id))
  WITH CHECK (public.is_meetup_manager(auth.uid(), id));

CREATE POLICY "Event managers can view rsvps for their meetup"
  ON public.rsvps FOR SELECT TO authenticated
  USING (public.is_meetup_manager(auth.uid(), meetup_id));

CREATE POLICY "Event managers can move rsvps for their meetup"
  ON public.rsvps FOR UPDATE TO authenticated
  USING (public.is_meetup_manager(auth.uid(), meetup_id))
  WITH CHECK (public.is_meetup_manager(auth.uid(), meetup_id));

CREATE POLICY "Event managers can remove rsvps for their meetup"
  ON public.rsvps FOR DELETE TO authenticated
  USING (public.is_meetup_manager(auth.uid(), meetup_id));

CREATE POLICY "Event managers can view attendee profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.rsvps r
    JOIN public.meetup_managers mm ON mm.meetup_id = r.meetup_id
    WHERE r.user_id = profiles.id AND mm.user_id = auth.uid()
  ));