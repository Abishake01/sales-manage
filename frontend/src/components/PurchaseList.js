import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import './PurchaseList.css';

function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      const userPurchases = storageService.getEnquiry(user.id);
      setPurchases(userPurchases || []);
    }
  }, [user]);

  const handleView = (purchaseId) => {
    navigate(`/purchase/${purchaseId}`);
  };

  

  const getStatusColor = (status) => {
    const colors = {
      Draft: '#95a5a6',
      'In Progress': '#f39c12',
      Completed: '#27ae60',
      Pending: '#e74c3c',
    };
    return colors[status] || '#95a5a6';
  };

  if (!purchases.length) {
    return (
      <div className="purchase-list-container">
        <h2>Your Purchases</h2>
        <p className="no-data">No purchases found. Start by creating a purchase.</p>
      </div>
    );
  }

  return (
    <div className="purchase-list-container">
      <h2>Your Purchases</h2>
      <div className="purchase-table-wrapper">
        <table className="purchase-table">
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
            {purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td>{purchase.enquiryNumber || purchase.engagementNumber || 'N/A'}</td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td>{purchase.customer?.name || purchase.customerName || 'N/A'}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(purchase.status) }}>
                    {purchase.status}
                  </span>
                </td>
                <td>₹ {parseFloat(purchase.totalAmount || 0).toFixed(2)}</td>
                <td className="actions-cell">
                  <button className="view-btn" onClick={() => handleView(purchase.id)}>
                    View
                  </button>
                   
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseList;
