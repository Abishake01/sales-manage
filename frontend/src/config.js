// Configuration file to switch between localStorage and API modes

// Set to true to use API backend, false to use localStorage
export const USE_API = process.env.REACT_APP_USE_API === 'true' || false;

// API base URL (only used when USE_API is true)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

