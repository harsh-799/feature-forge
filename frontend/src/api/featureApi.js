import apiClient from './apiClient'

/**
 * Creates a new feature flag.
 * @param {Object} data - { name, description, workspaceId }
 * @returns {Promise<Object>} FeatureCreationResponse
 */
export const createFeature = async (data) => {
  const response = await apiClient.post('/features/create', data);
  return response.data;
};

/**
 * Fetches the paginated list of feature flags for a workspace.
 * @param {String} workspaceId
 * @param {Object} params - { page, size, status }
 * @returns {Promise<Object>} FeaturesPageResponse
 */
export const listFeatures = async (workspaceId, { page = 0, size = 6, status = null } = {}) => {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('size', size);
  if (status) {
    query.append('status', status);
  }
  const response = await apiClient.get(`/workspace/${workspaceId}/features?${query.toString()}`);
  return response.data;
};

/**
 * Searches and filters feature flags by keyword.
 * @param {String} workspaceId
 * @param {Object} params - { keyword, page, size, status }
 * @returns {Promise<Object>} FeaturesPageResponse
 */
export const searchFeatures = async (workspaceId, { keyword = '', page = 0, size = 6, status = null } = {}) => {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('size', size);
  query.append('keyword', keyword);
  if (status) {
    query.append('status', status);
  }
  const response = await apiClient.get(`/workspace/${workspaceId}/features/search?${query.toString()}`);
  return response.data;
};

/**
 * Fetches the detailed configuration of a single feature flag.
 * @param {Number} featureId
 * @param {String} workspaceId
 * @returns {Promise<Object>} FeatureDetailsResponse
 */
export const getFeatureDetails = async (featureId, workspaceId) => {
  const response = await apiClient.get(`/features/${featureId}?workspaceId=${workspaceId}`);
  return response.data;
};

/**
 * Edits a feature flag (name/description) while in DEVELOPMENT.
 * @param {Number} featureId
 * @param {Object} data - { name, description, workspaceId }
 * @returns {Promise<Object>} FeatureUpdationResponse
 */
export const updateFeature = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/edit`, data);
  return response.data;
};

/**
 * Promotes a feature to Staging (sets status to READY_FOR_QA).
 * @param {Number} featureId
 * @param {Object} data - { workspaceID } (Note capital ID from DTO)
 * @returns {Promise<Object>} PromoteToStagingResponse
 */
export const promoteFeature = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/promote`, data);
  return response.data;
};

/**
 * Re-promotes a rejected feature flag (sets status to READY_FOR_QA).
 * @param {Number} featureId
 * @param {Object} data - { workspaceID } (Note capital ID from DTO)
 * @returns {Promise<Object>} PromoteToStagingResponse
 */
export const repromoteFeature = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/re-promote`, data);
  return response.data;
};

/**
 * Verifies a feature by QA (sets status to QA_VERIFIED).
 * @param {Number} featureId
 * @param {Object} data - { workspaceId }
 * @returns {Promise<Object>} FeatureQAVerificationResponse
 */
export const verifyFeatureQA = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/accept`, data);
  return response.data;
};

/**
 * Rejects a feature by QA (sets status to QA_REJECTED).
 * @param {Number} featureId
 * @param {Object} data - { workspaceId, rejectionReason }
 * @returns {Promise<Object>} FeatureQARejectionResponse
 */
export const rejectFeatureQA = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/reject`, data);
  return response.data;
};

/**
 * Approves a feature for production (sets status to IN_PRODUCTION).
 * @param {Number} featureId
 * @param {Object} data - { workspaceId }
 * @returns {Promise<Object>} FeatureProductionApprovalResponse
 */
export const approveFeatureProduction = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/approve`, data);
  return response.data;
};

/**
 * Activates a feature in production with an initial rollout percentage.
 * @param {Number} featureId
 * @param {Object} data - { workspaceId, rolloutPercentage }
 * @returns {Promise<Object>} FeatureProductionActivationResponse
 */
export const activateFeatureProduction = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/production/activate`, data);
  return response.data;
};

/**
 * Updates a feature's rollout percentage in production.
 * @param {Number} featureId
 * @param {Object} data - { workspaceId, rolloutPercentage }
 * @returns {Promise<Object>} FeatureProductionRolloutResponse
 */
export const updateRolloutProduction = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/production/rollout`, data);
  return response.data;
};

/**
 * Deactivates a feature in production.
 * @param {Number} featureId
 * @param {Object} data - { workspaceId }
 * @returns {Promise<Object>} FeatureProductionDeactivationResponse
 */
export const deactivateFeatureProduction = async (featureId, data) => {
  const response = await apiClient.patch(`/features/${featureId}/production/deactivate`, data);
  return response.data;
};

export default {
  createFeature,
  listFeatures,
  searchFeatures,
  getFeatureDetails,
  updateFeature,
  promoteFeature,
  repromoteFeature,
  verifyFeatureQA,
  rejectFeatureQA,
  approveFeatureProduction,
  activateFeatureProduction,
  updateRolloutProduction,
  deactivateFeatureProduction
};
