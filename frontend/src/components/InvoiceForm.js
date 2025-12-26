import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './InvoiceForm.css';

function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;

  const [formData, setFormData] = useState({
    engagementNumber: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    seller: {
      name: '',
      address: '',
    },
    customer: {
      name: '',
      address: '',
    },
    items: [],
  });

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!isNew && user) {
      const invoice = storageService.getInvoice(user.id, id);
      if (invoice) {
        setFormData(invoice);
      }
    }
  }, [id, isNew, user]);

  useEffect(() => {
    // Calculate total amount whenever items change
    const total = formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    setTotalAmount(total);
  }, [formData.items]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSellerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      seller: {
        ...prev.seller,
        [field]: value,
      },
    }));
  };

  const handleCustomerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          partNumber: '',
          made: '',
          quantity: '',
          unitPrice: '',
          salePrice: '',
          subName: '',
          uom: '',
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!user) return;

    const invoice = {
      id: isNew ? Date.now().toString() : id,
      userId: user.id,
      ...formData,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    storageService.saveInvoice(invoice);
    alert('Invoice saved successfully!');
    navigate('/dashboard');
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const importedItems = data.map((row) => ({
          description: row['Item Description'] || row['Description'] || '',
          partNumber: row['Part Number'] || row['PartNumber'] || '',
          made: row['Made'] || '',
          quantity: row['Quantity'] || '',
          unitPrice: row['Unit Price'] || row['UnitPrice'] || '',
          salePrice: row['Sale Price'] || row['SalePrice'] || '',
          subName: row['Sub Name'] || row['SubName'] || '',
          uom: row['UOM'] || row['UOM/VUM'] || '',
        }));

        setFormData((prev) => ({
          ...prev,
          items: [...prev.items, ...importedItems],
        }));

        alert(`Imported ${importedItems.length} items successfully!`);
      } catch (error) {
        alert('Error importing Excel file: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleExcelExport = () => {
    if (formData.items.length === 0) {
      alert('No items to export');
      return;
    }

    const exportData = formData.items.map((item) => ({
      'Item Description': item.description,
      'Part Number': item.partNumber,
      'Made': item.made,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
      'Sale Price': item.salePrice,
      'Sub Name': item.subName,
      'UOM': item.uom,
      'Total': (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice Items');
    XLSX.writeFile(workbook, `invoice_${formData.invoiceNumber || 'export'}.xlsx`);
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('STOCK DISTRIBUTION SYSTEM', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Business Street, City, State 12345', pageWidth / 2, 40, { align: 'center' });
    doc.text('Phone: (555) 123-4567 | Email: info@company.com', pageWidth / 2, 47, { align: 'center' });

    let yPos = 60;

    // Invoice Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Number: ${formData.invoiceNumber || 'N/A'}`, margin, yPos);
    doc.text(`Date: ${formData.date || 'N/A'}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;
    doc.text(`Engagement Number: ${formData.engagementNumber || 'N/A'}`, margin, yPos);
    doc.text(`Status: ${formData.status?.toUpperCase() || 'PENDING'}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;

    // Seller and Customer Details
    const sellerText = `Seller:\n${formData.seller.name || 'N/A'}\n${formData.seller.address || ''}`;
    const customerText = `Customer:\n${formData.customer.name || 'N/A'}\n${formData.customer.address || ''}`;
    
    doc.text(sellerText, margin, yPos);
    doc.text(customerText, pageWidth - margin - 60, yPos, { align: 'right' });
    yPos += 30;

    // Items Table
    const tableData = formData.items.map((item) => [
      item.description || '',
      item.partNumber || '',
      item.made || '',
      item.quantity || '',
      item.unitPrice || '',
      item.salePrice || '',
      item.subName || '',
      item.uom || '',
      ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2),
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Description', 'Part #', 'Made', 'Qty', 'Unit Price', 'Sale Price', 'Sub Name', 'UOM', 'Total']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] },
      margin: { left: margin, right: margin },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total Amount
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });

    doc.save(`invoice_${formData.invoiceNumber || 'export'}.pdf`);
  };

  return (
    <div className="invoice-form-container">
      <header className="invoice-header">
        <h1>{isNew ? 'Create New Invoice' : 'Edit Invoice'}</h1>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
      </header>

      <div className="invoice-content">
        <div className="form-section">
          <h2>Transaction Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Engagement Number</label>
              <input
                type="text"
                value={formData.engagementNumber}
                onChange={(e) => handleInputChange('engagementNumber', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Seller Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Seller Name</label>
              <input
                type="text"
                value={formData.seller.name}
                onChange={(e) => handleSellerChange('name', e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Seller Address</label>
              <textarea
                value={formData.seller.address}
                onChange={(e) => handleSellerChange('address', e.target.value)}
                rows="2"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Customer Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Customer Address</label>
              <textarea
                value={formData.customer.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
                rows="2"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Invoice Items</h2>
            <div className="section-actions">
              <label className="import-button">
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelImport}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={handleExcelExport} className="export-button">
                Export Excel
              </button>
              <button onClick={addItem} className="add-item-button">
                + Add Item
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Part Number</th>
                  <th>Made</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Sale Price</th>
                  <th>Sub Name</th>
                  <th>UOM</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => handleItemChange(index, 'partNumber', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.made}
                        onChange={(e) => handleItemChange(index, 'made', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) => handleItemChange(index, 'salePrice', e.target.value)}
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.subName}
                        onChange={(e) => handleItemChange(index, 'subName', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.uom}
                        onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                      />
                    </td>
                    <td className="total-cell">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => removeItem(index)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {formData.items.length === 0 && (
                  <tr>
                    <td colSpan="10" className="empty-message">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="8" className="total-label">
                    <strong>Total Amount:</strong>
                  </td>
                  <td className="total-amount" colSpan="2">
                    <strong>${totalAmount.toFixed(2)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={handleSave} className="save-button">
            Save Invoice
          </button>
          <button onClick={handlePDFExport} className="pdf-button">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceForm;

