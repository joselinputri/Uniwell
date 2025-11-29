import axios from "axios";

// API base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("uniwell_user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** AUTH */
export const authAPI = {
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post("/auth/login", payload);
    const token = response.data?.token || response.data?.data?.token;
    if (token) localStorage.setItem("token", token);
    return response;
  },
  register: (payload: any) => api.post("/auth/register", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

/** USERS */
export const usersAPI = {
  getMe: () => api.get("/users/me"),
  updateProfile: (payload: any) => api.put("/users/me", payload),
  uploadAvatar: (form: FormData) =>
    api.post("/users/me/avatar", form, { headers: { "Content-Type": "multipart/form-data" } }),
};

/** HEALTH */
export const healthAPI = {
  getLogs: () => api.get("/health/logs"),
  getTodayStats: () => api.get("/health/today"),
  saveCheckin: (payload: any) => api.post("/health/logs", payload),
  deleteLog: (date: string) => api.delete(`/health/logs/${date}`),
};

/** TASKS */
export const tasksAPI = {
  getAll: () => api.get("/tasks"),
  getUpcoming: () => api.get("/tasks/upcoming"),
  create: (payload: any) => api.post("/tasks", payload),
  update: (id: string | number, payload: any) => api.put(`/tasks/${id}`, payload),
  remove: (id: string | number) => api.delete(`/tasks/${id}`),
};

/** EXPENSES */
export const expensesAPI = {
  getAll: () => api.get("/expenses"),
  create: (payload: any) => api.post("/expenses", payload),
  update: (id: string | number, payload: any) => api.put(`/expenses/${id}`, payload),
  uploadReceipt: (formData: FormData) =>
    api.post("/expenses/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000,
    }),
  remove: (id: string | number) => api.delete(`/expenses/${id}`),
};

export default api;