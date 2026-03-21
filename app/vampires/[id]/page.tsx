import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchOneVampire, fetchVampireFromDB } from '../../../lib/queries';
import SheetClient from '../../../components/pages/SheetClient';

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
  const title = name
    ? `${name} - Feuille de Personnage`
    : 'Feuille de Personnage';
  return { title };
}

export default async function VampirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fetchedData = await fetchOneVampire(id);
  if (fetchedData.failed) redirect('/new');
  return <SheetClient initialData={fetchedData.data!} id={id} />;
}
