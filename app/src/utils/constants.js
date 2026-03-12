import Config from 'react-native-config';

// Fallback logic handled directly in the codebase usually,
// But we pull API_BASE_URL from env
export const API_BASE_URL = Config.API_BASE_URL || 'http://192.168.6.10:5000/api';

export const LIMITS = {
    FREE: 50,
    PRO: 500,
    PRO_PLUS: 2000,
};
