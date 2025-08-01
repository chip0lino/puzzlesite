'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PlayerTeams.module.css';

export default function PlayerTeams({ playerId }) {
  const [teams, setTeams] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!playerId) return;

    fetch(`https://backpuzzle.up.railway.app/api/player_teams/${playerId}`)
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Ошибка загрузки команд игрока:', err));
  }, [playerId]);

  if (teams.length === 0) return null;

  const handleTeamClick = (teamId) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <div className={styles.teamsSection}>
      <h2 className={styles.sectionTitle}>Teams</h2>
      <div className={styles.teamsContainer}>
        {teams.map(team => (
          <div
            key={team.id}
            className={styles.teamCard}
            onClick={() => handleTeamClick(team.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.teamContent}>
              <div className={styles.teamInfo}>
                <div className={styles.teamHeader}>
                  <img src={`https://mc-heads.net/avatar/${team.owner_name}/40`} alt="Owner Head" />
                  <span>{team.owner_name}</span>
                </div>
                <h3 className={styles.teamName}>{team.name}</h3>
                <p className={styles.teamDesc}>{team.desc}</p>
                <p className={styles.teamMembers}>● {team.members_count} members</p>
                <p className={styles.teamPlaytime}>● {team.weekly_hours} hours played in a week</p>
              </div>
              <div className={styles.teamBanner}>
                <img src={team.banner_link} alt="Team Banner" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
