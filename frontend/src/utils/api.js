import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const defaultUrl = isLocalhost ? 'http://localhost:5005/api' : 'https://farmtohome-fresh.onrender.com/api';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || defaultUrl,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Fallback for older code that might still use userInfo
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            if (parsed.token) {
                config.headers.Authorization = `Bearer ${parsed.token}`;
            }
        }
    }
    return config;
});

export default api;
