import client from './client';

export const getSubscription = () => client.get('/billing/current');
export const getUsage = () => client.get('/usage/me');
export const getHistory = () => client.get('/billing/history');
export const subscribe = (plan, billingCycle) =>
    client.post('/billing/subscribe', { plan, billingCycle });
export const cancelSubscription = () => client.post('/billing/cancel');
export const downgradePlan = (newPlan) => client.post('/billing/downgrade', { newPlan });
export const createTopUp = (packageId) =>
    client.post('/billing/top-up', { packageId });
export const verifyTopUp = (paymentData) =>
    client.post('/billing/top-up/verify', paymentData);
