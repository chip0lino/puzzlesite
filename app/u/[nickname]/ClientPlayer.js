'use client';

import React, { useEffect, useState } from 'react';
import MinecraftSkinViewer from './MinecraftSkinViewer';
import styles from './PlayerProfile.module.css';
import PlayerTeams from './PlayerTeams'; // импорт


export default function ClientPlayer({ nickname }) {
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        const response = await fetch('https://backpuzzle.up.railway.app/api/players_stats');
        const data = await response.json();

        const player = data.find(p => p.username.toLowerCase() === nickname.toLowerCase());
        setPlayerStats(player || null);
      } catch (error) {
        console.error('Ошибка при загрузке данных игрока:', error);
      }
    }

    fetchPlayerData();
  }, [nickname]);

  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'unknown';
    const date = new Date(dateStr);
    const now = new Date();
    let seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) seconds = 0;

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function formatPlaytime(hoursFloat) {
    if (!hoursFloat || isNaN(hoursFloat)) return '0h';
    const totalSeconds = hoursFloat * 3600;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  }

  const isOnline = playerStats?.last_seen
    ? new Date(playerStats.last_seen) > new Date(Date.now() - 5 * 60 * 1000)
    : false;

  return (
    <div className={styles.container}>
      <div className={styles.skinContainer}>
        <MinecraftSkinViewer username={nickname} />
      </div>

      <div className={styles.infoContainer}>
      <div className={styles.nameWithStatus}>
        <h1 className={styles.username}>{nickname}</h1>
        <div className={styles.statusUnderName}>
          <span className={styles.label}></span>
          <span className={styles.value}>
            {isOnline ? 'Online' : `Last seen: ${formatTimeAgo(playerStats?.last_seen)}`}
          </span>
        </div>
      </div>


        {playerStats && (
          <>
            <h2 className={styles.sectionTitle}>Activity</h2>
            <div className={styles.statsWrapper}>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.label}>Played Today:</span>
                <span className={styles.value}>{formatPlaytime(playerStats.daily_hours)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.label}>This Week:</span>
                <span className={styles.value}>{formatPlaytime(playerStats.weekly_hours)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.label}>This Month:</span>
                <span className={styles.value}>{formatPlaytime(playerStats.monthly_hours)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.label}>Total:</span>
                <span className={styles.value}>{formatPlaytime(playerStats.total_hours)}</span>
              </div>
            </div>
          </div>
            <PlayerTeams playerId={playerStats.uuid} />
          </>
        )}
      </div>
    </div>
  );
}
