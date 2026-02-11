import api from './api';

const usageService = {
    getMyUsage: async () => {
        const response = await api.get('/usage/me');
        return response.data.data;
    }
};

export default usageService;
