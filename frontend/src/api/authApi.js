import axios from 'axios'

// Centralized base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Sends a login request to the FeatureForge backend.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} response data - { status, message, token }
 */
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * Sends a registration request to the FeatureForge backend.
 * @param {Object} userData - { fullName, email, password }
 * @returns {Promise<Object>} response data - { success, message }
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};
/**
 * Extracts a human-readable message from a backend error response.
 * Handles validation arrays, exception message keys, network outages, and generic fallbacks safely.
 * @param {Error} error - Axios error instance
 * @returns {String} formatted error message
 */
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    // Map field validation errors
    if (data.message === 'Validation failed' && data.errors && data.errors.length > 0) {
      return data.errors[0].message;
    }
    if (data.message) {
      return data.message;
    }
  }
  // No response was received (Network Down / Offline / Port Refused)
  if (error.request) {
    return 'Unable to connect to FeatureForge. Please try again.';
  }
  return 'Something went wrong. Please try again.';
};

export default { login, register, getErrorMessage };
