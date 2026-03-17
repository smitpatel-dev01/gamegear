import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      const url = error.config?.url || "";

      const isAuthCheck = url.includes("/auth/me");

      const isOnAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthCheck && !isOnAuthPage) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

      }
    }

    return Promise.reject(error);
  }
);

export default api;