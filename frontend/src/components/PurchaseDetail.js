import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEnquiryWithItems } from '../services/enquiryService';
import { PurchasePDFTemplate } from './PurchasePDFTemplate';
import { getProfile, defaultProfile } from '../services/profileService';
import './PurchaseDetail.css';

function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(defaultProfile);

  useEffect(() => {
    const load = async () => {
      if (user?.id && id) {
        try {
          const data = await getEnquiryWithItems(id);
          setFormData(data);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to load purchase', e.message);
        }
      }
    };
    load();
  }, [id, user]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const profile = await getProfile(user.id);
      setCompanyProfile(profile);
    };
    loadProfile();
  }, [user]);

  if (!formData) {
    return (
      <div className="purchase-detail-container">
        <p>Loading purchase details...</p>
      </div>
    );
  }

  const handlePDFExport = () => {
    const purchaseData = {
      companyName: companyProfile.companyName || 'TUSIJI SPRITI INDIA PRIVATE LIMITED',
      companyAddress: companyProfile.address || 'Your Company Address Here',
      companyEmail: companyProfile.email || 'info@example.com',
      companyPhone: companyProfile.phone || '+91-XXXXXXXXXX',
      purchaseNo: formData.enquiryNumber || formData.engagementNumber || 'PO-' + Date.now(),
      purchaseDate: new Date(formData.date || Date.now()),
      validityDays: '30 Days',
      billTo: {
        name: formData.customer?.name || formData.customerName || 'Customer Name',
        address: formData.customer?.address || 'Customer Address',
        city: ''
      },
      shipTo: {
        name: formData.customer?.name || formData.customerName || 'Customer Name',
        address: formData.customer?.address || 'Customer Address',
        city: ''
      },
      placeOfDelivery: 'To your factory',
      deliveryTime: '6-8 Weeks',
      paymentTerms: '30 Days',
      items: formData.items?.map(item => ({
        description: item.description || '',
        model: item.partNumber || '',
        make: item.made || '',
        quantity: parseFloat(item.quantity) || 0,
        subPrice: parseFloat(item.salePrice) || 0
      })) || [],
      notes: 'GST 18% Extra. This purchase order is valid for 30 days.'
    };

    const doc = PurchasePDFTemplate.generatePDF(purchaseData);
    doc.save(`PurchaseOrder_${formData.enquiryNumber || 'export'}.pdf`);
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
              <strong>Enquiry Number:</strong> {formData.enquiryNumber || formData.engagementNumber || 'N/A'}
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
              <strong>Name:</strong> {formData.customer?.name || formData.customerName || 'N/A'}
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
