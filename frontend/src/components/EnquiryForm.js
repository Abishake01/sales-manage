import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './EnquiryForm.css';

function EnquiryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id;

  const [formData, setFormData] = useState({
    engagementNumber: '',
    enquiryNumber: '',
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
      const enquiry = storageService.getEnquiry(user.id, id);
      if (enquiry) {
        setFormData(enquiry);
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

    const enquiry = {
      id: isNew ? Date.now().toString() : id,
      userId: user.id,
      ...formData,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    storageService.saveEnquiry(enquiry);
    alert('Enquiry saved successfully!');
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
          partNumber: row['Part Number'] || row['PartNumber'] || row['Part no'] || '',
          made: row['Made'] || '',
          quantity: row['Quantity'] || row['quantity'] || '',
          unitPrice: row['Unit Price'] || row['UnitPrice'] || row['unit price'] || '',
          salePrice: row['Sale Price'] || row['SalePrice'] || row['sale price'] || '',
          subName: row['Sub Name'] || row['SubName'] || row['sub name'] || '',
          uom: row['UOM'] || row['UOM/VUM'] || row['vum'] || '',
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

    const exportData = formData.items.map((item, index) => ({
      'S.No': index + 1,
      'Description': item.description,
      'Part no': item.partNumber,
      'Made': item.made,
      'Quantity': item.quantity,
      'Unit Price': item.unitPrice,
      'Total': (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
      'Sub Name': item.subName,
      'Sale Price': item.salePrice,
      'VUM': item.uom,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiry Items');
    XLSX.writeFile(workbook, `enquiry_${formData.enquiryNumber || 'export'}.xlsx`);
  };

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Company Name', margin, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Address', margin, 40);

    let yPos = 30;

    // Enquiry Details (right side)
    doc.setFontSize(10);
    doc.text(`Enquiry No: ${formData.engagementNumber || 'N/A'}`, pageWidth - 80, yPos);
    yPos += 7;
    doc.text(`Date: ${formData.date || 'N/A'}`, pageWidth - 80, yPos);
    yPos += 7;
    doc.text(`Enquiry: ${formData.enquiryNumber || 'N/A'}`, pageWidth - 80, yPos);
    yPos += 7;
    doc.text(`Status: ${formData.status || 'pending'}`, pageWidth - 80, yPos);

    yPos = 60;

    // Customer Details
    doc.text(`customer name: ${formData.customer.name || 'N/A'}`, margin, yPos);
    yPos += 7;
    doc.text(`Address: ${formData.customer.address || ''}`, margin, yPos);
    yPos += 15;

    // Items Table
    const tableData = formData.items.map((item, index) => [
      index + 1,
      item.description || '',
      item.partNumber || '',
      item.made || '',
      item.quantity || '',
      item.unitPrice || '',
      ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2),
      item.subName || '',
      item.salePrice || '',
      item.uom || '',
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['s.no', 'Description', 'Part no', 'made', 'quantity', 'unit price', 'total', 'sub name', 'sale price', 'vum']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      margin: { left: margin, right: margin },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total Amount
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total = ${totalAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });

    doc.save(`enquiry_${formData.enquiryNumber || 'export'}.pdf`);
  };

  return (
    <div className="enquiry-form-container">
      <header className="enquiry-header">
        <h1>{isNew ? 'Create New Enquiry' : 'Edit Enquiry'}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Back to Dashboard
          </button>
          <button onClick={handleSave} className="save-button">
            Save Enquiry
          </button>
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
          <button onClick={handlePDFExport} className="pdf-button">
            Download PDF
          </button>
        </div>
      </header>

      <div className="enquiry-content">
        <div className="enquiry-template">
          {/* Top Section: Company Info and Engagement Details */}
          <div className="top-section">
            <div className="company-box">
              <div className="company-name">Company name</div>
              <div className="company-address">Address</div>
            </div>
            
            <div className="engagement-details">
              <div className="detail-row">
                <label>Enquire No:</label>
                <input
                  type="text"
                  value={formData.engagementNumber}
                  onChange={(e) => handleInputChange('engagementNumber', e.target.value)}
                  placeholder="Enter enquire number"
                />
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <div className="detail-row">
                <label>status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="closed">closed</option>
                  <option value="partial">partial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="customer-section">
            <div className="customer-row">
              <label>customer name:</label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div className="customer-row">
              <label>Address:</label>
              <textarea
                value={formData.customer.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
                rows="2"
                placeholder="Enter customer address"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="table-section">
            <div className="table-actions">
              <button onClick={addItem} className="add-item-button">
                + Add Item
              </button>
            </div>
            
            <div className="table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>s.no</th>
                    <th>Description</th>
                    <th>Part no</th>
                    <th>made</th>
                    <th>quantity</th>
                    <th>unit price</th>
                    <th>total</th>
                    <th>sub name</th>
                    <th>sub price</th>
                    <th>UOM</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="sno-cell">{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.partNumber}
                          onChange={(e) => handleItemChange(index, 'partNumber', e.target.value)}
                          placeholder="Part no"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.made}
                          onChange={(e) => handleItemChange(index, 'made', e.target.value)}
                          placeholder="Made"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          step="0.01"
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="total-cell">
                        {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.subName}
                          onChange={(e) => handleItemChange(index, 'subName', e.target.value)}
                          placeholder="Sub name"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.salePrice}
                          onChange={(e) => handleItemChange(index, 'salePrice', e.target.value)}
                          step="0.01"
                          placeholder="0.00"
                        />
                      </td>
                      <td>
                        <select
                          value={item.uom}
                          onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                          className="uom-select"
                        >
                          <option value="">Select UOM</option>
                          <option value="nes">nes</option>
                          <option value="pcts">pcts</option>
                          <option value="pks">pks</option>
                          <option value="ltrs">ltrs</option>
                          <option value="roll">roll</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => removeItem(index)}
                          className="remove-button"
                          title="Remove item"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formData.items.length === 0 && (
                    <tr>
                      <td colSpan="11" className="empty-message">
                        No items added. Click "+ Add Item" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="total-section">
              <span className="total-label">Total =</span>
              <span className="total-value">{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnquiryForm;
