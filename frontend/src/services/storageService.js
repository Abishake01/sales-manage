// localStorage service for managing all application data

const STORAGE_KEYS = {
  USERS: 'stock_distribution_users',
  CURRENT_USER: 'stock_distribution_current_user',
  INVOICES: 'stock_distribution_invoices',
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

  // Invoice management
  getInvoices(userId) {
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const allInvoices = invoices ? JSON.parse(invoices) : [];
    return allInvoices.filter(inv => inv.userId === userId);
  }

  getInvoice(userId, invoiceId) {
    const invoices = this.getInvoices(userId);
    return invoices.find(inv => inv.id === invoiceId);
  }

  saveInvoice(invoice) {
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const allInvoices = invoices ? JSON.parse(invoices) : [];
    
    const existingIndex = allInvoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      allInvoices[existingIndex] = invoice;
    } else {
      allInvoices.push(invoice);
    }
    
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(allInvoices));
  }

  deleteInvoice(userId, invoiceId) {
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
    const allInvoices = invoices ? JSON.parse(invoices) : [];
    const filtered = allInvoices.filter(
      inv => !(inv.userId === userId && inv.id === invoiceId)
    );
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filtered));
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

