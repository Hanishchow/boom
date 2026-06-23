import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const GenderThemeContext = createContext({
  gender: null,
  activeTheme: 'default',
  setThemeFromGender: () => {},
  applyGenderTheme: () => {},
  clearTheme: () => {},
  resetTheme: () => {},
});

/**
 * Token sets per theme.
 * Both --color-* (new spec tokens) and --theme-* (existing utility-class tokens)
 * are injected so existing .theme-bg / .theme-surface / .theme-card classes
 * keep working without any component-level changes.
 */
const THEMES = {
  default: {
    '--color-bg': '#000000',
    '--color-surface': '#111111',
    '--color-primary': '#ec4899',
    '--color-accent': '#f472b6',
    '--color-text': '#ffffff',
    '--color-text-muted': '#9ca3af',
    '--color-border': '#2a2a2a',
    '--border-radius-sm': '0.5rem',
    '--border-radius-md': '0.75rem',
    '--border-radius-lg': '1rem',
    '--shadow-sm': 'none',
    '--shadow-md': 'none',
    '--font-weight-heading': '700',
    // --theme-* aliases (existing utility classes)
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
  masculine: {
    '--color-bg': '#1A1A1D',
    '--color-surface': '#232328',
    '--color-primary': '#3A5A78',
    '--color-accent': '#5B8DB8',
    '--color-text': '#F0F0F2',
    '--color-text-muted': '#8A8A96',
    '--color-border': '#2E2E35',
    '--border-radius-sm': '2px',
    '--border-radius-md': '4px',
    '--border-radius-lg': '6px',
    '--shadow-sm': 'none',
    '--shadow-md': 'none',
    '--font-weight-heading': '700',
    // --theme-* aliases
    '--theme-bg': '#1A1A1D',
    '--theme-surface': '#232328',
    '--theme-card': '#2a2a30',
    '--theme-border': '#2E2E35',
    '--theme-primary': '#3A5A78',
    '--theme-primary-hover': '#2e4a66',
    '--theme-accent': '#5B8DB8',
    '--theme-text': '#F0F0F2',
    '--theme-text-muted': '#8A8A96',
    '--theme-radius-card': '6px',
    '--theme-radius-btn': '4px',
    '--theme-shadow': 'none',
    '--theme-font-weight-heading': '700',
    '--theme-letter-spacing': '0.04em',
    '--theme-line-height': '1.4',
    '--theme-btn-gradient': 'none',
  },
  feminine: {
    '--color-bg': '#FFF6F4',
    '--color-surface': '#FFECEA',
    '--color-primary': '#C98BA0',
    '--color-accent': '#E8A5B8',
    '--color-text': '#3D2028',
    '--color-text-muted': '#9C7080',
    '--color-border': '#F0D5D8',
    '--border-radius-sm': '12px',
    '--border-radius-md': '18px',
    '--border-radius-lg': '24px',
    '--shadow-sm': '0 2px 8px rgba(201,139,160,0.10)',
    '--shadow-md': '0 4px 16px rgba(201,139,160,0.14)',
    '--font-weight-heading': '400',
    // --theme-* aliases
    '--theme-bg': '#FFF6F4',
    '--theme-surface': '#FFECEA',
    '--theme-card': '#ffffff',
    '--theme-border': '#F0D5D8',
    '--theme-primary': '#C98BA0',
    '--theme-primary-hover': '#b8748e',
    '--theme-accent': '#E8A5B8',
    '--theme-text': '#3D2028',
    '--theme-text-muted': '#9C7080',
    '--theme-radius-card': '24px',
    '--theme-radius-btn': '9999px',
    '--theme-shadow': '0 4px 16px rgba(201,139,160,0.14)',
    '--theme-font-weight-heading': '400',
    '--theme-letter-spacing': 'normal',
    '--theme-line-height': '1.8',
    '--theme-btn-gradient': 'linear-gradient(135deg, #C98BA0, #E8A5B8)',
  },
};

/**
 * Normalise any gender value from the backend to a canonical string.
 * Handles "M"/"F", 1/2, "male"/"female", etc.
 */
function normaliseGender(raw) {
  if (!raw) return 'not_specified';
  const g = String(raw).toLowerCase().trim();
  if (['male', 'm', '1', 'man', 'boy'].includes(g)) return 'male';
  if (['female', 'f', '2', 'woman', 'girl'].includes(g)) return 'female';
  return 'not_specified';
}

function applyTheme(themeName) {
  const tokens = THEMES[themeName] || THEMES.default;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function GenderThemeProvider({ children }) {
  const [gender, setGender] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');

  // Apply theme whenever activeTheme changes — prevents stale tokens across re-renders
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  // On mount: re-read gender from session/profile to prevent flash on hard refresh
  useEffect(() => {
    (async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const currentUser = await base44.auth.me();
        if (!currentUser) return;
        const profiles = await base44.entities.SkinProfile.filter(
          { created_by_id: currentUser.id },
          '-created_date',
          1
        );
        const savedGender = profiles?.[0]?.gender || null;
        if (savedGender) {
          setThemeFromGender(savedGender);
        }
      } catch (e) {
        // Not logged in or no profile yet — stay on default
      }
    })();
  }, []);

  const setThemeFromGender = (genderValue) => {
    const normalised = normaliseGender(genderValue);
    setGender(normalised);
    const themeName =
      normalised === 'male' ? 'masculine' :
      normalised === 'female' ? 'feminine' :
      'default';
    setActiveTheme(themeName);
  };

  // Alias for backward compatibility with existing call sites
  const applyGenderTheme = setThemeFromGender;

  const clearTheme = () => {
    setGender(null);
    setActiveTheme('default');
  };

  // Alias for backward compatibility
  const resetTheme = clearTheme;

  return (
    <GenderThemeContext.Provider
      value={{ gender, activeTheme, setThemeFromGender, applyGenderTheme, clearTheme, resetTheme }}
    >
      {children}
    </GenderThemeContext.Provider>
  );
}

export function useGenderTheme() {
  return useContext(GenderThemeContext);
}