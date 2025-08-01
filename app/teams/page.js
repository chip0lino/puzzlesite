'use client';

import styles from './teams.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('https://backpuzzle.up.railway.app/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error('Ошибка загрузки команд:', err));
  }, []);

  const handleTeamClick = (teamId) => {
    router.push(`/teams/${teamId}`);
  };

  return (
    <>
      <Header />
      <main className={styles.teamsMain}>
        <h1>Teams</h1>
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
      </main>
    </>
  );
}
