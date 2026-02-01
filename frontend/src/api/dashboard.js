import axios from "axios";

const API_BASE = "http://localhost:5000/api/dashboard";

export const getHistory = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.search) params.append("search", filters.search);

  const response = await axios.get(`${API_BASE}/history?${params.toString()}`);
  return response.data;
};
