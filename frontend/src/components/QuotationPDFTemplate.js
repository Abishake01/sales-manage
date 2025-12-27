import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Template Generator for Quotations
 * Based on the provided quotation format
 */

class QuotationPDFTemplate {
  /**
   * Generate PDF with professional quotation format
   * @param {Object} quotationData - Quotation details
   * @param {string} quotationData.companyName - Your company name
   * @param {string} quotationData.companyAddress - Company address
   * @param {string} quotationData.companyEmail - Company email
   * @param {string} quotationData.companyPhone - Company phone
   * @param {string} quotationData.quotationNo - Quotation number
   * @param {Date} quotationData.quotationDate - Date of quotation
   * @param {string} quotationData.validityDays - Validity period
   * @param {Object} quotationData.billTo - Bill to customer details
   * @param {Object} quotationData.shipTo - Ship to customer details
   * @param {Array} quotationData.items - Line items
   * @param {string} quotationData.deliveryTerms - Delivery terms
   * @param {string} quotationData.placeOfDelivery - Place of delivery
   * @param {string} quotationData.paymentTerms - Payment terms
   * @param {string} quotationData.deliveryTime - Delivery time
   * @param {string} quotationData.notes - Additional notes/terms
   */
  static generatePDF(quotationData) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Company Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(quotationData.companyName, 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(quotationData.companyAddress, 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.companyEmail, 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.companyPhone, 15, yPosition);
    yPosition += 10;

    // Quotation title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('QUOTATION', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Quotation details box (top right)
    const boxX = pageWidth - 70;
    const boxWidth = 60;
    const detailsY = 15;

    doc.setDrawColor(0);
    doc.rect(boxX, detailsY, boxWidth, 30);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    doc.text('Date:', boxX + 3, detailsY + 7);
    doc.text(this.formatDate(quotationData.quotationDate), boxX + 25, detailsY + 7);

    doc.text('Quote No:', boxX + 3, detailsY + 14);
    doc.text(quotationData.quotationNo, boxX + 25, detailsY + 14);

    doc.text('Validity:', boxX + 3, detailsY + 21);
    doc.text(quotationData.validityDays, boxX + 25, detailsY + 21);

    // Bill To section
    yPosition = Math.max(yPosition, detailsY + 35);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 15, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(quotationData.billTo.name || '', 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.billTo.address || '', 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.billTo.city || '', 15, yPosition);
    yPosition += 8;

    // Ship To section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SHIP TO:', 15, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(quotationData.shipTo.name || '', 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.shipTo.address || '', 15, yPosition);
    yPosition += 5;
    doc.text(quotationData.shipTo.city || '', 15, yPosition);
    yPosition += 10;

    // Delivery Terms section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('DELIVERY TERMS', 15, yPosition);
    yPosition += 8;

    const deliveryTableData = [
      ['Warehouse of Establishment', quotationData.placeOfDelivery],
      ['Place of Delivery', quotationData.placeOfDelivery || 'To your factory'],
      ['Payment', '30 Days'],
      ['Delivery Time', quotationData.deliveryTime || '6-8 Weeks']
    ];

    doc.autoTable({
      startY: yPosition,
      margin: { left: 15, right: 15 },
      head: [],
      body: deliveryTableData,
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 70 }
      },
      didDrawPage: function(data) {
        // Header and footer
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Items Table
    const itemHeaders = ['S.NO', 'DESCRIPTION', 'Model', 'Make', 'HSN', 'MOQ', 'UOM', 'UNIT PRICE', 'TOTAL'];
    const itemData = quotationData.items.map((item, index) => [
      (index + 1).toString(),
      item.description || '',
      item.model || '',
      item.make || '',
      item.hsn || '',
      item.moq || '',
      item.uom || '',
      `₹${parseFloat(item.unitPrice || 0).toFixed(2)}`,
      `₹${(parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: yPosition,
      margin: { left: 15, right: 15 },
      head: [itemHeaders],
      body: itemData,
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 12 },
        5: { cellWidth: 12 },
        6: { cellWidth: 12 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Totals section
    const totalAmount = quotationData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0));
    }, 0);

    const gstAmount = totalAmount * 0.18; // 18% GST
    const grandTotal = totalAmount + gstAmount;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('G.TOTAL', pageWidth - 50, yPosition);
    doc.text(`₹ ${totalAmount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('GST (18%)', pageWidth - 50, yPosition);
    doc.text(`₹ ${gstAmount.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('GRAND TOTAL', pageWidth - 50, yPosition);
    doc.text(`₹ ${grandTotal.toFixed(2)}`, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 15;

    // Terms and conditions
    if (quotationData.notes) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text('TERMS AND CONDITIONS:', 15, yPosition);
      yPosition += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      const notes = doc.splitTextToSize(quotationData.notes, 170);
      doc.text(notes, 15, yPosition);
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('This quotation is subject to our final confirmation and prices quoted here in will be changed without prior notice.', 15, footerY);
    doc.text('Warranty - Not applicable for Import goods', 15, footerY + 5);

    // Page number
    doc.setFontSize(9);
    doc.text(`Page 1 of 1`, pageWidth / 2, footerY + 10, { align: 'center' });

    return doc;
  }

  static formatDate(date) {
    if (typeof date === 'string') {
      return date;
    }
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
  }
}

/**
 * React Component to use this PDF template
 */
export default function QuotationPDFGenerator() {
  const sampleQuotationData = {
    companyName: 'TURBO SPPI INDIA PRIVATE LIMITED',
    companyAddress: 'Old No. 1, New No-15, 11th Cross street, Bhavani Nagar Offices Colony, Ekattuthangal, Chennai-600032',
    companyEmail: 'info@turbosppi@gmail.in',
    companyPhone: 'Mob No. +91-9962168550',
    quotationNo: 'Q-Nov23-25',
    quotationDate: new Date('2025-11-19'),
    validityDays: '30 Days',
    billTo: {
      name: 'Toyota Tsusho India Pvt Ltd.',
      address: 'No 165 veshakkam village, wakshad Road, Panruti Pat, Kunnakkkums BS , Kancheepuram',
      city: 'Oragadam, Tamilnadu - 631604'
    },
    shipTo: {
      name: 'Toyota Tsusho India Pvt Ltd.',
      address: 'No 165 veshakkam village, wakshad Road, Panruti Pat, Kunnakkkums BS , Kancheepuram',
      city: 'Oragadam, Tamilnadu - 631604'
    },
    placeOfDelivery: 'To your factory',
    deliveryTerms: 'CIF',
    deliveryTime: '6-8 Weeks',
    paymentTerms: '30 Days',
    items: [
      {
        description: 'Refrigerant Hose Heavy',
        model: '2M',
        make: 'Local',
        hsn: '84143080',
        moq: 2,
        uom: 'Nos',
        unitPrice: 1522,
        quantity: 2
      },
      {
        description: 'Refrigerant Hose Heavy',
        model: '3M',
        make: 'Local',
        hsn: '84143080',
        moq: 2,
        uom: 'Nos',
        unitPrice: 1664,
        quantity: 2
      },
      {
        description: 'Refrigerant Hose Heavy',
        model: '5M',
        make: 'Local',
        hsn: '84143080',
        moq: 2,
        uom: 'Nos',
        unitPrice: 2142,
        quantity: 2
      },
      {
        description: 'Conversion Plug',
        model: '5/16 X 1/4',
        make: 'Local',
        hsn: '84143080',
        moq: 10,
        uom: 'Nos',
        unitPrice: 313,
        quantity: 10
      },
      {
        description: 'Low viscosity Glue',
        model: '125g',
        make: 'Local',
        hsn: '84143080',
        moq: 10,
        uom: 'Nos',
        unitPrice: 340,
        quantity: 10
      }
    ],
    notes: 'GST 18% Extra. This quotation is subject to our final confirmation and prices quoted here in will be changed without prior notice. Warranty - Not applicable for Import goods'
  };

  const handleDownloadPDF = () => {
    const doc = QuotationPDFTemplate.generatePDF(sampleQuotationData);
    doc.save('Quotation-' + sampleQuotationData.quotationNo + '.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Quotation PDF Generator</h2>
      <p>Click the button below to generate and download a sample quotation PDF</p>
      <button 
        onClick={handleDownloadPDF}
        style={{
          padding: '10px 20px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Download Sample PDF
      </button>
    </div>
  );
}

export { QuotationPDFTemplate };
