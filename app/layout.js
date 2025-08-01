import styles from './globals.module.css';
import Header from '../components/Header';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'], // добавил кириллицу для безопасности
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Puzzle SMP',
  description: 'Puzzle SMP Official Website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={manrope.className}>
        <Header />
        <div className={styles.container}>
          {children}
        </div>
      </body>
    </html>
  );
}
