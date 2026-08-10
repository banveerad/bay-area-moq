ALTER TABLE public.rsvps
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN guest_name text,
  ADD COLUMN guest_email text,
  ADD COLUMN guest_linkedin text;

ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_member_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL)
    OR (user_id IS NULL AND guest_email IS NOT NULL AND guest_name IS NOT NULL)
  );

CREATE UNIQUE INDEX rsvps_guest_unique
  ON public.rsvps (meetup_id, lower(guest_email))
  WHERE user_id IS NULL;
