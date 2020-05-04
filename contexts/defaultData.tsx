const knowledges = [
  { title: 'Érudition', value: 0 },
  { title: 'Investigation', value: 0 },
  { title: 'Droit', value: 0 },
  { title: 'Linguistique', value: 0 },
  { title: 'Médecine', value: 0 },
  { title: 'Occulte', value: 0 },
  { title: 'Sagesse pop.', value: 0 },
  { title: 'Politique', value: 0 },
  { title: 'Senechal', value: 0 },
  { title: 'Theologie', value: 0 },
];

const customKnowledges = [];

const skills = [
  { title: 'Animaux', value: 0 },
  { title: 'Archerie', value: 0 },
  { title: 'Artisanats', value: 0 },
  { title: 'Equitation', value: 0 },
  { title: 'Etiquette', value: 0 },
  { title: 'Furtivite', value: 0 },
  { title: 'Commerce', value: 0 },
  { title: 'Melee', value: 0 },
  { title: 'Représentation', value: 0 },
  { title: 'Survie', value: 0 },
];

const customSkills = [];

const talents = [
  { title: 'Expression', value: 0 },
  { title: 'Vigilance', value: 0 },
  { title: 'Athlétisme', value: 0 },
  {
    title: 'Bagare',
    value: 0,
  },
  { title: 'Conscience', value: 0 },
  { title: 'Empathie', value: 0 },
  { title: 'Intimidation', value: 0 },
  { title: 'Passe-passe', value: 0 },
  { title: 'Commandement', value: 0 },
  { title: 'Subterfuge', value: 0 },
];

const customTalents = [];

const attributes = {
  strength: 1,
  dexterity: 1,
  stamina: 1,
  charisma: 1,
  manipulation: 1,
  appearance: 1,
  perception: 1,
  intelligence: 1,
  wits: 1,
};

const generation = 12;

const infos = {
  name: '',
  playerName: '',
  nature: '',
  sire: '',
  demeanor: '',
  haven: '',
  chronicle: '',
  clan: '',
};

const mind = {
  willpower: 1,
  tempWillpower: 0,
  bloodSpent: 0,
  conscience: 1,
  isConviction: false,
  selfControl: 1,
  isInstinct: false,
  courage: 1,
  pathName: 'Humanité',
  path: 7,
  isExtraBruisable: false,
  health: [0, 0, 0, 0, 0, 0, 0, 0],
};

const clanDisciplines = [];

const outClanDisciplines = [];

const combinedDisciplines = [];

const advantages = [];
const flaws = [];
const languages = [];

export default {
  generation,
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
  advantages,
  flaws,
  languages,
};
