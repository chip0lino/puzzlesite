'use client';

import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import styles from './stats.module.css';
import Link from 'next/link';

export default function StatsPage() {
  const [onlineData, setOnlineData] = useState([]);
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('total');
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sortOptionsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [onlineResponse, playersResponse] = await Promise.allSettled([
          fetch('https://backpuzzle.up.railway.app/api/online_history', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }),
          fetch('https://backpuzzle.up.railway.app/api/players_stats', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
        ]);

        // Handle online history
        if (onlineResponse.status === 'fulfilled' && onlineResponse.value.ok) {
          const onlineData = await onlineResponse.value.json();
          setOnlineData(Array.isArray(onlineData) ? onlineData : []);
        } else {
          console.error('Failed to fetch online history:', onlineResponse.reason || onlineResponse.value?.status);
        }

        // Handle players stats
        if (playersResponse.status === 'fulfilled' && playersResponse.value.ok) {
          const playersData = await playersResponse.value.json();
          setPlayers(Array.isArray(playersData) ? playersData : []);
        } else {
          console.error('Failed to fetch players stats:', playersResponse.reason || playersResponse.value?.status);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const container = sortOptionsRef.current;
    const buttons = container?.querySelectorAll('button');
    const activeIndex = sortOptions.findIndex(option => option.key === sortBy);
    const activeButton = buttons?.[activeIndex];

    if (activeButton) {
      const left = activeButton.offsetLeft;
      const width = activeButton.offsetWidth;
      setIndicatorStyle({
        left: `${left}px`,
        width: `${width}px`,
        transition: 'left 0.3s ease, width 0.3s ease',
      });
    }
  }, [sortBy]);

  const filteredPlayers = players.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedPlayers = filteredPlayers.sort((a, b) => {
    const aVal = a[`${sortBy}_hours`] ?? 0;
    const bVal = b[`${sortBy}_hours`] ?? 0;
    return bVal - aVal;
  });

  const chartData = {
    labels: onlineData.map(item => item.timestamp),
    datasets: [
      {
        data: onlineData.map(item => item.online),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#4f46e5',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: context => `Онлайн: ${context.parsed.y}`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const sortOptions = [
    { key: 'total', label: 'All Time' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'daily', label: 'Daily' },
  ];

  if (loading) {
    return (
      <div className={styles['stats-page']}>
        <p>Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['stats-page']}>
        <p>Error loading stats: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles['stats-page']}>
      <div className={styles['stats-tile']}>
        <img src="/logo.png" alt="Server Logo" className={styles['server-logo']} />
        <h1 className={styles['server-name']}>Plasmo Donator</h1>
        <p className={styles['server-ip']}>donator2.gamely.pro:25373</p>
        {onlineData.length > 0 && <Line data={chartData} options={chartOptions} />}
      </div>

      <input
        type="text"
        placeholder="Search..."
        className={styles['search-input']}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className={styles['sort-options']} ref={sortOptionsRef}>
        <div className={styles['sort-indicator']} style={indicatorStyle}></div>
        {sortOptions.map(option => (
          <button
            key={option.key}
            className={`${styles['sort-button']} ${sortBy === option.key ? styles['active'] : ''}`}
            onClick={() => setSortBy(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className={styles['players-grid']}>
        {sortedPlayers.length > 0 ? sortedPlayers.map(player => (
          <Link
            key={player.uuid}
            href={`/u/${player.username}`}
            className={styles['player-tile']}
          >
            <img
              src={`https://mc-heads.net/avatar/${player.username}/64`}
              alt={player.username}
              className={styles['player-avatar']}
              onError={(e) => {
                e.target.src = `https://crafatar.com/avatars/${player.username}?size=64&default=MHF_Steve`;
              }}
            />
            <div className={styles['player-info']}>
              <div className={styles['username']}>{player.username}</div>
              <div className={styles['played']}>
                Played: {Number(player[`${sortBy}_hours`] ?? 0).toFixed(1)}h
              </div>
            </div>
          </Link>
        )) : (
          <p>No players found.</p>
        )}
      </div>
    </div>
  );
}