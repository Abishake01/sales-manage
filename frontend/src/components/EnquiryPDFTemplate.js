import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Template Generator for Enquiries
 */
class EnquiryPDFTemplate {
  static generatePDF(enquiryData) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 10;

    // Company Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(enquiryData.companyName, 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(enquiryData.companyAddress, 15, yPosition);
    yPosition += 5;
    doc.text(enquiryData.companyEmail, 15, yPosition);
    yPosition += 5;
    doc.text(enquiryData.companyPhone, 15, yPosition);
    yPosition += 10;

    // Enquiry title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('ENQUIRY', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Enquiry details box (top right)
    const boxX = pageWidth - 70;
    const boxWidth = 60;
    const detailsY = 15;

    doc.setDrawColor(0);
    doc.rect(boxX, detailsY, boxWidth, 30);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    doc.text('Date:', boxX + 3, detailsY + 7);
    doc.text(this.formatDate(enquiryData.enquiryDate), boxX + 25, detailsY + 7);

    doc.text('Enquiry No:', boxX + 3, detailsY + 14);
    doc.text(enquiryData.enquiryNo, boxX + 25, detailsY + 14);

    doc.text('Status:', boxX + 3, detailsY + 21);
    doc.text(enquiryData.status || '', boxX + 25, detailsY + 21);

    // Customer section
    yPosition = Math.max(yPosition, detailsY + 35);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('CUSTOMER:', 15, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(enquiryData.customer?.name || '', 15, yPosition);
    yPosition += 5;
    doc.text(enquiryData.customer?.address || '', 15, yPosition);
    yPosition += 10;

    // Items Table (match Enquiry page columns)
    const itemHeaders = ['S.No', 'Description', 'Part No', 'Made', 'Quantity', 'UOM', 'Unit Price', 'Total', 'Sub Name', 'Sub Price'];
    const itemData = (enquiryData.items || []).map((item, index) => [
      (index + 1).toString(),
      item.description || '',
      item.partNumber || '',
      item.made || '',
      this.formatPlainNumber(item.quantity),
      item.uom || '',
      `₹${this.formatNumber(item.unitPrice)}`,
      `₹${this.formatNumber((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))}`,
      item.subName || '',
      `₹${this.formatNumber(item.salePrice)}`
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
        0: { cellWidth: 12 },
        1: { cellWidth: 40 },
        2: { cellWidth: 22 },
        3: { cellWidth: 18 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Total Amount section (no GST for enquiry)
    const totalAmount = (enquiryData.items || []).reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0));
    }, 0);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Total Amount', pageWidth - 55, yPosition);
    doc.text(`₹${this.formatNumber(totalAmount)}`, pageWidth - 15, yPosition, { align: 'right' });

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('This enquiry is subject to our final confirmation.', 15, footerY);

    return doc;
  }

  static formatDate(date) {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Format currency numbers to two decimals without spaces
  static formatNumber(value) {
    const num = parseFloat(value || 0);
    return num.toFixed(2);
  }

  // Format plain numeric fields (like Quantity) without spaces
  static formatPlainNumber(value) {
    const num = parseFloat(value || 0);
    return Number.isNaN(num) ? '' : num.toString();
  }
}

export { EnquiryPDFTemplate };
