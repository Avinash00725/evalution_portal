import api from './api';

export const getAssignedTeams = async () => {
  const response = await api.get('/judge/teams/assigned');
  return response.data;
};

export const getAllTeams = async () => {
  const response = await api.get('/judge/teams/all');
  return response.data;
};

export const createOrUpdateEvaluation = async (evaluationData) => {
  const response = await api.post('/judge/evaluations', evaluationData);
  return response.data;
};

export const getEvaluationForTeam = async (teamId) => {
  const response = await api.get(`/judge/evaluations/team/${teamId}`);
  return response.data;
};

export const getAllLeaderboards = async () => {
  const response = await api.get('/judge/leaderboards/all');
  return response.data;
};

export const getLeaderboardByEvent = async (eventType) => {
  const response = await api.get(`/judge/leaderboard/${eventType}`);
  return response.data;
};

export const getTeamAnalytics = async (teamId) => {
  const response = await api.get(`/judge/analytics/team/${teamId}`);
  return response.data;
};

export const selectTeamForRound2 = async (teamId) => {
  const response = await api.post(`/judge/teams/${teamId}/select-round2`);
  return response.data;
};
