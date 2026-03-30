drop extension if exists "pg_net";

drop policy "cruise_events_client_select" on "public"."cruise_events";

set check_function_bodies = off;

create or replace view "public"."client_stats" as  SELECT lower(customer_email) AS email,
    max(customer_name) AS name,
    count(id) AS total_bookings,
    sum(total_price) AS total_spent,
    jsonb_agg(jsonb_build_object('id', id, 'eventId', event_id, 'cabinId', cabin_id, 'cabinType', cabin_type, 'customerName', customer_name, 'status', status, 'totalGuests', total_guests, 'totalPrice', total_price, 'createdAt', created_at) ORDER BY created_at DESC) AS reservations
   FROM public.reservations
  GROUP BY (lower(customer_email));


CREATE OR REPLACE FUNCTION public.get_booked_cabins(target_event_id bigint)
 RETURNS TABLE(cabin_id text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT r.cabin_id
  FROM public.reservations r
  WHERE r.event_id = target_event_id
    AND r.status = 'CONFIRMED';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_event_confirmed_bookings(target_event_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_cruise_event_bookings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE cruise_events
    SET current_bookings = COALESCE((
      SELECT COALESCE(SUM(grp_guests), 0)
      FROM (
        SELECT DISTINCT reservation_group_id, total_guests as grp_guests
        FROM reservations
        WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
          AND status = 'CONFIRMED'
      ) AS unique_groups
    ), 0)
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  END IF;
  RETURN NULL;
END;
$function$
;


  create policy "cruise_events_public_select"
  on "public"."cruise_events"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER trigger_update_cruise_event_bookings AFTER INSERT OR DELETE OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_cruise_event_bookings();


