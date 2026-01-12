import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    // 背景色
    background: '#0f0f14',
    sidebarBg: 'linear-gradient(180deg, #1a1a24 0%, #12121a 100%)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBgHover: 'rgba(255,255,255,0.05)',
    inputBg: 'rgba(0,0,0,0.3)',

    // 文字颜色
    textPrimary: '#fff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textTertiary: 'rgba(255,255,255,0.5)',
    textQuaternary: 'rgba(255,255,255,0.4)',
    textDisabled: 'rgba(255,255,255,0.3)',

    // 边框颜色
    border: 'rgba(255,255,255,0.06)',
    borderLight: 'rgba(255,255,255,0.15)',

    // 主题色
    primary: '#6366f1',
    primaryLight: '#a5b4fc',
    primaryBg: 'rgba(99, 102, 241, 0.15)',
    primaryBorder: 'rgba(99, 102, 241, 0.3)',

    // 成功色
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.1)',
    successBorder: 'rgba(16, 185, 129, 0.3)',

    // 警告色
    warning: '#f59e0b',

    // 错误色
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#fca5a5',

    // 渐变
    gradientPrimary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    gradientSuccess: 'linear-gradient(135deg, #10b981, #059669)',
    gradientPrimaryBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
  },
  light: {
    // 背景色
    background: '#f5f5f7',
    sidebarBg: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
    cardBg: '#ffffff',
    cardBgHover: '#f9fafb',
    inputBg: '#ffffff',

    // 文字颜色
    textPrimary: '#1a1a1a',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    textQuaternary: '#9ca3af',
    textDisabled: '#d1d5db',

    // 边框颜色
    border: '#e5e7eb',
    borderLight: '#d1d5db',

    // 主题色
    primary: '#6366f1',
    primaryLight: '#4f46e5',
    primaryBg: 'rgba(99, 102, 241, 0.1)',
    primaryBorder: 'rgba(99, 102, 241, 0.3)',

    // 成功色
    success: '#10b981',
    successBg: 'rgba(16, 185, 129, 0.1)',
    successBorder: 'rgba(16, 185, 129, 0.3)',

    // 警告色
    warning: '#f59e0b',

    // 错误色
    error: '#ef4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#dc2626',

    // 渐变
    gradientPrimary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    gradientSuccess: 'linear-gradient(135deg, #10b981, #059669)',
    gradientPrimaryBg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('mg-tools-theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('mg-tools-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    colors: themes[theme],
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
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
