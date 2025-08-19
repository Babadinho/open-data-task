import { useState, useEffect } from 'react';
import { ProfileCard } from './components/ProfileCard';
import { fetchProfile, type Profile } from './services/webidService';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/main.scss';

const DEFAULT_WEBID = 'https://timbl.solidcommunity.net/profile/card#me';

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const webid = urlParams.get('webid') || DEFAULT_WEBID;

    if (!urlParams.get('webid')) {
      window.history.replaceState(
        {},
        '',
        `?webid=${encodeURIComponent(DEFAULT_WEBID)}`
      );
    }

    loadProfile(webid);
  }, []);

  const loadProfile = async (webid: string) => {
    setLoading(true);
    setError('');

    try {
      const profileData = await fetchProfile(webid);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='container'>
        <div className='loading'>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container'>
        <div className='error'>Error: {error}</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className='container'>
        {profile && <ProfileCard profile={profile} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
