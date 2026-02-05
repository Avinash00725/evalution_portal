import api from './api';

export const loginAdmin = async (credentials) => {
  const response = await api.post('/auth/admin/login', credentials);
  return response.data;
};

export const loginJudge = async (credentials) => {
  const response = await api.post('/auth/judge/login', credentials);
  return response.data;
};
