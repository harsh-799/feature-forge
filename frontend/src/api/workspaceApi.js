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

export default {
  listWorkspaces,
  createWorkspace,
  getWorkspaceMembers,
  inviteWorkspaceMember,
  getInvitationDetails,
  acceptWorkspaceInvitation,
  getWorkspaceOverview,
  getWorkspaceActivity
};
