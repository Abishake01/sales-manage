// API service for connecting to Express.js backend
// This service can be used to switch from localStorage to API-based storage

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(username, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: { username, password },
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // Enquiries
  async getEnquiries() {
    return this.request('/enquiries');
  }

  async getEnquiry(id) {
    return this.request(`/enquiries/${id}`);
  }

  async saveEnquiry(enquiry) {
    return this.request('/enquiries', {
      method: 'POST',
      body: enquiry,
    });
  }

  async deleteEnquiry(id) {
    return this.request(`/enquiries/${id}`, {
      method: 'DELETE',
    });
  }

  // Customers
  async getCustomers() {
    return this.request('/customers');
  }

  async saveCustomer(customer) {
    return this.request('/customers', {
      method: 'POST',
      body: customer,
    });
  }

  // Sellers
  async getSellers() {
    return this.request('/sellers');
  }

  async saveSeller(seller) {
    return this.request('/sellers', {
      method: 'POST',
      body: seller,
    });
  }
}

export const apiService = new ApiService();

