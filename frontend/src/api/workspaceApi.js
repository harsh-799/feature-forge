import { request } from './apiClient';

export const listWorkspaces = async () => {
  const resData = await request('/workspace', {
    method: 'GET'
  });
  return resData.data || [];
};

export const createWorkspace = async (data) => {
  return request('/workspace/create', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getWorkspaceMembers = async (workspaceId) => {
  return request(`/workspace/${workspaceId}/members`, {
    method: 'GET'
  });
};

export const inviteWorkspaceMember = async (data) => {
  return request('/workspace/invite', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getInvitationDetails = async (token) => {
  return request(`/workspace/invitation/${token}`, {
    method: 'GET'
  });
};

export const acceptWorkspaceInvitation = async (token) => {
  return request('/workspace/accept', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
};

export const getWorkspaceOverview = async (workspaceId) => {
  return request(`/workspace/${workspaceId}/overview`, {
    method: 'GET'
  });
};

export const getWorkspaceActivities = async (workspaceId, params = {}) => {
  const query = new URLSearchParams();
  const page = params.page !== undefined ? params.page : 0;
  const size = params.size !== undefined ? params.size : 10;
  query.append('page', page);
  query.append('size', size);
  if (params.activityType) query.append('activityType', params.activityType);
  if (params.userId) query.append('userId', params.userId);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);

  return request(`/workspace/${workspaceId}/activities?${query.toString()}`, {
    method: 'GET'
  });
};

export const getWorkspaceActivity = getWorkspaceActivities;

export const removeWorkspaceMember = async (workspaceId, memberId) => {
  return request(`/workspace/${workspaceId}/members/${memberId}`, {
    method: 'DELETE'
  });
};

export const getPendingInvitations = async (workspaceId) => {
  return request(`/workspace/${workspaceId}/invitations?status=PENDING`, {
    method: 'GET'
  });
};

export const revokeWorkspaceInvitation = async (workspaceId, invitationId) => {
  return request(`/workspace/${workspaceId}/invitations/${invitationId}`, {
    method: 'DELETE'
  });
};

export const leaveWorkspace = async (workspaceId) => {
  return request(`/workspace/${workspaceId}/members/me`, {
    method: 'DELETE'
  });
};

export const deleteWorkspace = async (workspaceId) => {
  return request(`/workspace/${workspaceId}`, {
    method: 'DELETE'
  });
};

export const regenerateApiKey = async (workspaceId, envData) => {
  const payload = typeof envData === 'object' ? envData : { environmentName: envData };
  return request(`/workspace/${workspaceId}/regenerate-api-key`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const getFeatureOverview = async (workspaceId) => {
  return request(`/workspace/${workspaceId}/dashboard/feature-overview`, {
    method: 'GET'
  });
};

export default {
  listWorkspaces,
  createWorkspace,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  getInvitationDetails,
  acceptWorkspaceInvitation,
  getWorkspaceOverview,
  getWorkspaceActivities,
  getWorkspaceActivity,
  removeWorkspaceMember,
  getPendingInvitations,
  revokeWorkspaceInvitation,
  leaveWorkspace,
  deleteWorkspace,
  regenerateApiKey,
  getFeatureOverview
};
