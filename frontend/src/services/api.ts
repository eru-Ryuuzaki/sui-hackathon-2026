import axios from 'axios';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: '/api', // Relative path to use with Vite proxy
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for responses (optional error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling logic can go here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Define API methods
export const EngramApi = {
  // Construct
  getConstruct: async (id: string) => {
    const res = await api.get(`/construct/${id}`);
    return res.data;
  },
  
  getConstructByOwner: async (address: string) => {
    const res = await api.get(`/construct/owner/${address}`);
    return res.data;
  },

  // Memory
  searchMemories: async (query: string) => {
    const res = await api.get(`/memory/search`, { params: { q: query } });
    return res.data;
  },

  getMemoriesByConstruct: async (constructId: string) => {
    const res = await api.get(`/memory/${constructId}`);
    return res.data;
  },
};
