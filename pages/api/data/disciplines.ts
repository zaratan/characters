import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const dataDirectory = path.join(process.cwd(), 'data');
  const disciplinePath = path.join(dataDirectory, 'disciplines.json');
  const disciplinesJson = fs.readFileSync(disciplinePath, 'utf8');
  const disciplines = JSON.parse(disciplinesJson);

  res.status(200).json({ disciplines });
};
