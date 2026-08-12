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

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData } };
  }
  return response.json();
};

export const createFeature = async (data) => {
  const response = await fetch(`${API_BASE_URL}/features/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const listFeatures = async (workspaceId, { page = 0, size = 6, status = null, keyword = '', environment = null } = {}) => {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('size', size);
  if (status) {
    query.append('status', status);
  }
  if (keyword) {
    query.append('keyword', keyword);
  }
  if (environment) {
    query.append('environment', environment);
  }
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/features?${query.toString()}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const getFeatureDetails = async (featureId, workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}?workspaceId=${workspaceId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const updateFeature = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/edit`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const promoteFeature = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/promote`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const repromoteFeature = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/re-promote`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const verifyFeatureQA = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/accept`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const rejectFeatureQA = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/reject`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const approveFeatureProduction = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/approve`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const activateFeatureProduction = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/production/activate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const updateRolloutProduction = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/production/rollout`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deactivateFeatureProduction = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/production/deactivate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const activateFeatureDevelopment = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/development/activate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deactivateFeatureDevelopment = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/development/deactivate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const activateFeatureStaging = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/staging/activate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const deactivateFeatureStaging = async (featureId, data) => {
  const response = await fetch(`${API_BASE_URL}/features/${featureId}/staging/deactivate`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export default {
  createFeature,
  listFeatures,
  getFeatureDetails,
  updateFeature,
  promoteFeature,
  repromoteFeature,
  verifyFeatureQA,
  rejectFeatureQA,
  approveFeatureProduction,
  activateFeatureProduction,
  updateRolloutProduction,
  deactivateFeatureProduction,
  activateFeatureDevelopment,
  deactivateFeatureDevelopment,
  activateFeatureStaging,
  deactivateFeatureStaging
};
