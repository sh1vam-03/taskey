import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response Interceptor for 401 Auto-Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop: Don't retry if the failed request was already a retry or was the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/refresh')
        ) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (token) {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    }
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                // The backend sets the cookie, but also returns the token now.
                const { data } = await api.post('/auth/refresh');
                const newAccessToken = data.accessToken;

                // Process queued requests
                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry original request with new token in header (hybrid approach)
                // This ensures it works even if the browser hasn't processed the cookie set-header yet for this immediate retry
                if (newAccessToken) {
                    api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                }

                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, reject queue and logout
                processQueue(refreshError, null);
                isRefreshing = false;

                // Clear any stored headers
                delete api.defaults.headers.common['Authorization'];

                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    // Optionally trigger a global logout event or redirect
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
