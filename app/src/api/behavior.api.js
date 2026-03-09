import API from './client';

/**
 * Behavior API -- TASKTIME
 * Handles all endpoints related to behavior tracking and scoring.
 */

export const getBehaviorLog = (date) => {
    return API.get(`/behavior/${date}`);
};

export const getLatestBehaviorLog = () => {
    return API.get('/behavior/latest');
};

export const getBehaviorSummary = (days = 7) => {
    return API.get(`/behavior/summary?days=${days}`);
};

export const getBehaviorExplanation = (date) => {
    return API.get(`/behavior/explain/${date}`);
};

export const saveBehaviorLog = (data) => {
    return API.post('/behavior', data);
};
