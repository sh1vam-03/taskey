import axios from 'axios';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
client.interceptors.request.use((config) => {
    console.warn(`### API REQUEST: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = Storage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
};

client.interceptors.response.use(
    (res) => {
        console.warn(`### API RESPONSE: ${res.status} ${res.config.url}`);
        return res;
    },
    async (error) => {
        console.warn(`### API ERROR: ${error.message} (URL: ${error.config?.url})`);
        if (error.response) {
            console.warn(`### API ERROR DATA: ${JSON.stringify(error.response.data)}`);
        }
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return client(original);
                });
            }
            original._retry = true;
            isRefreshing = true;
            try {
                const refreshToken = Storage.getRefreshToken();
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refreshToken }     // send as body on mobile (no cookies)
                );
                Storage.setAccessToken(data.accessToken);
                if (data.refreshToken) Storage.setRefreshToken(data.refreshToken);
                processQueue(null, data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return client(original);
            } catch (err) {
                processQueue(err, null);
                Storage.clear();
                // Note: auth.store will need to listen to storage clear or trigger logout
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default client;
