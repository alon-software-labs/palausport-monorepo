import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bmzrzegookxnollvjkjn.supabase.co',
  'sb_publishable_4__coMkcO5mVQU9t5WvzNQ_rLq5t5J8'
);

async function checkEvents() {
  const { data: events, error: eErr } = await supabase.from('cruise_events').select('*');
  const { data: res, error: rErr } = await supabase.from('reservations').select('*');

  console.log('--- Cruise Events ---');
  if (eErr) console.error(eErr);
  else console.log(events ? events.slice(0, 3) : 'No events');

  console.log('\n--- Reservations ---');
  if (rErr) console.error(rErr);
  else console.log(res ? res.map(r => ({id: r.id, event_id: r.event_id, cap: r.total_guests})) : 'No reservations');
}

checkEvents();
