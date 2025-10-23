/**
 * Theme utility functions
 * Handles dark mode initialization with localStorage + system preference
 */

export const THEME_KEY = 'theme'
export const THEME_LIGHT = 'light'
export const THEME_DARK = 'dark'
export const ACCENT_COLOR_KEY = 'accent-color'

/**
 * Gets the theme preference from localStorage or system preference
 */
export function getThemePreference(): string {
  if (typeof localStorage === 'undefined') return THEME_LIGHT

  const saved = localStorage.getItem(THEME_KEY)
  if (saved === THEME_DARK || saved === THEME_LIGHT) {
    return saved
  }

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT
  }

  return THEME_LIGHT
}

/**
 * Applies the theme to the document
 */
export function applyTheme(theme: string): void {
  const html = document.documentElement
  if (theme === THEME_DARK) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

/**
 * Gets the current applied theme
 */
export function getCurrentTheme(): string {
  return document.documentElement.classList.contains('dark') ? THEME_DARK : THEME_LIGHT
}

/**
 * Generates the blocking theme script that runs before React hydration
 * This prevents flash of unstyled content (FOUC)
 */
export function getThemeBlockingScript(): string {
  return `
    (function() {
      try {
        const theme = localStorage.getItem('${THEME_KEY}');
        if (theme === '${THEME_DARK}') {
          document.documentElement.classList.add('dark');
        } else if (theme === '${THEME_LIGHT}') {
          document.documentElement.classList.remove('dark');
        } else {
          // Check system preference if no saved theme
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        }

        // Load accent color
        const accentColor = localStorage.getItem('${ACCENT_COLOR_KEY}') || '#FA5D19';
        document.documentElement.style.setProperty('--accent-color', accentColor);
      } catch (e) {
        // Ignore errors in theme script
      }
    })();
  `
}
