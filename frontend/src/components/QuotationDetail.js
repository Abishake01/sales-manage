import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './QuotationDetail.css';

function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState(location.state?.quotation || null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!formData && user) {
      const enquiry = storageService.getEnquiryById(user.id, id);
      if (enquiry) {
        setFormData(enquiry);
      }
    }
  }, [id, user, formData]);

  useEffect(() => {
    if (formData?.items) {
      const total = formData.items.reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      setTotalAmount(total);
    }
  }, [formData?.items]);

  if (!formData) {
    return <div className="quotation-detail-container"><p>Loading...</p></div>;
  }

  const handlePDFExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Quotation', margin, 30);
    
    let yPos = 30;

    doc.setFontSize(10);
    doc.text(`Quotation No: ${formData.enquiryNumber || 'N/A'}`, pageWidth - 80, yPos);
    yPos += 7;
    doc.text(`Date: ${formData.date || 'N/A'}`, pageWidth - 80, yPos);

    yPos = 60;

    doc.text(`Customer: ${formData.customer?.name || 'N/A'}`, margin, yPos);
    yPos += 7;
    doc.text(`Address: ${formData.customer?.address || ''}`, margin, yPos);
    yPos += 15;

    const tableData = formData.items.map((item, index) => [
      index + 1,
      item.description || '',
      item.partNumber || '',
      item.made || '',
      item.quantity || '',
      item.unitPrice || '',
      ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2),
      item.uom || '',
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['S.No', 'Description', 'Part no', 'Made', 'Quantity', 'Unit Price', 'Total', 'UOM']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      margin: { left: margin, right: margin },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total = ${totalAmount.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });

    doc.save(`quotation_${formData.enquiryNumber || 'export'}.pdf`);
  };

  return (
    <div className="quotation-detail-container">
      <header className="quotation-detail-header">
        <h1>Quotation Details</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/quotation')} className="back-button">
            ← Back
          </button>
          <button onClick={handlePDFExport} className="pdf-button">
            Download PDF
          </button>
        </div>
      </header>

      <div className="quotation-detail-content">
        <div className="quotation-info">
          <div className="info-section">
            <h3>Quotation Information</h3>
            <p><strong>Quotation No:</strong> {formData.enquiryNumber || 'N/A'}</p>
            <p><strong>Date:</strong> {formData.date || 'N/A'}</p>
            <p><strong>Status:</strong> {formData.status || 'pending'}</p>
          </div>

          <div className="info-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {formData.customer?.name || 'N/A'}</p>
            <p><strong>Address:</strong> {formData.customer?.address || 'N/A'}</p>
          </div>
        </div>

        <div className="quotation-items">
          <h3>Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Description</th>
                <th>Part No</th>
                <th>Made</th>
                <th>Quantity</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items?.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.description || ''}</td>
                  <td>{item.partNumber || ''}</td>
                  <td>{item.made || ''}</td>
                  <td>{item.quantity || ''}</td>
                  <td>{item.uom || ''}</td>
                  <td>${item.unitPrice || '0.00'}</td>
                  <td>${((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-section">
            <span className="total-label">Total Amount:</span>
            <span className="total-value">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationDetail;
