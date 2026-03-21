import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchOneVampire, fetchVampireFromDB } from '../../../../lib/queries';
import ConfigClient from '../../../../components/pages/ConfigClient';

export const revalidate = 1;
export const dynamicParams = true;

export async function generateStaticParams() {
  const vampires = await fetchVampireFromDB();
  if (vampires.failed) return [];
  return vampires.characters.map((v) => ({ id: v.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fetchedData = await fetchOneVampire(id);
  const name = fetchedData.data?.infos?.name;
  return {
    title: name ? `${name} - Configuration` : 'Configuration',
  };
}

export default async function ConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fetchedData = await fetchOneVampire(id);
  if (fetchedData.failed) redirect('/new');
  return <ConfigClient initialData={fetchedData.data!} id={id} />;
}
