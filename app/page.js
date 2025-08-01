'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import styles from '../app/globals.module.css';  // путь подкорректируй, если нужно

const words = [
  { text: 'build', color: '#FF9F0A', paddingLeft: '2px' },
  { text: 'trade', color: '#34C759', paddingLeft: '4px' },
  { text: 'explore', color: '#00DAC3', paddingLeft: '1px' },
  { text: 'communicate', color: '#1E6EF4', paddingLeft: '3px' },
  { text: 'cooperate', color: '#FF383C', paddingLeft: '2px' },
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className={styles.hero}>
        <Header />
        <main className={styles.main}>
          <h1 className={styles.title}>Smart Vanilla Server</h1>
          <p className={styles.description}>Survive, build your projects, find new friends</p>
          <p className={styles.description}>No private regions, donation privileges and useless plugins</p>
          <div className={styles['button-group']}>
            <button className={styles.button}>Get access</button>
            <button className={styles['button-outline']}>About</button>
          </div>
        </main>
      </section>

      <section className={styles['social-section']}>
        <h1>Server - as a social network</h1>
        <h2 className={styles['place-to']}>
          A place to
          <span className={styles['word-slider-wrapper']}>
            <span
              key={words[currentIndex].text}
              className={styles['word-slider']}
              style={{
                color: words[currentIndex].color,
                paddingLeft: words[currentIndex].paddingLeft,
              }}
            >
              {words[currentIndex].text}
            </span>
          </span>
        </h2>
      </section>

      <footer className={styles.footer}>
        <p>© 2025 Puzzle SMP</p>
      </footer>
    </>
  );
}
