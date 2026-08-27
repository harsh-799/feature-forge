import { request } from './apiClient';

export const createFeature = async (data) => {
  return request('/features/create', {
    method: 'POST',
    body: JSON.stringify(data)
  });
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
  return request(`/workspace/${workspaceId}/features?${query.toString()}`, {
    method: 'GET'
  });
};

export const getFeatureDetails = async (featureId, workspaceId) => {
  return request(`/workspace/${workspaceId}/features/${featureId}`, {
    method: 'GET'
  });
};

export const updateFeature = async (featureId, data) => {
  return request(`/features/${featureId}/edit`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const promoteFeature = async (featureId, data) => {
  return request(`/features/${featureId}/promote`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const repromoteFeature = async (featureId, data) => {
  return request(`/features/${featureId}/re-promote`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const verifyFeatureQA = async (featureId, data) => {
  return request(`/features/${featureId}/accept`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const rejectFeatureQA = async (featureId, data) => {
  return request(`/features/${featureId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const approveFeatureProduction = async (featureId, data) => {
  return request(`/features/${featureId}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const activateFeatureProduction = async (featureId, data) => {
  return request(`/features/${featureId}/production/activate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const updateRolloutProduction = async (featureId, data) => {
  return request(`/features/${featureId}/production/rollout`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deactivateFeatureProduction = async (featureId, data) => {
  return request(`/features/${featureId}/production/deactivate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const scheduleProductionAction = async (featureId, data) => {
  return request(`/features/${featureId}/production/schedule`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const activateFeatureDevelopment = async (featureId, data) => {
  return request(`/features/${featureId}/development/activate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deactivateFeatureDevelopment = async (featureId, data) => {
  return request(`/features/${featureId}/development/deactivate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const activateFeatureStaging = async (featureId, data) => {
  return request(`/features/${featureId}/staging/activate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deactivateFeatureStaging = async (featureId, data) => {
  return request(`/features/${featureId}/staging/deactivate`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteFeature = async (featureId, data) => {
  return request(`/features/${featureId}`, {
    method: 'DELETE',
    body: JSON.stringify(data)
  });
};

export const getDeveloperFlags = async (workspaceId, { page = 0, size = 6 } = {}) => {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('size', size);
  return request(`/workspace/${workspaceId}/features/my-flags?${query.toString()}`, {
    method: 'GET'
  });
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
  scheduleProductionAction,
  activateFeatureDevelopment,
  deactivateFeatureDevelopment,
  activateFeatureStaging,
  deactivateFeatureStaging,
  getDeveloperFlags,
  deleteFeature
};
