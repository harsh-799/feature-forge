const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const listWorkspaces = async () => {
  const response = await fetch(`${API_BASE_URL}/workspace/list`, {
    method: 'GET',
    headers: getHeaders()
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData } };
  }
  
  return response.json();
};

export default { listWorkspaces };
