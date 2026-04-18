'use client';

import { Reservation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/lib/context';
import { downloadInvoicePDF, downloadBoardingPassesPDF } from '@/lib/pdf-generator';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Ship,
  Users,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Download,
  ShieldCheck,
  Activity,
  CreditCard as PriceIcon,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReservationModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onGenerateInvoice?: (invoice: any) => void;
}

export function ReservationModal({
  reservation,
  onClose,
  onGenerateInvoice,
}: ReservationModalProps) {
  const { generateInvoice, getInvoicesByReservation, getEvent, getReservationGroupByReservationId } =
    useAppContext();
  const event = reservation ? getEvent(reservation.eventId) : null;
  const reservationGroup = reservation ? getReservationGroupByReservationId(reservation.id) : undefined;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPasses, setIsDownloadingPasses] = useState(false);

  const cabinTypesDisplay =
    reservationGroup?.cabinTypes.map((t) => t.replace('_', ' ')).join(', ') ??
    reservation?.cabinType?.replace('_', ' ');
  const invoiceReady = Boolean(
    reservationGroup?.invoiceGenerated || reservation?.invoiceGenerated
  );

  const handleGenerateInvoice = async () => {
    if (!reservation) return;
    setIsGenerating(true);
    try {
      const invoice = await generateInvoice(reservation.id);
      if (invoice) {
        onGenerateInvoice?.(invoice);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!reservation) return;
    setIsDownloading(true);
    try {
      const invoices = getInvoicesByReservation(reservation.id);
      if (invoices.length > 0) {
        await downloadInvoicePDF(invoices[0], reservation);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPasses = async () => {
    if (!reservation) return;
    setIsDownloadingPasses(true);
    try {
      await downloadBoardingPassesPDF(reservation, event ?? undefined);
    } finally {
      setIsDownloadingPasses(false);
    }
  };

  return (
    <Dialog open={!!reservation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-5xl p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Ship className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {event
                  ? `${event.destination} - ${event.name}${cabinTypesDisplay ? ` | ${cabinTypesDisplay}` : ''}`
                  : 'Reservation Details'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mt-0.5">
                Booking Ref: {reservationGroup?.id ?? reservation?.reservationGroupId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[82vh]">
          <div className="grid grid-cols-1 sm:grid-cols-[350px_1fr] divide-y sm:divide-y-0 sm:divide-x border-b">
            {/* Left Column: Core Info & Actions */}
            <div className="bg-muted/10 p-6 space-y-8 h-full">
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <SectionHeader icon={User} title="Customer" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  <InfoItem icon={User} label="Name" value={reservation?.customerName} />
                  <StatusItem label="Status" value={reservation?.status} />
                  <InfoItem icon={Mail} label="Email Address" value={reservation?.customerEmail} />
                  <InfoItem icon={Phone} label="Contact Phone" value={reservation?.customerPhone} />
                </div>
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SectionHeader icon={Briefcase} title="Booking" />
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Ship} label="Cabin type" value={reservation?.cabinType} />
                  <InfoItem
                    icon={Ship}
                    label="Cabin units"
                    value={reservationGroup?.cabinIds.join(', ') ?? reservation?.cabinId}
                  />
                  <InfoItem icon={Users} label="Guests" value={reservation?.totalGuests} />
                  <InfoItem
                    icon={PriceIcon}
                    label="Total"
                    value={reservation ? `$${reservation.totalPrice.toLocaleString()}` : ''}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Booked"
                    value={reservation ? new Date(reservation.createdAt).toLocaleDateString() : ''}
                  />
                </div>
              </section>

              {reservation?.notes && (
                <section className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <SectionHeader icon={FileText} title="Notes" />
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-background/50 p-3 rounded-lg border border-border/40">
                    &quot;{reservation.notes}&quot;
                  </p>
                </section>
              )}

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-1000 pt-6 border-t border-border/80">
                <SectionHeader icon={Activity} title="Actions" />
                <div className="flex flex-col gap-2">
                  {!invoiceReady ? (
                    <Button
                      onClick={handleGenerateInvoice}
                      disabled={isGenerating}
                      className="w-full justify-center gap-2 h-9 text-xs transition-all duration-300 shadow-sm"
                      variant="default"
                    >
                      {isGenerating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <CreditCard className="size-3" />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate Invoice'}
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                      <Button
                        onClick={handleDownloadInvoice}
                        disabled={isDownloading}
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8 text-[11px] justify-center bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 transition-all duration-300"
                      >
                        <Download className="size-3" /> Invoice
                      </Button>
                      <Button
                        onClick={handleDownloadPasses}
                        disabled={isDownloadingPasses}
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8 text-[11px] justify-center bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 transition-all duration-300"
                      >
                        <FileText className="size-3" /> Passes
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Guests List */}
            <div className="p-6 space-y-6">
              <SectionHeader icon={Users} title="Registered Guests" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservation?.passengers.map((passenger: any, index: number) => (
                  <div
                    key={passenger.id}
                    className="group relative bg-background border border-border/60 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <User className="size-3.5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="font-bold text-sm text-foreground">{passenger.fullName}</div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/40">
                        GUEST {index + 1}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-y-3 gap-x-2 border-t pt-3 border-border/40">
                      <InfoItem icon={Clock} label="Age" value={passenger.age} />
                      <InfoItem icon={ShieldCheck} label="Gender" value={passenger.gender} />
                      <InfoItem icon={Ship} label="Cabin" value={passenger.cabinType?.replace('_', ' ')} />
                      <InfoItem icon={Phone} label="Phone" value={passenger.phone} className="col-span-2" />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="size-3 text-destructive/70" />
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                            Allergies
                          </span>
                        </div>
                        <p
                          className={cn(
                            'text-xs font-semibold',
                            passenger.foodAllergies && passenger.foodAllergies !== 'None'
                              ? 'text-destructive'
                              : 'text-muted-foreground/60 italic'
                          )}
                        >
                          {passenger.foodAllergies || 'None'}
                        </p>
                      </div>
                      {(passenger.danId || passenger.buyDanInsurance) && (
                        <div className="col-span-3 mt-1 p-2 bg-muted/30 rounded-lg flex items-center gap-2 border border-border/40">
                          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                            DAN:
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600">
                            {passenger.danId ? `ID: ${passenger.danId}` : 'Palau Sport Insurance'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="bg-primary/10 p-1.5 rounded-lg">
        <Icon className="size-3.5 text-primary" />
      </div>
      <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, className }: { icon?: any; label: string; value: any; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3 text-muted-foreground/60" />}
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground/90 tabular-nums">
        {value || <span className="text-muted-foreground font-normal italic">not set</span>}
      </p>
    </div>
  );
}

function StatusItem({ label, value, className }: { label: string; value: any; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{label}</span>
      <Badge
        variant={value === 'CONFIRMED' || value === 'Invoice' ? 'default' : 'secondary'}
        className="w-fit text-[10px] h-5 px-2 font-bold tracking-wide transition-all"
      >
        {value}
      </Badge>
    </div>
  );
}
