import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../theme/colors';
import { Storage } from '../utils/storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState(Storage.getThemeMode()); // 'dark', 'light', 'system'
    const [theme, setTheme] = useState(themeMode === 'system' ? (systemColorScheme === 'light' ? lightTheme : darkTheme) : (themeMode === 'light' ? lightTheme : darkTheme));

    useEffect(() => {
        if (themeMode === 'system') {
            setTheme(systemColorScheme === 'light' ? lightTheme : darkTheme);
        } else {
            setTheme(themeMode === 'light' ? lightTheme : darkTheme);
        }
    }, [themeMode, systemColorScheme]);

    const toggleTheme = (mode) => {
        setThemeMode(mode);
        Storage.setThemeMode(mode);
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, isDark: theme === darkTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
