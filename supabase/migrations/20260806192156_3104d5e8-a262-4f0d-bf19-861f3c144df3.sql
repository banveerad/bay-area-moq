CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources are viewable by everyone"
  ON public.resources FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update resources"
  ON public.resources FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete resources"
  ON public.resources FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER resources_set_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.resources (section, label, href, note, sort_order) VALUES
  ('Specs & drafts', 'IETF moq Working Group', 'https://datatracker.ietf.org/wg/moq/about/', 'Charter, drafts and mailing list archive.', 10),
  ('Specs & drafts', 'moq-transport draft', 'https://datatracker.ietf.org/doc/draft-ietf-moq-transport/', 'The core publish/subscribe transport over QUIC.', 20),
  ('Specs & drafts', 'WebTransport (W3C)', 'https://www.w3.org/TR/webtransport/', 'The browser-side API most MoQ demos build on.', 30),
  ('Open source to run tonight', 'moq-rs', 'https://github.com/cloudflare/moq-rs', 'Rust relay and CLI tools — the usual starting point.', 40),
  ('Talks & background', 'QUIC, explained (RFC 9000)', 'https://www.rfc-editor.org/rfc/rfc9000.html', 'The transport everything here sits on top of.', 50);