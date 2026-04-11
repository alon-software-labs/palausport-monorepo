'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/kpi-card';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DollarSign, Download, FileText, Search, Ticket, Users } from 'lucide-react';
import { downloadInvoicePDF, downloadBoardingPassesPDF } from '@/lib/pdf-generator';

type SortOption = 'date' | 'customer' | 'amount';

export default function InvoicesPage() {
  const { invoices, reservations, getEvent } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDownloadingPasses, setIsDownloadingPasses] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    let filtered = invoices;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        i =>
          i.customerName.toLowerCase().includes(query) ||
          i.customerEmail.toLowerCase().includes(query) ||
          i.invoiceNumber.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'date':
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
        case 'amount':
          return b.totalPrice - a.totalPrice;
        default:
          return 0;
      }
    });

    return sorted;
  }, [invoices, searchQuery, sortBy]);

  const handleDownload = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    const reservation = reservations.find(r => r.id === invoice?.reservationId);

    if (invoice && reservation) {
      setIsDownloading(invoiceId);
      try {
        downloadInvoicePDF(invoice, reservation);
      } finally {
        setIsDownloading(null);
      }
    }
  };

  const handleDownloadPasses = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    const reservation = reservations.find(r => r.id === invoice?.reservationId);
    const event = reservation ? getEvent(reservation.eventId) : undefined;

    if (invoice && reservation) {
      setIsDownloadingPasses(invoiceId);
      try {
        downloadBoardingPassesPDF(reservation, event);
      } finally {
        setIsDownloadingPasses(null);
      }
    }
  };

  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalGuests = filteredInvoices.reduce((sum, i) => sum + i.totalGuests, 0);

  return (
    <div className="space-y-[clamp(1.5rem,5vh,2.5rem)] animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoice History</h1>
        <p className="text-muted-foreground mt-0.5">View and manage all generated invoices</p>
      </div>

      <div className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-[clamp(1rem,3vw,1.5rem)] items-stretch">
        <KpiCard
          title="Total Invoices"
          value={filteredInvoices.length}
          icon={<FileText />}
          iconAccent="primary"
        />
        <KpiCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<DollarSign />}
          variant="primary"
        />
        <KpiCard
          title="Total Guests"
          value={totalGuests}
          icon={<Users />}
          iconAccent="blue"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 min-[600px]:grid-cols-2 gap-[clamp(1rem,3vw,1.5rem)]">
            <div className="space-y-2">
              <Label htmlFor="search">Search by customer, email, or invoice number</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search invoices..."
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
                  <SelectItem value="customer">Customer Name (A-Z)</SelectItem>
                  <SelectItem value="amount">Amount (Highest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">—</EmptyMedia>
                <EmptyTitle>No invoices found</EmptyTitle>
                <EmptyDescription>Generate invoices from reservations to see them here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Cabin</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono tabular-nums">{invoice.totalGuests}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">{invoice.cabinType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums">
                        ${invoice.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(invoice.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadPasses(invoice.id)}
                            disabled={isDownloadingPasses === invoice.id || isDownloading === invoice.id}
                            title="Download Boarding Passes"
                          >
                            <Ticket className="size-4 mr-1" />
                            {isDownloadingPasses === invoice.id ? '...' : 'Passes'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(invoice.id)}
                            disabled={isDownloading === invoice.id || isDownloadingPasses === invoice.id}
                            title="Download Invoice PDF"
                          >
                            <Download className="size-4 mr-1" />
                            {isDownloading === invoice.id ? '...' : 'Invoice'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
