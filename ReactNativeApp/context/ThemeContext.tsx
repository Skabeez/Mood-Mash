import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    border: string;
    card: string;
    accent: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const darkTheme = {
  background: {
    primary: '#030712',
    secondary: '#111827',
    tertiary: '#1F2937',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
  },
  border: 'rgba(55, 65, 81, 0.3)',
  card: 'rgba(31, 41, 55, 0.4)',
  accent: '#9333EA',
};

const lightTheme = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    tertiary: '#E5E7EB',
  },
  text: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#475569',
  },
  border: 'rgba(203, 213, 225, 0.8)',
  card: 'rgba(255, 255, 255, 1)',
  accent: '#7C3AED',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
