import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const GenderThemeContext = createContext({ gender: null, theme: 'default' });

// CSS token sets per theme
const THEMES = {
  default: {
    '--theme-bg': '#000000',
    '--theme-surface': '#111111',
    '--theme-card': '#1a1a1a',
    '--theme-border': '#2a2a2a',
    '--theme-primary': '#ec4899',
    '--theme-primary-hover': '#db2777',
    '--theme-accent': '#f472b6',
    '--theme-text': '#ffffff',
    '--theme-text-muted': '#9ca3af',
    '--theme-radius-card': '1rem',
    '--theme-radius-btn': '9999px',
    '--theme-shadow': 'none',
    '--theme-font-weight-heading': '700',
    '--theme-letter-spacing': 'normal',
    '--theme-line-height': '1.6',
    '--theme-btn-gradient': 'none',
  },
  male: {
    '--theme-bg': '#1A1A1D',
    '--theme-surface': '#232328',
    '--theme-card': '#2a2a30',
    '--theme-border': '#3a3a44',
    '--theme-primary': '#3A5A78',
    '--theme-primary-hover': '#2e4a66',
    '--theme-accent': '#5a8ab0',
    '--theme-text': '#f0f0f0',
    '--theme-text-muted': '#9aa5b4',
    '--theme-radius-card': '4px',
    '--theme-radius-btn': '4px',
    '--theme-shadow': 'none',
    '--theme-font-weight-heading': '800',
    '--theme-letter-spacing': '0.04em',
    '--theme-line-height': '1.4',
    '--theme-btn-gradient': 'none',
  },
  female: {
    '--theme-bg': '#FFF1EE',
    '--theme-surface': '#fff7f5',
    '--theme-card': '#ffffff',
    '--theme-border': '#f0d5cf',
    '--theme-primary': '#C98BA0',
    '--theme-primary-hover': '#b8748e',
    '--theme-accent': '#d4a0b5',
    '--theme-text': '#3d2b2e',
    '--theme-text-muted': '#9a7480',
    '--theme-radius-card': '20px',
    '--theme-radius-btn': '9999px',
    '--theme-shadow': '0 4px 16px rgba(201,139,160,0.15)',
    '--theme-font-weight-heading': '400',
    '--theme-letter-spacing': 'normal',
    '--theme-line-height': '1.8',
    '--theme-btn-gradient': 'linear-gradient(135deg, #C98BA0, #d4a0b5)',
  },
};

function applyTheme(themeName) {
  const tokens = THEMES[themeName] || THEMES.default;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function GenderThemeProvider({ children }) {
  const [gender, setGender] = useState(null);
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    // Apply default immediately
    applyTheme('default');
    initTheme();
  }, []);

  const initTheme = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;

      const currentUser = await base44.auth.me();
      if (!currentUser) return;

      // Try to load existing profile to get gender
      const profiles = await base44.entities.SkinProfile.filter(
        { created_by_id: currentUser.id },
        '-created_date',
        1
      );

      const savedGender = profiles?.[0]?.gender || null;
      if (savedGender) {
        applyGenderTheme(savedGender);
      }
    } catch (e) {
      // Not logged in or no profile yet — stay on default
    }
  };

  const applyGenderTheme = (genderValue) => {
    const themeName =
      genderValue === 'male' ? 'male' :
      genderValue === 'female' ? 'female' :
      'default';
    setGender(genderValue);
    setTheme(themeName);
    applyTheme(themeName);
  };

  const resetTheme = () => {
    setGender(null);
    setTheme('default');
    applyTheme('default');
  };

  return (
    <GenderThemeContext.Provider value={{ gender, theme, applyGenderTheme, resetTheme }}>
      {children}
    </GenderThemeContext.Provider>
  );
}

export function useGenderTheme() {
  return useContext(GenderThemeContext);
}