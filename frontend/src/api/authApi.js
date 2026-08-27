import { request } from './apiClient';

export const login = async (credentials) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const register = async (userData) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const changePassword = async (payload) => {
  return request('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
};

export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message === 'Validation failed' && data.errors && data.errors.length > 0) {
      return data.errors[0].message;
    }
    if (data.message) {
      return data.message;
    }
  }
  return error.message || 'Something went wrong. Please try again.';
};

export default { login, register, changePassword, getErrorMessage };
