
import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Extend the InternalAxiosRequestConfig interface to include the _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// No base URL – requests will be relative to the current origin
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    // CRITICAL: Ensure headers object exists
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (token) {
       // DIRECT ASSIGNMENT: This is safer than .set() for mixed environments
       // and works for both plain objects and AxiosHeaders instances.
       (config.headers as any)['Authorization'] = `JWT ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401s (Refresh Logic) and 429s (Rate Limiting)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // --- Rate Limiting: 429 Too Many Requests ---
    if (error.response?.status === 429) {
      toast.error('You are making too many requests. Please slow down.', {
        id: 'rate-limit', // Prevent duplicate toasts
        duration: 4000,
      });
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Use basic axios to avoid the interceptor loop during refresh
          const { data } = await axios.post(`${axiosInstance.defaults.baseURL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          
          // Re-attach the new token with the correct prefix - matching request interceptor logic
          if (originalRequest.headers instanceof AxiosHeaders) {
              originalRequest.headers.set('Authorization', `JWT ${data.access}`);
          } else {
             // Fallback for unlikely case where headers is not an AxiosHeaders instance
             // However, with our setup above, it should always be. 
             // We'll create a new headers instance if needed.
             const newHeaders = new AxiosHeaders(originalRequest.headers);
             newHeaders.set('Authorization', `JWT ${data.access}`);
             originalRequest.headers = newHeaders;
          }
          
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;