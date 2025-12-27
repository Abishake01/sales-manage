import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState([]);

  useEffect(() => {
    if (user) {
      const userEnquiry = storageService.getEnquiry(user.id);
      setEnquiry(userEnquiry);
    }
  }, [user]);

  const handleDelete = (enquiryId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      storageService.deleteEnquiry(user.id, enquiryId);
      setEnquiry(storageService.getEnquiry(user.id));
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Stock Distribution System</h1>
          <p>Welcome, {user?.username}</p>
        </div>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button
            onClick={() => navigate('/enquiry/new')}
            className="primary-button"
          >
            + Create New Enquiry
          </button>
        </div>

        <div className="enquiry-section">
          <h2>Your Enquiry</h2>
          {enquiry.length === 0 ? (
            <div className="empty-state">
              <p>No enquiry yet. Create your first enquiry to get started.</p>
            </div>
          ) : (
            <div className="enquiry-table-container">
              <table className="enquiry-table">
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
                  {enquiry.map((item) => (
                    <tr key={item.id}>
                      <td>{item.enquiryNumber || 'N/A'}</td>
                      <td>{item.date || 'N/A'}</td>
                      <td>{item.customer?.name || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td>${item.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/enquiry/${item.id}`)}
                          className="action-button edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

export default Dashboard;

