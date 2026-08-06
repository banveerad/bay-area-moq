ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notify_new_meetups boolean NOT NULL DEFAULT true;
ALTER TABLE public.meetups ADD COLUMN IF NOT EXISTS announced_at timestamp with time zone;