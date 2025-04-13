import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Use localStorage to persist theme preference, default to system preference
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if there's a stored preference in localStorage
    const storedTheme = localStorage.getItem('aether-theme') as Theme | null;

    if (storedTheme) {
      return storedTheme;
    }

    // Check system preference if no stored preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme class to document when theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes to ensure clean state
    root.classList.remove('light', 'dark');

    // Add the current theme class
    root.classList.add(theme);

    // Store in localStorage for persistence
    localStorage.setItem('aether-theme', theme);
  }, [theme]);

  // Handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Only change theme if user hasn't set a preference
      if (!localStorage.getItem('aether-theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // Set up event listener for system preference changes
    mediaQuery.addEventListener('change', handleChange);

    // Clean up event listener
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for easy theme access
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
