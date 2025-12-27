import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`sidebar-item ${isActive('/enquiry') ? 'active' : ''}`}
          onClick={() => navigate('/enquiry')}
        >
          📝 Enquiry
        </button>
        <button
          className={`sidebar-item ${isActive('/quotation') ? 'active' : ''}`}
          onClick={() => navigate('/quotation')}
        >
          🎯 Quotation
        </button>
        <button
          className={`sidebar-item ${isActive('/purchase') ? 'active' : ''}`}
          onClick={() => navigate('/purchase')}
        >
          🛒 Purchase
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
