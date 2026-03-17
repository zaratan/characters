import { fetchVampireFromDB } from '../lib/queries';
import HomeClient from '../components/pages/HomeClient';

export const revalidate = 600;

export default async function HomePage() {
  const initialData = await fetchVampireFromDB();
  return <HomeClient initialData={initialData} />;
}
