import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import './QuotationList.css';

function QuotationList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    if (user) {
      const userQuotations = storageService.getEnquiry(user.id);
      setQuotations(userQuotations);
    }
  }, [user]);

  const handleDelete = (quotationId) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      storageService.deleteEnquiry(user.id, quotationId);
      setQuotations(storageService.getEnquiry(user.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'closed':
        return '#27ae60';
      case 'partial':
        return '#f39c12';
      case 'pending':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="quotation-container">
      <header className="quotation-header">
        <div>
          <h1>Quotations</h1>
          <p>Manage your quotations</p>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="quotation-content">
        <div className="quotation-section">
          <h2>Your Quotations</h2>
          {quotations.length === 0 ? (
            <div className="empty-state">
              <p>No quotations yet. Select an enquiry to create a quotation.</p>
            </div>
          ) : (
            <div className="quotation-table-container">
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>Enquiry Number</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id}>
                      <td>{quotation.enquiryNumber || quotation.engagementNumber || 'N/A'}</td>
                      <td>{quotation.date || 'N/A'}</td>
                      <td>{quotation.customer?.name || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(quotation.status) }}
                        >
                          {quotation.status || 'pending'}
                        </span>
                      </td>
                      <td>${quotation.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/quotation/${quotation.id}`, { state: { quotation } })}
                          className="action-button view"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(quotation.id)}
                          className="action-button delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuotationList;
