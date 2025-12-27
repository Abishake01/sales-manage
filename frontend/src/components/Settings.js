import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, upsertProfile, defaultProfile } from '../services/profileService';
import './Settings.css';

function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(defaultProfile);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setStatus('Loading settings...');
      const loaded = await getProfile(user.id);
      setProfile(loaded);
      setStatus('');
    };
    load();
  }, [user]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setStatus('Saving...');
    const { error } = await upsertProfile(user.id, profile);
    if (error) {
      setStatus(`Error: ${error.message || error}`);
    } else {
      setStatus('Saved!');
    }
    setIsSaving(false);
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p className="settings-subtitle">Company details shown in Enquiry, Quotation, and Purchase PDFs.</p>
      <form className="settings-form" onSubmit={handleSave}>
        <label className="settings-field">
          <span>Company Name</span>
          <input
            type="text"
            value={profile.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Your Company Name"
            required
          />
        </label>
        <label className="settings-field">
          <span>Address</span>
          <textarea
            value={profile.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Street, City, State, Zip"
            rows={3}
            required
          />
        </label>
        <div className="settings-grid">
          <label className="settings-field">
            <span>Phone</span>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91-XXXXXXXXXX"
              required
            />
          </label>
          <label className="settings-field">
            <span>Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@example.com"
              required
            />
          </label>
        </div>
        <label className="settings-field">
          <span>User Profile / Contact</span>
          <input
            type="text"
            value={profile.userProfile}
            onChange={(e) => handleChange('userProfile', e.target.value)}
            placeholder="Contact person"
          />
        </label>
        <div className="settings-actions">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <span className="status-text">{status}</span>
        </div>
      </form>
    </div>
  );
}

export default Settings;
