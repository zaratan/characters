import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { nodeFetcher } from '../helpers/fetcher';

export async function getStaticProps(_context) {
  const initialData = await nodeFetcher(
    `${
      process.env.VERCEL_URL
        ? 'https://characters.zaratan.fr'
        : 'http://localhost:3000'
    }/api/vampires`
  );

  return {
    props: {
      initialData,
    },
  };
}

const Home = ({
  initialData,
}: {
  initialData: { characters: Array<{ name: string; id: string }> };
}) => {
  const { data } = useSWR(`/api/vampires`, {
    refreshInterval: 10 * 1000,
    initialData,
  });
  const { characters } = data;
  return (
    <>
      <Head>
        <title>Char - Feuilles de perso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul>
        {characters.map((character) => (
          <li key={character.id}>
            <Link href={`/vampires/${character.id}`}>
              <a>{character.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Home;
