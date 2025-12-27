import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EnquiryForm from './components/EnquiryForm';
import EnquiryList from './components/EnquiryList';
import QuotationList from './components/QuotationList';
import QuotationDetail from './components/QuotationDetail';
import PurchaseList from './components/PurchaseList';
import PurchaseDetail from './components/PurchaseDetail';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enquiry" element={<EnquiryList />} />
          <Route path="/enquiry/new" element={<EnquiryForm />} />
          <Route path="/enquiry/:id" element={<EnquiryForm />} />
          <Route path="/quotation" element={<QuotationList />} />
          <Route path="/quotation/:id" element={<QuotationDetail />} />
          <Route path="/purchase" element={<PurchaseList />} />
          <Route path="/purchase/:id" element={<PurchaseDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

