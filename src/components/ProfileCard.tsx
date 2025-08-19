import { useMemo } from 'react';
import { type Profile } from '../services/webidService';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';
import { SquareUser, Link, UsersRound } from 'lucide-react';
import './ProfileCard.scss';

import mastodonIcon from '../assets/mastodon.svg';
import orcidIcon from '../assets/orcid.svg';
import blueskyIcon from '../assets/bluesky.png';
import matrixIcon from '../assets/matrix.png';

interface Props {
  profile: Profile;
}

const extractFriendName = (webid: string): string => {
  try {
    const hostname = new URL(webid).hostname.replace(/^www\./, '');
    const firstPart = hostname.split('.')[0];
    return firstPart.length > 2 ? firstPart : hostname;
  } catch {
    return webid;
  }
};

export function ProfileCard({ profile }: Props) {
  const { theme } = useTheme();

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const icons: Record<string, string> = {
    Mastodon: mastodonIcon,
    ORCID: orcidIcon,
    BlueSky: blueskyIcon,
    Matrix: matrixIcon,
    Other: '🔗',
  };

  const getSocialIcon = (type: string) => {
    return icons[type] || icons.Other;
  };

  const getPlatformType = (type: string) => {
    return icons[type] ? type.toLowerCase() : 'other';
  };

  const headerBackground = useMemo(() => {
    if (theme === 'dark') {
      return '#1f2937';
    }

    if (profile.colors?.background && profile.colors?.highlight) {
      return `linear-gradient(135deg, ${profile.colors.background} 40%, ${profile.colors.highlight} 400%)`;
    }

    return profile.colors?.background || '#ffffff';
  }, [theme, profile.colors?.background, profile.colors?.highlight]);

  const sectionBackground = useMemo(() => {
    return theme === 'dark'
      ? '#1f2937'
      : profile.colors?.background || '#ffffff';
  }, [theme, profile.colors?.background]);

  return (
    <div className='profile-card'>
      <header
        className='profile-card__header'
        style={{
          background: headerBackground,
        }}
      >
        <div className='profile-card__theme-toggle'>
          <ThemeToggle />
        </div>
        {profile.image && (
          <img
            src={profile.image}
            alt={profile.name}
            className='profile-card__image'
          />
        )}
        {profile.pronouns && (
          <p className='profile-card__pronouns'>
            {profile.pronouns.subject}/{profile.pronouns.object}/
            {profile.pronouns.possessive}
          </p>
        )}
        <h1 className='profile-card__name'>{profile.name}</h1>
        {profile.bio && <p className='profile-card__bio'>"{profile.bio}"</p>}

        <div className='profile-card__social-links'>
          {profile.socialAccounts.map((account, index) => (
            <a
              key={index}
              href={account.url}
              target='_blank'
              rel='noopener noreferrer'
              className='profile-card__social-link'
              data-platform={getPlatformType(account.type)}
              title={`${account.type}: ${account.handle}`}
            >
              {getSocialIcon(account.type) === '🔗' ? (
                getSocialIcon(account.type)
              ) : (
                <img src={getSocialIcon(account.type)} alt={account.type} />
              )}
            </a>
          ))}
        </div>
      </header>

      <section className='profile-card__section'>
        <h2 className='profile-card__section-header'>
          <div
            className='profile-card__section-icon'
            style={{
              background: sectionBackground,
            }}
          >
            <SquareUser size={20} strokeWidth={2} />
          </div>
          <span>Personal Information</span>
        </h2>
        <div className='profile-card__section-content'>
          {profile.birthday && (
            <div className='profile-card__info-item'>
              <span className='profile-card__info-label'>Birthday:</span>
              <span className='profile-card__info-value'>
                {formatBirthday(profile.birthday)} ({profile.age} years old)
              </span>
            </div>
          )}
          {profile.organization && (
            <div className='profile-card__info-item'>
              <span className='profile-card__info-label'>Organization:</span>
              <span className='profile-card__info-value'>
                {profile.organization}
              </span>
            </div>
          )}
          {profile.role && (
            <div className='profile-card__info-item'>
              <span className='profile-card__info-label'>Role:</span>
              <span className='profile-card__info-value'>{profile.role}</span>
            </div>
          )}
          {profile.email && (
            <div className='profile-card__contact-item'>
              <span className='profile-card__contact-label'>Email:</span>
              <a
                href={`mailto:${profile.email}`}
                className='profile-card__contact-value'
              >
                {profile.email}
              </a>
            </div>
          )}
        </div>
      </section>

      <section className='profile-card__section'>
        <h2 className='profile-card__section-header'>
          <div
            className='profile-card__section-icon'
            style={{
              background: sectionBackground,
            }}
          >
            <Link size={20} strokeWidth={2} />
          </div>
          <span>Links</span>
        </h2>
        <div className='profile-card__section-content'>
          {profile.webid && (
            <div className='profile-card__contact-item'>
              <span className='profile-card__contact-label'>Website:</span>
              <a
                href={profile.webid}
                target='_blank'
                rel='noopener noreferrer'
                className='profile-card__contact-value'
              >
                {profile.webid}
              </a>
            </div>
          )}
          {profile.storage.length > 0 && (
            <div className='profile-card__contact-item'>
              <span className='profile-card__contact-label'>Storage:</span>
              <div className='profile-card__contact-value'>
                {profile.storage.map((storage, index) => (
                  <a
                    key={index}
                    href={storage}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='profile-card__contact-value'
                  >
                    {storage}
                  </a>
                ))}
              </div>
            </div>
          )}
          {profile.inbox && (
            <div className='profile-card__contact-item'>
              <span className='profile-card__contact-label'>Inbox:</span>
              <a
                href={profile.inbox}
                target='_blank'
                rel='noopener'
                className='profile-card__contact-value'
              >
                {profile.inbox}
              </a>
            </div>
          )}
        </div>
      </section>

      <section className='profile-card__section'>
        <h2 className='profile-card__section-header'>
          <div
            className='profile-card__section-icon'
            style={{
              background: sectionBackground,
            }}
          >
            <UsersRound size={20} strokeWidth={2} />
          </div>
          <span>Connections</span>
        </h2>
        <div className='profile-card__section-content'>
          {profile.friends.length > 0 && (
            <div className='profile-card__connections'>
              {profile.friends.map((friend, index) => (
                <a
                  key={index}
                  href={`?webid=${encodeURIComponent(friend)}`}
                  className='profile-card__connection-link'
                  style={{
                    background: sectionBackground,
                  }}
                >
                  {extractFriendName(friend)}
                </a>
              ))}
            </div>
          )}

          {profile.friends.length === 0 && (
            <div className='profile-card__info-item'>
              <span className='profile-card__info-label'>
                No connections found
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
