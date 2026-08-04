import apiClient from './apiClient'

/**
 * Fetches all workspaces/projects associated with the authenticated user.
 * @returns {Promise<Array>} list of workspaces
 */
export const listWorkspaces = async () => {
  const response = await apiClient.get('/workspace/list');
  return response.data;
};

/**
 * Creates a new workspace/project on the backend.
 * @param {Object} data - { workspaceName }
 * @returns {Promise<Object>} WorkspaceCreationResponse - { status, message, workspaceId, apiKeys }
 */
export const createWorkspace = async (data) => {
  const response = await apiClient.post('/workspace/create', data);
  return response.data;
};

export default { listWorkspaces, createWorkspace };
