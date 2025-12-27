// localStorage service for managing all application data

const STORAGE_KEYS = {
  USERS: 'stock_distribution_users',
  CURRENT_USER: 'stock_distribution_current_user',
  ENQUIRIES: 'stock_distribution_enquiries',
  CUSTOMERS: 'stock_distribution_customers',
  SELLERS: 'stock_distribution_sellers',
};

class StorageService {
  // User management
  getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  addUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Enquiry management
  getEnquiries(userId) {
    const enquiries = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    const allEnquiries = enquiries ? JSON.parse(enquiries) : [];
    return allEnquiries.filter(enq => enq.userId === userId);
  }

  getEnquiry(userId, enquiryId) {
    const enquiries = this.getEnquiries(userId);
    return enquiries.find(enq => enq.id === enquiryId);
  }

  saveEnquiry(enquiry) {
    const enquiries = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    const allEnquiries = enquiries ? JSON.parse(enquiries) : [];
    
    const existingIndex = allEnquiries.findIndex(enq => enq.id === enquiry.id);
    
    if (existingIndex >= 0) {
      allEnquiries[existingIndex] = enquiry;
    } else {
      allEnquiries.push(enquiry);
    }
    
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(allEnquiries));
  }

  deleteEnquiry(userId, enquiryId) {
    const enquiries = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    const allEnquiries = enquiries ? JSON.parse(enquiries) : [];
    const filtered = allEnquiries.filter(
      enq => !(enq.userId === userId && enq.id === enquiryId)
    );
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(filtered));
  }

  // Customer management
  getCustomers(userId) {
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const allCustomers = customers ? JSON.parse(customers) : [];
    return allCustomers.filter(c => c.userId === userId);
  }

  saveCustomer(customer) {
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const allCustomers = customers ? JSON.parse(customers) : [];
    
    const existingIndex = allCustomers.findIndex(c => c.id === customer.id);
    
    if (existingIndex >= 0) {
      allCustomers[existingIndex] = customer;
    } else {
      allCustomers.push(customer);
    }
    
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCustomers));
  }

  // Seller management
  getSellers(userId) {
    const sellers = localStorage.getItem(STORAGE_KEYS.SELLERS);
    const allSellers = sellers ? JSON.parse(sellers) : [];
    return allSellers.filter(s => s.userId === userId);
  }

  saveSeller(seller) {
    const sellers = localStorage.getItem(STORAGE_KEYS.SELLERS);
    const allSellers = sellers ? JSON.parse(sellers) : [];
    
    const existingIndex = allSellers.findIndex(s => s.id === seller.id);
    
    if (existingIndex >= 0) {
      allSellers[existingIndex] = seller;
    } else {
      allSellers.push(seller);
    }
    
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(allSellers));
  }
}

export const storageService = new StorageService();

