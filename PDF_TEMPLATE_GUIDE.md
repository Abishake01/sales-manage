# Professional PDF Template Guide

## Overview

The application now includes a professional PDF template system for generating quotations and purchase orders matching the format shown in your reference image (TUSIJI SPRITI INDIA PRIVATE LIMITED quotation).

## Files Created

### `QuotationPDFTemplate.js`
- Location: `frontend/src/components/QuotationPDFTemplate.js`
- Purpose: Reusable PDF template generator class
- Exports: `QuotationPDFTemplate` (class) and default React component for testing

## PDF Template Features

### 1. **Company Header Section**
- Company name (large, bold)
- Company address
- Email address
- Phone number

### 2. **Quotation Metadata Box**
- Top-right corner box with:
  - Date
  - Quotation Number
  - Validity period

### 3. **Bill To & Ship To Sections**
- Customer name
- Customer address
- City/Location

### 4. **Delivery Terms Table**
- Warehouse of Establishment
- Place of Delivery
- Payment Terms
- Delivery Time

### 5. **Items Table**
Professional multi-column table with:
- **S.NO**: Serial number
- **DESCRIPTION**: Item description
- **Model**: Model number
- **Make**: Manufacturer
- **HSN**: HSN code
- **MOQ**: Minimum Order Quantity
- **UOM**: Unit of Measure
- **UNIT PRICE**: Price per unit
- **TOTAL**: Quantity × Unit Price

### 6. **Totals Section**
- Subtotal
- GST 18% calculation
- Grand Total

### 7. **Terms and Conditions**
- Customizable notes section
- Default disclaimer text
- Warranty information

### 8. **Footer**
- Page numbers
- Standard disclaimers

## Usage in Components

### QuotationDetail.js
```javascript
import { QuotationPDFTemplate } from './QuotationPDFTemplate';

const handlePDFExport = () => {
  const quotationData = {
    companyName: 'TUSIJI SPRITI INDIA PRIVATE LIMITED',
    companyAddress: 'Your Company Address',
    companyEmail: 'info@example.com',
    companyPhone: '+91-XXXXXXXXXX',
    quotationNo: 'Q-001',
    quotationDate: new Date(),
    validityDays: '30 Days',
    billTo: {
      name: 'Customer Name',
      address: 'Customer Address',
      city: 'City'
    },
    shipTo: {
      name: 'Customer Name',
      address: 'Customer Address',
      city: 'City'
    },
    placeOfDelivery: 'Delivery Location',
    deliveryTime: '6-8 Weeks',
    paymentTerms: '30 Days',
    items: [
      {
        description: 'Product Description',
        model: 'Model Number',
        make: 'Manufacturer',
        hsn: 'HSN Code',
        moq: 10,
        uom: 'Nos',
        unitPrice: 100,
        quantity: 5
      }
    ],
    notes: 'Additional terms and conditions'
  };

  const doc = QuotationPDFTemplate.generatePDF(quotationData);
  doc.save('quotation.pdf');
};
```

### PurchaseDetail.js
Uses the same template with different field mappings (salePrice instead of unitPrice).

## Data Structure

### QuotationData Object
```javascript
{
  // Company Information
  companyName: string,           // Company name
  companyAddress: string,        // Full address
  companyEmail: string,          // Email
  companyPhone: string,          // Phone number

  // Document Information
  quotationNo: string,           // Unique quotation number
  quotationDate: Date,           // Date of quotation
  validityDays: string,          // e.g., "30 Days"

  // Customer Information
  billTo: {
    name: string,
    address: string,
    city: string
  },
  shipTo: {
    name: string,
    address: string,
    city: string
  },

  // Delivery Terms
  placeOfDelivery: string,       // Delivery location
  deliveryTerms: string,         // CIF, FOB, etc.
  deliveryTime: string,          // e.g., "6-8 Weeks"
  paymentTerms: string,          // e.g., "30 Days"

  // Line Items
  items: [
    {
      description: string,       // Product description
      model: string,             // Model number
      make: string,              // Manufacturer
      hsn: string,               // HSN code
      moq: number,               // Minimum order quantity
      uom: string,               // Unit of measure (Nos, Pcs, Ltrs, etc.)
      unitPrice: number,         // Price per unit
      quantity: number           // Quantity ordered
    }
  ],

  // Additional Information
  notes: string                  // Terms & conditions
}
```

## Customization Guide

### Changing Company Details
Edit the `quotationData` object in `QuotationDetail.js` or `PurchaseDetail.js`:
```javascript
companyName: 'YOUR COMPANY NAME',
companyAddress: 'Your Full Address Here',
companyEmail: 'your.email@company.com',
companyPhone: '+91-YOUR-PHONE-NUMBER',
```

### Modifying Colors
In `QuotationPDFTemplate.js`, modify these color values:
```javascript
// Header color (currently blue)
fillColor: [102, 126, 234]  // RGB values

// Alternate row color
fillColor: [245, 245, 245]  // Light gray
```

### Adjusting Column Widths
In the `doc.autoTable()` call, modify `columnStyles`:
```javascript
columnStyles: {
  0: { cellWidth: 15 },  // S.NO
  1: { cellWidth: 35 },  // DESCRIPTION
  // ... etc
}
```

### Adding New Sections
- Add content before or after the existing sections
- Update `yPosition` variable to track vertical position
- Use `doc.autoTable()` for tables and `doc.text()` for simple text

## Calculation Logic

### Quotation (Uses Unit Price)
```
Line Total = Quantity × Unit Price
Subtotal = Sum of all Line Totals
GST (18%) = Subtotal × 0.18
Grand Total = Subtotal + GST
```

### Purchase (Uses Sub Price)
```
Line Total = Quantity × Sub Price
Same calculation as quotation
```

## File Naming

Files are saved with format:
- Quotation: `Quotation-[QuotationNo].pdf`
- Purchase: `PurchaseOrder-[EnquiryNumber].pdf`

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses jsPDF and jspdf-autotable libraries
- Downloads directly to user's Downloads folder

## Dependencies

```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.5.28"
}
```

Both libraries are already installed in the project.

## Testing

To test the PDF template:
1. Navigate to a Quotation or Purchase Order detail page
2. Click the "Download PDF" button
3. Verify the generated PDF matches the expected format
4. Check that calculations are correct
5. Verify all company and customer information is present

## Future Enhancements

Potential improvements:
1. **Multiple pages support** - For large order lists
2. **Logo insertion** - Add company logo at the top
3. **Custom branding** - Multiple template styles
4. **Email integration** - Send PDF via email directly
5. **Digital signature** - Add signature field support
6. **Language support** - Multi-language templates
7. **Tax variations** - Different GST rates per item/region
8. **Barcode/QR codes** - Add barcodes to items
9. **Payment methods** - Show accepted payment methods
10. **Terms library** - Predefined terms and conditions

## Troubleshooting

### PDF not downloading
- Check browser console for errors
- Verify jsPDF library is imported
- Check QuotationPDFTemplate import path

### Incorrect calculations
- Verify quantity and unitPrice fields are numbers
- Check item data structure matches expected format
- Validate parseFloat() conversions

### Layout issues
- Adjust yPosition values for spacing
- Modify columnStyles for table layout
- Check margin values

### Missing data in PDF
- Verify all fields in quotationData object are populated
- Check null/undefined handling in template
- Confirm item array has data before export

## Support

For issues or questions about the PDF template system, please refer to:
1. This documentation file
2. Code comments in QuotationPDFTemplate.js
3. jsPDF documentation: https://github.com/parallax/jsPDF
4. jspdf-autotable: https://github.com/simonbengtsson/jsPDF-AutoTable
