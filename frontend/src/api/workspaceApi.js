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

/**
 * Fetches the list of membership records (members) for a given workspace UUID.
 * @param {String} workspaceId
 * @returns {Promise<Array>} list of workspace members
 */
export const getWorkspaceMembers = async (workspaceId) => {
  const response = await apiClient.get(`/workspace/${workspaceId}/members`);
  return response.data;
};

/**
 * Sends a workspace member invitation email.
 * @param {Object} data - { email, role, workspaceId }
 * @returns {Promise<Object>} InviteMemberResponse
 */
export const inviteWorkspaceMember = async (data) => {
  const response = await apiClient.post('/workspace/invite', data);
  return response.data;
};

export default { listWorkspaces, createWorkspace, getWorkspaceMembers, inviteWorkspaceMember };
