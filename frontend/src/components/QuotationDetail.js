import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { QuotationPDFTemplate } from './QuotationPDFTemplate';
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
    const quotationData = {
      companyName: 'TUSIJI SPRITI INDIA PRIVATE LIMITED',
      companyAddress: 'Your Company Address Here',
      companyEmail: 'info@example.com',
      companyPhone: '+91-XXXXXXXXXX',
      quotationNo: formData.enquiryNumber || 'Q-' + Date.now(),
      quotationDate: new Date(formData.date || Date.now()),
      validityDays: '30 Days',
      billTo: {
        name: formData.customer?.name || 'Customer Name',
        address: formData.customer?.address || 'Customer Address',
        city: formData.customer?.city || ''
      },
      shipTo: {
        name: formData.customer?.name || 'Customer Name',
        address: formData.customer?.address || 'Customer Address',
        city: formData.customer?.city || ''
      },
      placeOfDelivery: formData.customer?.address || 'To your factory',
      deliveryTime: '6-8 Weeks',
      paymentTerms: '30 Days',
      items: formData.items?.map(item => ({
        description: item.description || '',
        model: item.partNumber || '',
        make: item.made || '',
        hsn: item.hsn || '',
        moq: item.moq || '',
        uom: item.uom || 'Nos',
        unitPrice: parseFloat(item.unitPrice) || 0,
        quantity: parseFloat(item.quantity) || 0
      })) || [],
      notes: 'GST 18% Extra. This quotation is valid for 30 days. Warranty - Not applicable for import goods.'
    };

    const doc = QuotationPDFTemplate.generatePDF(quotationData);
    doc.save(`Quotation_${formData.enquiryNumber || 'export'}.pdf`);
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
