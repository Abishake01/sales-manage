import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (user) {
      const userInvoices = storageService.getInvoices(user.id);
      setInvoices(userInvoices);
    }
  }, [user]);

  const handleDelete = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      storageService.deleteInvoice(user.id, invoiceId);
      setInvoices(storageService.getInvoices(user.id));
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
            onClick={() => navigate('/invoice/new')}
            className="primary-button"
          >
            + Create New Invoice
          </button>
        </div>

        <div className="invoices-section">
          <h2>Your Invoices</h2>
          {invoices.length === 0 ? (
            <div className="empty-state">
              <p>No invoices yet. Create your first invoice to get started.</p>
            </div>
          ) : (
            <div className="invoices-table-container">
              <table className="invoices-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNumber || 'N/A'}</td>
                      <td>{invoice.date || 'N/A'}</td>
                      <td>{invoice.customer?.name || 'N/A'}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(invoice.status) }}
                        >
                          {invoice.status || 'pending'}
                        </span>
                      </td>
                      <td>${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/invoice/${invoice.id}`)}
                          className="action-button edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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

