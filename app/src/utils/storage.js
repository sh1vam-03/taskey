import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'tasktime-storage' });

export const Storage = {
    setAccessToken: (t) => storage.set('accessToken', t),
    getAccessToken: () => storage.getString('accessToken') ?? null,
    setRefreshToken: (t) => storage.set('refreshToken', t),
    getRefreshToken: () => storage.getString('refreshToken') ?? null,
    setUser: (u) => storage.set('user', JSON.stringify(u)),
    getUser: () => { const u = storage.getString('user'); return u ? JSON.parse(u) : null; },
    setThemeMode: (m) => storage.set('themeMode', m),
    getThemeMode: () => storage.getString('themeMode') ?? 'system',
    clear: () => storage.clearAll(),
};
