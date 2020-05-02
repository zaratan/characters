import { NextApiRequest, NextApiResponse } from 'next';

const knowledges = [
  { title: 'Érudition', value: 1 },
  { title: 'Investigation', value: 1 },
  { title: 'Droit', value: 1 },
  { title: 'Linguistique', value: 1 },
  { title: 'Médecine', value: 1 },
  { title: 'Occulte', value: 1 },
  { title: 'Sagesse pop.', value: 1 },
  { title: 'Politique', value: 1 },
  { title: 'Senechal', value: 1 },
  { title: 'Theologie', value: 1 },
];

const customKnowledges = [{ title: 'Énigme', value: 1, key: 'Énigme' }];

const skills = [
  { title: 'Animaux', value: 1 },
  { title: 'Archerie', value: 1 },
  { title: 'Artisanats', value: 1 },
  { title: 'Equitation', value: 3 },
  { title: 'Etiquette', value: 1 },
  { title: 'Furtivite', value: 0 },
  { title: 'Commerce', value: 1 },
  { title: 'Melee', value: 1 },
  { title: 'Représentation', value: 1 },
  { title: 'Survie', value: 1 },
];

const customSkills = [{ title: 'Stratégie', value: 4, key: 'Stratégie' }];

const talents = [
  { title: 'Expression', value: 1 },
  { title: 'Vigilance', value: 3 },
  { title: 'Athlétisme', value: 6 },
  {
    title: 'Bagare',
    value: 6,
    specialties: [
      {
        name: 'Poings',
        key: 'fist',
      },
    ],
  },
  { title: 'Conscience', value: 1 },
  { title: 'Empathie', value: 1 },
  { title: 'Intimidation', value: 1 },
  { title: 'Passe-passe', value: 1 },
  { title: 'Commandement', value: 1 },
  { title: 'Subterfuge', value: 1 },
];

const customTalents = [];

const attributes = {
  strength: 1,
  dexterity: 3,
  stamina: 6,
  charisma: 2,
  manipulation: 3,
  appearance: 6,
  perception: 1,
  intelligence: 3,
  wits: 6,
};

const infos = {
  name: 'Sined Nisap',
  playerName: 'Zaratan',
  generation: 6,
  nature: 'Pon',
  sire: 'None',
  demeanor: 'Test',
  haven: 'Kyoto',
  chronicle: 'Life',
  clan: 'None',
};

const mind = {
  willpower: 6,
  tempWillpower: 4,
  bloodSpent: 6,
  conscience: 4,
  isConviction: true,
  selfControl: 2,
  isInstinct: false,
  courage: 4,
  pathName: 'Roi (Vizir)',
  path: 6,
  isExtraBruisable: true,
  health: [3, 3, 2, 2, 1, 0, 0, 0],
};

const clanDisciplines = [
  { title: 'Protéan', value: 6, key: 'grotean', isThaumaturgy: false },
  { title: 'Endurance', value: 3, key: 'schtonk', isThaumaturgy: false },
];

const outClanDisciplines = [
  {
    title: 'Thaumaturgie',
    value: 2,
    key: 'gromaturgie',
    isThaumaturgy: true,
    mainPathName: 'Voie du Sang',
    paths: [{ title: 'Voie de Mercure', value: 1, key: 'rnd' }],
    rituals: [
      { title: 'Defense de havre sacré', value: 1, key: 'it protects' },
    ],
    ritualMulti: 1,
  },
  {
    title: 'Thaumaturgie Sétite',
    value: 1,
    key: 'gromaturgie-set',
    isThaumaturgy: true,
    mainPathName: 'Voie de Ptah',
    paths: [{ title: 'Voie de Thoth', value: 1, key: 'rnd-thot' }],
    rituals: [{ title: 'Ecrire le nom de Set', value: 1, key: 'it write' }],
    ritualMulti: 2,
  },
  { title: 'Auspex', value: 5, key: 'ISEETHINGS', isThaumaturgy: false },
];

const combinedDisciplines = [
  { title: 'Griffes de Fenrir', value: 21, key: 'graou' },
];

const vampire = {
  infos,
  attributes,
  talents,
  customTalents,
  skills,
  customSkills,
  knowledges,
  customKnowledges,
  mind,
  clanDisciplines,
  outClanDisciplines,
  combinedDisciplines,
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { id },
  } = req;

  res.status(200).json({ id, vampire });
};
