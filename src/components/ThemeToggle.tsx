import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.scss';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className='theme-toggle'
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={24} strokeWidth={2} />
      ) : (
        <Sun size={24} strokeWidth={2} />
      )}
    </button>
  );
}
