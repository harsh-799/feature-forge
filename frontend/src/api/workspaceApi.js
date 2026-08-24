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

// Handle common response mapping & Axios compatibility error shape throwing
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { response: { data: errorData } };
  }
  return response.json();
};

export const listWorkspaces = async () => {
  const response = await fetch(`${API_BASE_URL}/workspace`, {
    method: 'GET',
    headers: getHeaders()
  });
  const resData = await handleResponse(response);
  // console.log(resData);
  return resData.data || [];
};

export const createWorkspace = async (data) => {
  const response = await fetch(`${API_BASE_URL}/workspace/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getWorkspaceMembers = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/members`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const inviteWorkspaceMember = async (data) => {
  const response = await fetch(`${API_BASE_URL}/workspace/invite`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
};

export const getInvitationDetails = async (token) => {
  const response = await fetch(`${API_BASE_URL}/workspace/invitation/${token}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const acceptWorkspaceInvitation = async (token) => {
  const response = await fetch(`${API_BASE_URL}/workspace/accept`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ token })
  });
  return handleResponse(response);
};

export const getWorkspaceOverview = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/overview`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const getWorkspaceActivity = async (workspaceId, page = 0, size = 10) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/activity?page=${page}&size=${size}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const removeWorkspaceMember = async (workspaceId, memberId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/members/${memberId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const getPendingInvitations = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/invitations?status=PENDING`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const revokeWorkspaceInvitation = async (workspaceId, invitationId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/invitations/${invitationId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const leaveWorkspace = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/members/me`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const deleteWorkspace = async (workspaceId) => {
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

export const regenerateApiKey = async (workspaceId, envData) => {
  const payload = typeof envData === 'object' ? envData : { environmentName: envData };
  const response = await fetch(`${API_BASE_URL}/workspace/${workspaceId}/regenerate-api-key`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
};

export default {
  listWorkspaces,
  createWorkspace,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  getInvitationDetails,
  acceptWorkspaceInvitation,
  getWorkspaceOverview,
  getWorkspaceActivity,
  removeWorkspaceMember,
  getPendingInvitations,
  revokeWorkspaceInvitation,
  leaveWorkspace,
  deleteWorkspace,
  regenerateApiKey
};

