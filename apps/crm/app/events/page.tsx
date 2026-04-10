'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useAppContext } from '@/lib/context';
import { CruiseEvent } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';

type EventFormData = {
  name: string;
  destination: string;
  date: string;
  capacity: string;
};

type EventFormErrors = Partial<Record<keyof EventFormData, string>>;

const EMPTY_FORM: EventFormData = {
  name: '',
  destination: '',
  date: '',
  capacity: '',
};

function normalizeDate(value: string): string {
  return value.slice(0, 10);
}

export default function EventsPage() {
  const { events, reservations, addEvent, updateEvent, deleteEvent, isLoading, error } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CruiseEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<EventFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventIdPendingDelete, setEventIdPendingDelete] = useState<string | null>(null);

  const reservationCountByEvent = useMemo(() => {
    return reservations.reduce<Record<string, number>>((acc, reservation) => {
      acc[reservation.eventId] = (acc[reservation.eventId] ?? 0) + 1;
      return acc;
    }, {});
  }, [reservations]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const openCreateForm = () => {
    setEditingEvent(null);
    setFormErrors({});
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (event: CruiseEvent) => {
    setEditingEvent(event);
    setFormErrors({});
    setFormData({
      name: event.name,
      destination: event.destination,
      date: normalizeDate(event.date),
      capacity: String(event.capacity),
    });
    setIsFormOpen(true);
  };

  const validateForm = (value: EventFormData): EventFormErrors => {
    const errors: EventFormErrors = {};
    if (!value.name.trim()) errors.name = 'Event name is required.';
    if (!value.destination.trim()) errors.destination = 'Destination is required.';
    if (!value.date) errors.date = 'Date is required.';

    const parsedCapacity = parseInt(value.capacity, 10);
    if (!value.capacity.trim()) {
      errors.capacity = 'Capacity is required.';
    } else if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      errors.capacity = 'Capacity must be a positive whole number.';
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: formData.name.trim(),
      destination: formData.destination.trim(),
      date: formData.date,
      capacity: parseInt(formData.capacity, 10),
    };

    setIsSubmitting(true);
    const result = editingEvent
      ? await updateEvent({
          ...editingEvent,
          ...payload,
        })
      : await addEvent(payload);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? 'Unable to save event.');
      return;
    }

    toast.success(editingEvent ? 'Event updated.' : 'Event created.');
    setIsFormOpen(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleDelete = async (eventId: string) => {
    setEventIdPendingDelete(eventId);
    const result = await deleteEvent(eventId);
    setEventIdPendingDelete(null);

    if (!result.success) {
      toast.error(result.error ?? 'Unable to delete event.');
      return;
    }

    toast.success('Event deleted.');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="h-8 w-44 bg-muted rounded-md" />
        <div className="h-56 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-destructive">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-[clamp(1rem,3vh,2rem)] animate-in fade-in duration-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-0.5">Create and manage cruise events</p>
        </div>
        <Button onClick={openCreateForm}>
          <CalendarPlus className="size-4 mr-1.5" />
          New Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event List</CardTitle>
          <CardDescription>
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No events found. Create your first event to get started.
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEvents.map((event) => {
                    const reservationCount = reservationCountByEvent[event.id] ?? 0;
                    const deleteBlocked = reservationCount > 0;
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.destination}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">{event.capacity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={reservationCount > 0 ? 'default' : 'secondary'}>
                            {event.currentBookings} guests
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditForm(event)}
                            >
                              <Pencil className="size-3.5 mr-1" />
                              Edit
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  disabled={deleteBlocked}
                                >
                                  <Trash2 className="size-3.5 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. The event will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(event.id)}
                                    disabled={eventIdPendingDelete === event.id}
                                  >
                                    {eventIdPendingDelete === event.id ? 'Deleting...' : 'Delete Event'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          {deleteBlocked && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Remove reservations first to delete.
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent
                ? 'Update event details and save your changes.'
                : 'Enter event details to create a new cruise event.'}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Wreck Weekend Adventure"
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-destination">Destination</Label>
              <Input
                id="event-destination"
                value={formData.destination}
                onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
                placeholder="e.g. Blue Corner"
              />
              {formErrors.destination && <p className="text-xs text-destructive">{formErrors.destination}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
                {formErrors.date && <p className="text-xs text-destructive">{formErrors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-capacity">Capacity</Label>
                <Input
                  id="event-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Max guests"
                />
                {formErrors.capacity && <p className="text-xs text-destructive">{formErrors.capacity}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
