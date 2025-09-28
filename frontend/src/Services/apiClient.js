import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const clearTokenAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("token_expiry");
  window.location.href = "/login";
};

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");

  if (expiry && Date.now() > Number(expiry)) {
    clearTokenAndRedirect();
    return Promise.reject(new Error("Token expired"));
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokenAndRedirect();
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;
