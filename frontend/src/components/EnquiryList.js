import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import './EnquiryList.css';

function EnquiryList() {
  const [enquiries, setEnquiries] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      const userEnquiries = storageService.getEnquiry(user.id);
      setEnquiries(userEnquiries || []);
    }
  }, [user]);

  const handleCreate = () => {
    navigate('/enquiry/new');
  };

  const handleEdit = (enquiryId) => {
    navigate(`/enquiry/${enquiryId}`);
  };

  const handleDelete = (enquiryId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      storageService.deleteEnquiry(user.id, enquiryId);
      const userEnquiries = storageService.getEnquiry(user.id);
      setEnquiries(userEnquiries || []);
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

  return (
    <div className="enquiry-list-container">
      <div className="enquiry-list-header">
        <h2>Your Enquiries</h2>
        <button className="create-btn" onClick={handleCreate}>
          + Create New Enquiry
        </button>
      </div>

      {!enquiries.length ? (
        <p className="no-data">No enquiries found. Create one to get started!</p>
      ) : (
        <div className="enquiry-table-wrapper">
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
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.enquiryNumber}</td>
                  <td>{new Date(enquiry.date).toLocaleDateString()}</td>
                  <td>{enquiry.customer?.name || enquiry.customerName || 'N/A'}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(enquiry.status) }}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td>₹ {parseFloat(enquiry.totalAmount || 0).toFixed(2)}</td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEdit(enquiry.id)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(enquiry.id)}>
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
  );
}

export default EnquiryList;
