-- 1. Tighten rsvps SELECT policy
DROP POLICY IF EXISTS "Signed-in members can view rsvps" ON public.rsvps;

CREATE POLICY "Members can view their own rsvps"
ON public.rsvps FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rsvps"
ON public.rsvps FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Public aggregate counts (view runs as owner, so no per-row exposure)
CREATE OR REPLACE VIEW public.meetup_rsvp_counts
WITH (security_invoker = false) AS
SELECT meetup_id, count(*)::int AS going_count
FROM public.rsvps
GROUP BY meetup_id;

GRANT SELECT ON public.meetup_rsvp_counts TO anon, authenticated;
GRANT ALL ON public.meetup_rsvp_counts TO service_role;

-- 3. Internal trigger function must not be callable by API roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;