import api from './api';

export const getAllTeams = async () => {
  const response = await api.get('/admin/teams');
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/admin/teams', teamData);
  return response.data;
};

export const updateTeam = async (id, teamData) => {
  const response = await api.put(`/admin/teams/${id}`, teamData);
  return response.data;
};

export const deleteTeam = async (id) => {
  const response = await api.delete(`/admin/teams/${id}`);
  return response.data;
};

export const getAllJudges = async () => {
  const response = await api.get('/admin/judges');
  return response.data;
};

export const createJudge = async (judgeData) => {
  const response = await api.post('/admin/judges', judgeData);
  return response.data;
};

export const updateJudge = async (id, judgeData) => {
  const response = await api.put(`/admin/judges/${id}`, judgeData);
  return response.data;
};

export const deleteJudge = async (id) => {
  const response = await api.delete(`/admin/judges/${id}`);
  return response.data;
};

export const getAllLeaderboards = async () => {
  const response = await api.get('/admin/leaderboards/all');
  return response.data;
};

export const getLeaderboardByEvent = async (eventType) => {
  const response = await api.get(`/admin/leaderboard/${eventType}`);
  return response.data;
};

export const getTeamAnalytics = async (teamId) => {
  const response = await api.get(`/admin/analytics/team/${teamId}`);
  return response.data;
};
