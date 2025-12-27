import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    if (user) {
      const userEnquiries = storageService.getEnquiries(user.id);
      setEnquiries(userEnquiries);
    }
  }, [user]);

  const handleDelete = (enquiryId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      storageService.deleteEnquiry(user.id, enquiryId);
      setEnquiries(storageService.getEnquiries(user.id));
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

        <div className="enquiries-section">
          <h2>Your Enquiries</h2>
          {enquiries.length === 0 ? (
            <div className="empty-state">
              <p>No enquiries yet. Create your first enquiry to get started.</p>
            </div>
          ) : (
            <div className="enquiries-table-container">
              <table className="enquiries-table">
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
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td>{enquiry.enquiryNumber || 'N/A'}</td>
                      <td>{enquiry.date || 'N/A'}</td>
                      <td>{enquiry.customer?.name || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(enquiry.status) }}
                        >
                          {enquiry.status || 'pending'}
                        </span>
                      </td>
                      <td>${enquiry.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/enquiry/${enquiry.id}`)}
                          className="action-button edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry.id)}
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

