'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadInvoicePDF } from '@/lib/pdf-generator';

type SortOption = 'date' | 'customer' | 'amount';

export default function InvoicesPage() {
  const { invoices, reservations } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

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

  const totalRevenue = filteredInvoices.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalGuests = filteredInvoices.reduce((sum, i) => sum + i.totalGuests, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Invoice History</h1>
        <p className="text-gray-600">View and manage all generated invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search by customer, email, or invoice number</Label>
              <Input
                id="search"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sort">Sort by</Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="date">Date (Newest)</option>
                <option value="customer">Customer Name (A-Z)</option>
                <option value="amount">Amount (Highest)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-gray-500">No invoices found. Generate invoices from reservations to see them here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Invoice Number</th>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Guests</th>
                    <th className="text-left py-2 px-2">Cabin Type</th>
                    <th className="text-right py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-center py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-2">{invoice.customerName}</td>
                      <td className="py-3 px-2 text-gray-600">{invoice.customerEmail}</td>
                      <td className="py-3 px-2">{invoice.totalGuests}</td>
                      <td className="py-3 px-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                          {invoice.cabinType}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        ${invoice.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        {new Date(invoice.generatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(invoice.id)}
                          disabled={isDownloading === invoice.id}
                        >
                          {isDownloading === invoice.id ? 'Downloading...' : 'Download'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
