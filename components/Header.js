'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './header.module.css';  // <-- импорт CSS-модуля

const menuItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'stats', label: 'Stats', href: '/stats' },
  { id: 'wiki', label: 'Wiki', href: '/wiki' },
  { id: 'teams', label: 'Teams', href: '/teams' },
  { id: 'map', label: 'Map', href: '/map' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://backpuzzle.up.railway.app').replace(/\/$/, '');

  useEffect(() => {
    checkAuthStatus();

    const interval = setInterval(() => {
      checkAuthStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authResult = urlParams.get('auth');
    const newPlayer = urlParams.get('new_player');
    const playerAuth = urlParams.get('player');
    const expired = urlParams.get('expired');
    const error = urlParams.get('error');

    if (authResult === 'success') {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      checkAuthStatus();

      if (playerAuth === 'true') {
        console.log('Player authenticated with active access');
      } else if (expired === 'true') {
        alert('Ваш доступ к серверу истек. Продлите подписку для продолжения игры.');
        router.push('/purchase');
      } else if (newPlayer === 'true') {
        router.push('/link-minecraft');
      }
    }

    if (error) {
      console.error('Auth error:', error);
      alert('Ошибка авторизации: ' + error);
    }
  }, [router]);

  const checkAuthStatus = async () => {
    try {
      console.log('Fetching auth status from:', `${API_BASE_URL}/api/auth/status`);
      console.log('API_BASE_URL is:', API_BASE_URL);
      console.log('Full fetch URL:', `${API_BASE_URL}/api/auth/status`);

      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('Auth status check failed:', response.status, response.statusText);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.slice(0, 100));
          throw new Error('Received non-JSON response');
        }
        if (response.status === 401 || response.status === 403) {
          setAuthStatus({ authenticated: false });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth status updated:', data);
      setAuthStatus(data);
    } catch (error) {
      console.error('Error checking auth status:', error.message);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Server connection failed - Flask server might be down');
      }
      setAuthStatus({ authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/discord`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error('Error starting auth:', error);
      alert('Ошибка запуска авторизации');
    }
  };

  const handleUserClick = () => {
    console.log('User clicked on avatar');
    console.log('Auth status:', authStatus);
    console.log('Minecraft nickname:', authStatus?.minecraft_nickname);
    console.log('Has player role:', authStatus?.has_player_role);

    if (authStatus?.minecraft_nickname && authStatus?.has_player_role) {
      console.log(`Redirecting to profile: /u/${authStatus.minecraft_nickname}`);
      router.push(`/u/${authStatus.minecraft_nickname}`);
    } else if (authStatus?.minecraft_nickname && !authStatus?.has_player_role) {
      console.log('Redirecting to purchase page');
      router.push('/purchase');
    } else {
      console.log('Redirecting to link minecraft page');
      router.push('/link-minecraft');
    }
  };

  const renderAuthButton = () => {
    if (loading) {
      return (
        <button className={styles['auth-button']} disabled>
          Loading...
        </button>
      );
    }

    if (!authStatus?.authenticated) {
      return (
        <button className={styles['auth-button']} onClick={handleAuth}>
          Auth
        </button>
      );
    }

    if (authStatus.minecraft_nickname && authStatus.has_player_role) {
      return (
        <div
          className={styles['user-avatar']}
          onClick={handleUserClick}
          title={`${authStatus.minecraft_nickname} (Click to view profile)`}
        >
          <img
            src={`https://mc-heads.net/avatar/${authStatus.minecraft_nickname}/32`}
            alt={authStatus.minecraft_nickname}
            className={styles['minecraft-avatar']}
            onError={(e) => {
              e.target.src = `https://crafatar.com/avatars/${authStatus.minecraft_nickname}?size=32&default=MHF_Steve`;
            }}
          />
        </div>
      );
    }

    if (authStatus.minecraft_nickname && !authStatus.has_player_role) {
      return (
        <div
          className={`${styles['user-avatar']} ${styles.expired}`}
          onClick={handleUserClick}
          title={`${authStatus.minecraft_nickname} (Access expired - Click to renew)`}
        >
          <img
            src={`https://mc-heads.net/avatar/${authStatus.minecraft_nickname}/32`}
            alt={authStatus.minecraft_nickname}
            className={styles['minecraft-avatar']}
            onError={(e) => {
              e.target.src = `https://crafatar.com/avatars/${authStatus.minecraft_nickname}?size=32&default=MHF_Steve`;
            }}
          />
          <div className={styles['expired-indicator']}>!</div>
        </div>
      );
    }

    return (
      <div
        className={styles['user-avatar']}
        onClick={handleUserClick}
        title={`${authStatus.discord_username} (Click to link Minecraft)`}
      >
        <img src="/assets/user.png" alt="User" className={styles['discord-avatar']} />
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles['nav-menu']}>
          {menuItems.map(({ id, label, href }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={id} href={href} className={`${styles['nav-item']} ${isActive ? styles.active : ''}`}>
                {label}
                {isActive && <span className={styles['nav-underline']} />}
              </Link>
            );
          })}
        </div>

        {authStatus?.authenticated && (
          <button
            onClick={checkAuthStatus}
            style={{
              marginRight: '10px',
              padding: '5px',
              fontSize: '12px',
              background: '#00d4aa',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Refresh auth status"
          >
            🔄
          </button>
        )}

        {renderAuthButton()}
      </nav>
    </header>
  );
}
