import client from './client';

export const getSubscription = () => client.get('/billing/current');
export const subscribe = (plan, billingCycle) =>
    client.post('/billing/subscribe', { plan, billingCycle });
export const createTopUp = (packageId) =>
    client.post('/billing/top-up', { packageId });
export const verifyTopUp = (paymentData) =>
    client.post('/billing/top-up/verify', paymentData);
