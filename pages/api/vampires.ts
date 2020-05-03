import { NextApiRequest, NextApiResponse } from 'next';

const vampires = [{ name: 'Sined Nisap', id: '12' }];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;

  res.status(200).json({
    id,
    characters: vampires,
  });
};
