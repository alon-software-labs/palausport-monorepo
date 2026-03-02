import { jsPDF } from 'jspdf';
import { Reservation, Invoice } from './types';

export function generateInvoicePDF(invoice: Invoice, reservation: Reservation): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(25, 118, 210); // Blue color
  doc.text('INVOICE', margin, yPosition);
  yPosition += 15;

  // Invoice details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${new Date(invoice.generatedAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 10;

  // Company info (left side)
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('CRUISE RESERVATION COMPANY', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('123 Harbor Street', margin, yPosition);
  yPosition += 4;
  doc.text('Port City, PC 12345', margin, yPosition);
  yPosition += 4;
  doc.text('Phone: (555) 123-4567', margin, yPosition);
  yPosition += 4;
  doc.text('Email: info@cruisereservation.com', margin, yPosition);
  yPosition += 15;

  // Customer info
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('BILL TO:', margin, yPosition);
  yPosition += 5;
  doc.setFontSize(10);
  doc.text(invoice.customerName, margin, yPosition);
  yPosition += 4;
  doc.text(invoice.customerEmail, margin, yPosition);
  yPosition += 10;

  // Items table header
  const tableTop = yPosition;
  doc.setFillColor(25, 118, 210);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  
  const columnPositions = {
    description: margin,
    quantity: pageWidth - margin - 70,
    unitPrice: pageWidth - margin - 40,
    amount: pageWidth - margin - 10,
  };

  doc.text('Description', columnPositions.description, tableTop);
  doc.text('Qty', columnPositions.quantity, tableTop);
  doc.text('Unit Price', columnPositions.unitPrice, tableTop);
  doc.text('Amount', columnPositions.amount, tableTop, { align: 'right' });

  // Table content
  doc.setTextColor(0, 0, 0);
  yPosition = tableTop + 7;

  const cabinPrices: Record<string, number> = {
    BASIC: 500,
    DELUXE: 750,
    SUITE: 1200,
    PENTHOUSE: 2000,
  };

  const unitPrice = cabinPrices[invoice.cabinType] || 500;
  const quantity = invoice.totalGuests;
  const amount = unitPrice * quantity;

  doc.setFontSize(9);
  doc.text(
    `${invoice.cabinType} Cabin Reservation`,
    columnPositions.description,
    yPosition
  );
  doc.text(quantity.toString(), columnPositions.quantity, yPosition);
  doc.text(`$${unitPrice.toFixed(2)}`, columnPositions.unitPrice, yPosition);
  doc.text(`$${amount.toFixed(2)}`, columnPositions.amount, yPosition, { align: 'right' });

  yPosition += 8;

  // Passenger info
  if (reservation.passengers.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Passengers:', margin, yPosition);
    yPosition += 3;
    
    reservation.passengers.forEach((passenger, index) => {
      const allergies = passenger.allergies && passenger.allergies !== 'None' 
        ? ` (Allergies: ${passenger.allergies})`
        : '';
      doc.text(`${index + 1}. ${passenger.name}, Age ${passenger.age}${allergies}`, margin + 3, yPosition);
      yPosition += 3;
    });
    
    yPosition += 3;
  }

  // Totals section
  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - margin - 50, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Subtotal:', pageWidth - margin - 50, yPosition, { align: 'right' });
  doc.text(`$${amount.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;

  doc.text('Tax (0%):', pageWidth - margin - 50, yPosition, { align: 'right' });
  doc.text('$0.00', pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;

  doc.setFontSize(12);
  doc.setTextColor(25, 118, 210);
  doc.text('TOTAL:', pageWidth - margin - 50, yPosition, { align: 'right' });
  doc.text(`$${invoice.totalPrice.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

  // Footer
  yPosition = pageHeight - margin - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  return doc.output('arraybuffer') as any;
}

export function downloadInvoicePDF(invoice: Invoice, reservation: Reservation) {
  const arrayBuffer = generateInvoicePDF(invoice, reservation);
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
