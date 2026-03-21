-- Allow public access to read cruise_events so availability labels work for guests
DROP POLICY IF EXISTS "cruise_events_client_select" ON cruise_events;
CREATE POLICY "cruise_events_public_select" ON cruise_events
  FOR SELECT TO public USING (true);

-- Ensure we can fetch ALL confirmed reservations for the counter regardless of who own them
-- Using a security definer function to bypass RLS for the counter
CREATE OR REPLACE FUNCTION get_event_confirmed_bookings(target_event_id bigint)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total integer;
BEGIN
  SELECT COALESCE(SUM(grp_guests), 0)
  INTO total
  FROM (
    SELECT DISTINCT reservation_group_id, total_guests as grp_guests
    FROM public.reservations
    WHERE event_id = target_event_id
      AND status = 'CONFIRMED'
  ) AS unique_groups;
  
  RETURN total;
END;
$$;
