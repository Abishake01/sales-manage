import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storageService from '../services/storageService';
import './PurchaseList.css';

function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [user] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
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

  const handleDelete = (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      storageService.deleteEnquiry(user.id, purchaseId);
      const userPurchases = storageService.getEnquiry(user.id);
      setPurchases(userPurchases || []);
    }
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
              <th>Purchase Number</th>
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
                <td>{purchase.enquiryNumber}</td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td>{purchase.customerName}</td>
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
                  <button className="delete-btn" onClick={() => handleDelete(purchase.id)}>
                    Delete
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
