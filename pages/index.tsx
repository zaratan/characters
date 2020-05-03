import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { nodeFetcher } from '../helpers/fetcher';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const initialData = await nodeFetcher(
    `${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${
      req.headers.host
    }/api/vampires`
  );

  return {
    props: {
      initialData,
    },
  };
};

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
