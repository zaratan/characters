import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

export async function GET() {
  const dataDirectory = path.join(process.cwd(), 'data');
  const disciplinePath = path.join(dataDirectory, 'disciplines.json');
  const disciplinesJson = fs.readFileSync(disciplinePath, 'utf8');
  const disciplines = JSON.parse(disciplinesJson);

  const disciplineCombiPath = path.join(dataDirectory, 'disciplinesCombi.json');
  const disciplinesCombiJson = fs.readFileSync(disciplineCombiPath, 'utf8');
  const disciplinesCombi = JSON.parse(disciplinesCombiJson);

  const treatedDiscCombi = disciplinesCombi.map((disc) => ({
    name: disc.name,
    url: `https://wod.zaratan.fr/powers/combo#power-${slugify(
      disc.name
    ).toLowerCase()}-${disc.source.length}`,
  }));

  return NextResponse.json({ disciplines, disciplinesCombi: treatedDiscCombi });
}
