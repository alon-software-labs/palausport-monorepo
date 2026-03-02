'use client';

import { Reservation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CabinGridProps {
  eventId: string;
  reservations: Reservation[];
  onCabinClick?: (cabinId: string) => void;
}

export function CabinGrid({ eventId, reservations, onCabinClick }: CabinGridProps) {
  const eventReservations = reservations.filter(r => r.eventId === eventId);
  const bookedCabinIds = new Set(eventReservations.map(r => r.cabinId));

  // Generate cabin numbers (9 Bunks, 4 Queen Suites = 13 total)
  const cabins = Array.from({ length: 13 }, (_, i) => {
    const id = `cabin-${i + 1}`;
    const isBunk = i < 9;
    return {
      id,
      number: isBunk ? `B${i + 1}` : `Q${i - 8}`,
      type: isBunk ? 'BUNK' : 'QUEEN_SUITE',
      status: bookedCabinIds.has(id) ? 'booked' : 'available',
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cabin Overview - {eventId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-13 gap-2">
          {cabins.map((cabin) => {
            const reservation = eventReservations.find(r => r.cabinId === cabin.id);
            const statusColor = cabin.status === 'booked' ? 'bg-indigo-600' : 'bg-emerald-500';
            const statusSymbol = cabin.status === 'booked' ? '🔒' : '🔓';

            return (
              <div
                key={cabin.id}
                onClick={() => onCabinClick?.(cabin.id)}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${statusColor} text-white shadow-sm hover:scale-105 active:scale-95`}
                title={reservation ? `${reservation.customerName} - ${reservation.totalGuests} guests (${cabin.type})` : `Available ${cabin.type}`}
              >
                <div className="text-sm mb-1 opacity-80 uppercase text-[10px] font-bold">
                  {cabin.type === 'BUNK' ? 'Bunk' : 'Queen'}
                </div>
                <div className="text-lg">{statusSymbol}</div>
                <div className="text-xs font-mono">{cabin.number}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <span>Available ({cabins.filter(c => c.status === 'available').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <span>Booked ({cabins.filter(c => c.status === 'booked').length})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
