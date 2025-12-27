import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState([]);
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    totalQuotations: 0,
    totalPurchases: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (user) {
      const userEnquiry = storageService.getEnquiry(user.id);
      setEnquiry(userEnquiry);

      // Calculate stats
      const totalAmount = userEnquiry.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
      setStats({
        totalEnquiries: userEnquiry.length,
        totalQuotations: userEnquiry.length, // Same data source for now
        totalPurchases: userEnquiry.length,  // Same data source for now
        totalAmount: totalAmount,
      });
    }
  }, [user]);

  const handleDelete = (enquiryId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      storageService.deleteEnquiry(user.id, enquiryId);
      const updated = storageService.getEnquiry(user.id);
      setEnquiry(updated);
      const totalAmount = updated.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
      setStats({
        totalEnquiries: updated.length,
        totalQuotations: updated.length,
        totalPurchases: updated.length,
        totalAmount: totalAmount,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#27ae60';
      case 'In Progress':
        return '#f39c12';
      case 'Pending':
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
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Enquiries</h3>
              <p className="stat-number">{stats.totalEnquiries}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Total Quotations</h3>
              <p className="stat-number">{stats.totalQuotations}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>Total Purchases</h3>
              <p className="stat-number">{stats.totalPurchases}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Amount</h3>
              <p className="stat-number">₹ {stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h2>Analytics</h2>
          <div className="analytics-container">
            <div className="analytics-chart">
              <h3>Distribution Summary</h3>
              <div className="chart-placeholder">
                <p>📈 Charts coming soon</p>
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '200px', backgroundColor: '#667eea', borderRadius: '5px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '1rem' }}>
                        <div style={{ height: `${(stats.totalEnquiries / Math.max(stats.totalEnquiries, 1)) * 100}%`, width: '60px', backgroundColor: '#764ba2', borderRadius: '3px' }}></div>
                      </div>
                      <p style={{ marginTop: '0.5rem' }}>Enquiries</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '200px', backgroundColor: '#667eea', borderRadius: '5px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '1rem' }}>
                        <div style={{ height: `${(stats.totalQuotations / Math.max(stats.totalQuotations, 1)) * 100}%`, width: '60px', backgroundColor: '#764ba2', borderRadius: '3px' }}></div>
                      </div>
                      <p style={{ marginTop: '0.5rem' }}>Quotations</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '200px', backgroundColor: '#667eea', borderRadius: '5px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '1rem' }}>
                        <div style={{ height: `${(stats.totalPurchases / Math.max(stats.totalPurchases, 1)) * 100}%`, width: '60px', backgroundColor: '#764ba2', borderRadius: '3px' }}></div>
                      </div>
                      <p style={{ marginTop: '0.5rem' }}>Purchases</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="enquiry-section">
          <h2>Recent Enquiries</h2>
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
                  {enquiry.slice(0, 5).map((item) => (
                    <tr key={item.id}>
                      <td>{item.enquiryNumber || 'N/A'}</td>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{item.customerName || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {item.status || 'Draft'}
                        </span>
                      </td>
                      <td>₹ {parseFloat(item.totalAmount || 0).toFixed(2)}</td>
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

