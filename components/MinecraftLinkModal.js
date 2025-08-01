'use client';

import { useState } from 'react';
import styles from './minecraft-link-modal.module.css';

export default function MinecraftLinkModal({ isOpen, onClose, onSuccess }) {
  const [minecraftNick, setMinecraftNick] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backpuzzle.up.railway.app';

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
      onSuccess(data.minecraft_nickname);
      onClose();
    } catch (error) {
      console.error('Error linking Minecraft account:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <div className={styles['minecraft-icon']}>
            🟫
          </div>
          <h2>Завершите регистрацию</h2>
          <p>Для покупки доступа и игры на серверах требуется лицензионный аккаунт Minecraft Java Edition</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['minecraft-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="minecraft-nick">Никнейм вашей лицензии Minecraft</label>
            <input
              id="minecraft-nick"
              type="text"
              value={minecraftNick}
              onChange={(e) => setMinecraftNick(e.target.value)}
              placeholder="vanilla812boy"
              className={styles['minecraft-input']}
              disabled={loading}
              maxLength={16}
              pattern="[a-zA-Z0-9_]{1,16}"
            />
            <small className={styles['input-hint']}>
              Указывайте никнейм лицензии Java Edition, не никнейм Xbox или Bedrock Edition
            </small>
          </div>

          {error && (
            <div className={styles['error-message']}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={styles['continue-btn']}
            disabled={loading}
          >
            {loading ? 'Проверяем...' : 'Продолжить'}
          </button>
        </form>

        <div className={styles['modal-footer']}>
          <button className={styles['help-btn']} type="button">
            Как узнать никнейм?
          </button>
          <button className={styles['no-license-btn']} type="button">
            У меня нет лицензии
          </button>
        </div>

        <div className={styles['modal-legal']}>
          <p>
            Нажимая на кнопку «Продолжить», вы соглашаетесь с{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">Пользовательским соглашением</a>,{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Политикой возврата средств</a> и{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Политикой конфиденциальности</a>
          </p>
        </div>

        <button className={styles['close-btn']} onClick={onClose} type="button">
          ×
        </button>
      </div>
    </div>
  );
}
