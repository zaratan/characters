import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { nodeFetcher, host } from '../helpers/fetcher';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const initialData = await nodeFetcher(`${host(req)}/api/vampires`);

  return {
    props: {
      initialData,
    },
  };
};

const Home = ({
  initialData,
}: {
  initialData: { characters: Array<{ name: string; key: string }> };
}) => {
  const { data } = useSWR(`/api/vampires`, {
    refreshInterval: 10 * 1000,
    initialData,
  });
  console.log({ data });
  const { characters } = data;
  return (
    <>
      <Head>
        <title>Char - Feuilles de perso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ul>
        {characters.map((character) => (
          <li key={character.key}>
            <Link href="/vampires/[id]" as={`/vampires/${character.key}`}>
              <a>{character.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Home;
