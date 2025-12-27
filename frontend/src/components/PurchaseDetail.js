import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { storageService } from '../services/storageService';
import './PurchaseDetail.css';

function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    enquiryNumber: '',
    date: '',
    customerName: '',
    status: 'Draft',
    items: [],
  });
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user?.id && id) {
      const purchase = storageService.getEnquiryById(user.id, id);
      if (purchase) {
        setFormData(purchase);
      }
    }
  }, [id, user]);

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Purchase Order', pageWidth / 2, 20, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Purchase Info
    doc.setFontSize(11);
    doc.text(`Purchase Number: ${formData.enquiryNumber}`, 15, 45);
    doc.text(`Date: ${new Date(formData.date).toLocaleDateString()}`, 15, 55);
    doc.text(`Customer: ${formData.customerName}`, 15, 65);
    doc.text(`Status: ${formData.status}`, 15, 75);

    // Table
    const tableData = formData.items.map((item, index) => [
      index + 1,
      item.description || '',
      item.partNumber || '',
      item.made || '',
      item.quantity || '',
      item.salePrice || '',
      ((parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0)).toFixed(2),
    ]);

    doc.autoTable({
      head: [['S.No', 'Description', 'Part No', 'Made', 'Quantity', 'Sub Price', 'Total']],
      body: tableData,
      startY: 95,
      margin: { left: 15, right: 15 },
      styles: {
        cellPadding: 8,
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Total
    const totalAmount = formData.items.reduce((sum, item) => {
      return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0));
    }, 0);

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: ₹ ${totalAmount.toFixed(2)}`, pageWidth - 15, finalY, { align: 'right' });

    // Save PDF
    doc.save(`Purchase_${formData.enquiryNumber}.pdf`);
  };

  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0));
  }, 0);

  return (
    <div className="purchase-detail-container">
      <div className="purchase-detail-header">
        <h1>Purchase Order</h1>
        <div className="header-actions">
          <button className="back-button" onClick={() => navigate('/purchase')}>
            Back
          </button>
          <button className="pdf-button" onClick={handlePDFExport}>
            Export PDF
          </button>
        </div>
      </div>

      <div className="purchase-detail-content">
        <div className="purchase-info">
          <div className="info-section">
            <h3>Purchase Details</h3>
            <p>
              <strong>Purchase Number:</strong> {formData.enquiryNumber}
            </p>
            <p>
              <strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {formData.status}
            </p>
          </div>
          <div className="info-section">
            <h3>Customer Information</h3>
            <p>
              <strong>Name:</strong> {formData.customerName}
            </p>
          </div>
        </div>

        <div className="purchase-items">
          <h3>Purchase Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Description</th>
                <th>Part No</th>
                <th>Made</th>
                <th>Quantity</th>
                <th>Sub Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description || ''}</td>
                  <td>{item.partNumber || ''}</td>
                  <td>{item.made || ''}</td>
                  <td>{item.quantity || ''}</td>
                  <td>₹ {parseFloat(item.salePrice || 0).toFixed(2)}</td>
                  <td>₹ {((parseFloat(item.quantity) || 0) * (parseFloat(item.salePrice) || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-section">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">₹ {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetail;
