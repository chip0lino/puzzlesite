import ClientPlayer from './ClientPlayer';
import Header from '../../../components/Header';

export default async function PlayerPage({ params }) {
  const { nickname } = await params;

  return (
    <>
      <Header />
      <ClientPlayer nickname={nickname} />
    </>
  );
}