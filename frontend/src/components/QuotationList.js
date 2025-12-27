import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { listEnquiries } from '../services/enquiryService';
import './QuotationList.css';

function QuotationList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (user?.id) {
        const rows = await listEnquiries(user.id);
        setQuotations(rows || []);
      }
    };
    load();
  }, [user]);

  

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
