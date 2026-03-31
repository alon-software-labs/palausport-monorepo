/*
 * Reservations: one row per cabin. Multiple cabins in one booking share reservation_group_id.
 * Legacy single-cabin rows: each gets its own reservation_group_id (default).
 */

-- Enum types (skip if already created in the project)
DO $$
BEGIN
  CREATE TYPE public.cabin_type AS ENUM ('BUNK', 'QUEEN_SUITE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  CREATE TYPE public.reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
-- Base table (new projects)
CREATE TABLE IF NOT EXISTS public.reservations (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  reservation_group_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id bigint NOT NULL,
  cabin_id text NOT NULL,
  cabin_type public.cabin_type NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  passengers jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.reservation_status NOT NULL DEFAULT 'PENDING'::public.reservation_status,
  total_guests integer NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  notes text NULL,
  invoice_generated boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reservations_pkey PRIMARY KEY (id)
);
-- Upgrade path: existing deployments that already had reservations without newer columns
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS reservation_group_id uuid DEFAULT gen_random_uuid();
UPDATE public.reservations
SET reservation_group_id = gen_random_uuid()
WHERE reservation_group_id IS NULL;
ALTER TABLE public.reservations
  ALTER COLUMN reservation_group_id SET NOT NULL,
  ALTER COLUMN reservation_group_id SET DEFAULT gen_random_uuid();
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS event_id bigint;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS cabin_id text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS cabin_type public.cabin_type;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS passengers jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS status public.reservation_status NOT NULL DEFAULT 'PENDING'::public.reservation_status;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS total_guests integer;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS total_price numeric(10, 2);
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS invoice_generated boolean NOT NULL DEFAULT false;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
-- Foreign key to cruise_events
DO $fk$
BEGIN
  ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.cruise_events (id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $fk$;
-- Indexes
CREATE INDEX IF NOT EXISTS reservations_event_id_idx ON public.reservations USING btree (event_id);
CREATE INDEX IF NOT EXISTS reservations_reservation_group_id_idx ON public.reservations USING btree (reservation_group_id);
-- One line per cabin within a booking
CREATE UNIQUE INDEX IF NOT EXISTS reservations_group_cabin_uidx
  ON public.reservations (reservation_group_id, cabin_id);
