'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import styles from './link-minecraft.module.css'; // Модульный CSS

export default function LinkMinecraftPage() {
  const router = useRouter();
  const [minecraftNick, setMinecraftNick] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backpuzzle.up.railway.app/';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.log('Auth failed on link page');
        router.push('/');
        return;
      }

      const data = await response.json();
      console.log('Link page auth status:', data);

      if (!data.authenticated) {
        router.push('/');
        return;
      }

      if (data.minecraft_nickname && data.has_player_role) {
        console.log('User already has access, redirecting to profile');
        router.push(`/u/${data.minecraft_nickname}`);
        return;
      }

      if (data.minecraft_nickname && !data.has_player_role) {
        console.log('User has minecraft account but no role, redirecting to purchase');
        router.push('/purchase');
        return;
      }

      setAuthStatus(data);
    } catch (error) {
      console.error('Error checking auth status:', error);
      router.push('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!minecraftNick.trim()) {
      setError('Введите Minecraft ник');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/link_minecraft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          minecraft_nickname: minecraftNick.trim()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Ошибка привязки аккаунта');
        } catch {
          setError('Ошибка сервера');
        }
        return;
      }

      const data = await response.json();
      console.log('Link success:', data);
      window.location.href = '/purchase?linked=true';

    } catch (error) {
      console.error('Error linking Minecraft account:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  if (!authStatus) {
    return (
      <>
        <Header />
        <div className={styles.linkPage}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.linkPage}>
        <div className={styles.linkContainer}>
          <div className={styles.linkHeader}>
            <div className={styles.minecraftIcon}>🟫</div>
            <h1>Завершите регистрацию</h1>
            <p>Для покупки доступа и игры на серверах требуется лицензионный аккаунт Minecraft Java Edition</p>
          </div>

          <div className={styles.userInfoCard}>
            <div className={styles.discordInfo}>
              <img 
                src={authStatus.discord_avatar 
                  ? `https://cdn.discordapp.com/avatars/${authStatus.discord_id}/${authStatus.discord_avatar}.png?size=64`
                  : '/assets/user.png'
                }
                alt="Discord Avatar"
                className={styles.discordAvatarLarge}
              />
              <div>
                <h3>{authStatus.discord_username}</h3>
                <p>Discord аккаунт подключен</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.minecraftForm}>
            <div className={styles.formGroup}>
              <label htmlFor="minecraft-nick">Никнейм вашей лицензии Minecraft</label>
              <input
                id="minecraft-nick"
                type="text"
                value={minecraftNick}
                onChange={(e) => setMinecraftNick(e.target.value)}
                placeholder="vanilla812boy"
                className={styles.minecraftInput}
                disabled={loading}
                maxLength={16}
                pattern="[a-zA-Z0-9_]{1,16}"
              />
              <small className={styles.inputHint}>
                Указывайте никнейм лицензии Java Edition, не никнейм Xbox или Bedrock Edition
              </small>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className={styles.continueBtn}
              disabled={loading}
            >
              {loading ? 'Проверяем...' : 'Продолжить'}
            </button>
          </form>

          <div className={styles.helpSection}>
            <button className={styles.helpBtn} type="button">
              Как узнать никнейм?
            </button>
            <button className={styles.noLicenseBtn} type="button">
              У меня нет лицензии
            </button>
          </div>

          <div className={styles.legalText}>
            <p>
              Нажимая на кнопку «Продолжить», вы соглашаетесь с{' '}
              <a href="/terms" target="_blank">Пользовательским соглашением</a>,{' '}
              <a href="/privacy" target="_blank">Политикой возврата средств</a> и{' '}
              <a href="/privacy" target="_blank">Политикой конфиденциальности</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
