CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE TABLE public.meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  event_date date NOT NULL,
  time_label text NOT NULL DEFAULT '6:30 - 9:00 PM',
  venue text NOT NULL,
  city text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.meetups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetups TO authenticated;
GRANT ALL ON public.meetups TO service_role;
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Meetups are viewable by everyone" ON public.meetups
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert meetups" ON public.meetups
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update meetups" ON public.meetups
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete meetups" ON public.meetups
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER meetups_set_updated_at BEFORE UPDATE ON public.meetups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (meetup_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in members can view rsvps" ON public.rsvps
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can rsvp for themselves" ON public.rsvps
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can cancel their own rsvp" ON public.rsvps
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.meetups (title, event_date, time_label, venue, city, summary, status) VALUES
('MoQ Night 01 — Relays, Tracks & Sub-second Latency', '2026-09-17', '6:30 – 9:00 PM', 'Cloudflare, 101 Townsend St', 'San Francisco', 'Kickoff meetup. A walkthrough of the moq-transport draft, then two live demos pushing tracks through a public relay.', 'open'),
('Hack Night — Build a Publisher in 90 Minutes', '2026-10-07', '6:00 – 9:30 PM', 'Temescal Works, Oakland', 'Oakland', 'Bring a laptop. We pair up and ship a WebTransport publisher and player against a shared relay, with mentors on hand.', 'open'),
('Encoding Deep Dive — LOC, CMAF & Frame-level Packaging', '2026-11-03', '6:30 – 9:00 PM', 'Palo Alto Research Loft', 'Palo Alto', 'How media gets carved into objects and groups, and what that means for congestion response and playback buffers.', 'waitlist'),
('Field Notes — Running MoQ in Production', '2026-07-09', '6:30 – 9:00 PM', 'San Jose Tech Annex', 'San Jose', 'Three teams shared what broke first: relay fan-out, priority inversion, and QUIC on flaky mobile networks.', 'past');