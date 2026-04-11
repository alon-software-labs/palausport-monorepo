'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { Reservation } from '@/lib/types';
import { CabinGrid } from '@/components/cabin-grid';
import { ReservationModal } from '@/components/reservation-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { Download, Search, AlertCircle, Loader2 } from 'lucide-react';
import { downloadInvoicePDF } from '@/lib/pdf-generator';

type SortOption = 'name' | 'date' | 'price' | 'guests';

export default function ReservationsPage() {
  const { events, reservations, getInvoicesByReservation, isLoading, error } = useAppContext();

  const destinations = useMemo(() => Array.from(new Set(events.map(e => e.destination).filter(Boolean))), [events]);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (events.length > 0) {
      if (!selectedDestination && destinations.length > 0) {
        setSelectedDestination(destinations[0]);
      }
    }
  }, [events, destinations, selectedDestination]);

  const destinationEvents = useMemo(() => {
    return events.filter(e => e.destination === selectedDestination);
  }, [events, selectedDestination]);

  useEffect(() => {
    if (destinationEvents.length > 0) {
      if (!selectedEventId || !destinationEvents.some(e => e.id === selectedEventId)) {
        setSelectedEventId(destinationEvents[0].id);
      }
    } else {
      setSelectedEventId('');
    }
  }, [destinationEvents, selectedEventId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const eventReservations = useMemo(() => {
    let filtered = reservations.filter(r => r.eventId === selectedEventId);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.customerName.toLowerCase().includes(query) ||
          r.customerEmail.toLowerCase().includes(query) ||
          r.customerPhone.includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.totalPrice - a.totalPrice;
        case 'guests':
          return b.totalGuests - a.totalGuests;
        default:
          return 0;
      }
    });

    return sorted;
  }, [reservations, selectedEventId, searchQuery, sortBy]);

  const handleInvoiceGenerated = () => {
    setInvoiceGenerated(true);
    setTimeout(() => setInvoiceGenerated(false), 2000);
  };

  const handleDownloadInvoice = (e: React.MouseEvent, reservation: Reservation) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const invoices = getInvoicesByReservation(reservation.id);
      if (invoices.length > 0) {
        downloadInvoicePDF(invoices[0], reservation);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-[clamp(1rem,3vh,2rem)] animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
        <p className="text-muted-foreground mt-0.5">Manage all cruise reservations</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>Syncing</AlertTitle>
          <AlertDescription>Updating reservation data from the server...</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Destination</Label>
            <div className="flex gap-2 flex-wrap">
              {destinations.map(dest => (
                <Button
                  key={dest}
                  onClick={() => setSelectedDestination(dest)}
                  variant={selectedDestination === dest ? 'default' : 'outline'}
                >
                  {dest}
                </Button>
              ))}
            </div>
          </div>

          {destinationEvents.length > 0 && (
            <div className="max-w-xs space-y-2">
              <Label className="text-sm text-muted-foreground">Date</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {destinationEvents.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.currentBookings}/{event.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <CabinGrid
          eventId={selectedEventId}
          reservations={reservations}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-[clamp(1rem,3vh,1.5rem)]">
          <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-[clamp(1rem,3vw,1.5rem)]">
            <div className="space-y-2">
              <Label htmlFor="search">Search by name, email, or phone</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search reservations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price">Price (Highest)</SelectItem>
                  <SelectItem value="guests">Guests (Most)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reservations</CardTitle>
          <CardDescription>
            {eventReservations.length} reservation{eventReservations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventReservations.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">—</EmptyMedia>
                <EmptyTitle>No reservations for this event</EmptyTitle>
                <EmptyDescription>Try selecting another event or adjust your search.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Cabin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventReservations.map((reservation) => (
                      <TableRow
                        key={reservation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{reservation.customerName}</p>
                            <p className="text-xs text-muted-foreground">{reservation.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {reservation.totalGuests}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{reservation.cabinType}</TableCell>
                        <TableCell>
                          <Badge variant={reservation.invoiceGenerated ? 'default' : 'secondary'}>
                            {reservation.invoiceGenerated ? 'Invoice' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {reservation.invoiceGenerated && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDownloadInvoice(e, reservation)}
                              disabled={isDownloading}
                            >
                              <Download className="size-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List View */}
              <div className="sm:hidden -mx-6">
                <ItemGroup>
                  {eventReservations.map((reservation, index) => (
                    <div key={reservation.id}>
                      <Item
                        className="cursor-pointer"
                        onClick={() => setSelectedReservation(reservation)}
                      >
                        <ItemContent>
                          <ItemTitle>{reservation.customerName}</ItemTitle>
                          <ItemDescription>{reservation.customerEmail}</ItemDescription>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge 
                              variant={reservation.invoiceGenerated ? 'default' : 'secondary'} 
                              className="text-[10px] h-4 px-1.5 font-medium uppercase tracking-wider"
                            >
                              {reservation.invoiceGenerated ? 'Invoice' : 'Pending'}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">{reservation.totalGuests} Guests</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{reservation.cabinType}</span>
                          </div>
                        </ItemContent>
                        {reservation.invoiceGenerated && (
                          <ItemActions onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDownloadInvoice(e, reservation)}
                              disabled={isDownloading}
                              className="size-8 p-0"
                            >
                              <Download className="size-4" />
                            </Button>
                          </ItemActions>
                        )}
                      </Item>
                      {index < eventReservations.length - 1 && <ItemSeparator />}
                    </div>
                  ))}
                </ItemGroup>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReservationModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onGenerateInvoice={handleInvoiceGenerated}
      />

      {invoiceGenerated && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
          Invoice generated successfully
        </div>
      )}
    </div>
  );
}
