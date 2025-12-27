import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Template Generator for Purchase Orders
 */

class PurchasePDFTemplate {
  /**
   * Generate PDF with professional purchase order format
   */
  static generatePDF(purchaseData) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Company Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(purchaseData.companyName, 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(purchaseData.companyAddress, 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.companyEmail, 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.companyPhone, 15, yPosition);
    yPosition += 10;

    // Purchase Order title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PURCHASE ORDER', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Purchase details box (top right)
    const boxX = pageWidth - 70;
    const boxWidth = 60;
    const detailsY = 15;

    doc.setDrawColor(0);
    doc.rect(boxX, detailsY, boxWidth, 30);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    doc.text('Date:', boxX + 3, detailsY + 7);
    doc.text(this.formatDate(purchaseData.purchaseDate), boxX + 25, detailsY + 7);

    doc.text('PO No:', boxX + 3, detailsY + 14);
    doc.text(purchaseData.purchaseNo, boxX + 25, detailsY + 14);

    doc.text('Validity:', boxX + 3, detailsY + 21);
    const validityText = purchaseData.validityValue
      ? `${purchaseData.validityValue} ${purchaseData.validityUnit || 'days'}`
      : (purchaseData.validityDays || purchaseData.validity || '');
    doc.text(validityText, boxX + 25, detailsY + 21);

    // Optional Incharge for consistency across templates
    doc.text('Incharge:', boxX + 3, detailsY + 28);
    doc.text(purchaseData.incharge || '', boxX + 25, detailsY + 28);

    // Bill To section
    yPosition = Math.max(yPosition, detailsY + 35);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('BILL TO:', 15, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(purchaseData.billTo.name || '', 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.billTo.address || '', 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.billTo.city || '', 15, yPosition);
    yPosition += 8;

    // Ship To section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SHIP TO:', 15, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(purchaseData.shipTo.name || '', 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.shipTo.address || '', 15, yPosition);
    yPosition += 5;
    doc.text(purchaseData.shipTo.city || '', 15, yPosition);
    yPosition += 10;

    // Delivery Terms section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('DELIVERY TERMS', 15, yPosition);
    yPosition += 8;

    const deliveryTableData = [
      ['Warehouse of Establishment', purchaseData.placeOfDelivery],
      ['Place of Delivery', purchaseData.placeOfDelivery || 'To your factory'],
      ['Payment', '30 Days'],
      ['Delivery Time', purchaseData.deliveryTime || '6-8 Weeks']
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
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Items Table - Purchase columns: S.No, Description, Part No, Made, Quantity, Sub Price, Total
    const itemHeaders = ['S.No', 'DESCRIPTION', 'Part No', 'Made', 'Quantity', 'Sub Price', 'TOTAL'];
    const itemData = purchaseData.items.map((item, index) => [
      (index + 1).toString(),
      item.description || '',
      item.model || '',
      item.make || '',
      item.quantity || '',
      this.formatNumber(parseFloat(item.subPrice || 0)),
      this.formatNumber(parseFloat(item.quantity || 0) * parseFloat(item.subPrice || 0))
    ]);

    doc.autoTable({
      startY: yPosition,
      margin: { left: 15, right: 15 },
      head: [itemHeaders],
      body: itemData,
      headStyles: {
        fillColor: [37, 99, 235],
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
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Total Amount section
    const totalAmount = purchaseData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.subPrice || 0));
    }, 0);

    const gstAmount = totalAmount * 0.18; // 18% GST
    const grandTotal = totalAmount + gstAmount;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Total Amount', pageWidth - 55, yPosition);
    doc.text(this.formatNumber(totalAmount), pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('GST (18%)', pageWidth - 55, yPosition);
    doc.text(this.formatNumber(gstAmount), pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 8;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('GRAND TOTAL', pageWidth - 55, yPosition);
    doc.text(this.formatNumber(grandTotal), pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 15;

    // Terms and conditions
    if (purchaseData.notes) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text('TERMS AND CONDITIONS:', 15, yPosition);
      yPosition += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      const notes = doc.splitTextToSize(purchaseData.notes, 170);
      doc.text(notes, 15, yPosition);
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('This purchase order is subject to our final confirmation and prices quoted here in will be changed without prior notice.', 15, footerY);
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

  // Format number without spaces (1234 not 1 2 3 4)
  static formatNumber(num) {
    return num.toFixed(2);
  }
}

export { PurchasePDFTemplate };
