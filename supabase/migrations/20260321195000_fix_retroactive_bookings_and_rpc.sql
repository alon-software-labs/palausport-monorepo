-- 1. Backfill existing cruise_events current_bookings that were confirmed before the trigger was created.
UPDATE cruise_events c
SET current_bookings = COALESCE((
  SELECT SUM(grp_guests)
  FROM (
    SELECT DISTINCT reservation_group_id, total_guests as grp_guests
    FROM public.reservations r
    WHERE r.event_id = c.id
      AND r.status = 'CONFIRMED'
  ) AS unique_groups
), 0);

-- 2. Create a secure RPC to fetch booked cabins, bypassing RLS which prevents clients from seeing others' reservations
CREATE OR REPLACE FUNCTION get_booked_cabins(target_event_id bigint)
RETURNS TABLE (cabin_id text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT r.cabin_id
  FROM public.reservations r
  WHERE r.event_id = target_event_id
    AND r.status = 'CONFIRMED';
END;
$$;
