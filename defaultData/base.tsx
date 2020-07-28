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
  era: 0,
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
const leftOverPex = 0;
const trueFaith = 0;
const humanMagic = {
  psy: [],
};

export default {
  generation,
  infos,
  attributes,
  mind,
  clanDisciplines,
  outClanDisciplines,
  combinedDisciplines,
  advantages,
  flaws,
  languages,
  leftOverPex,
  trueFaith,
  humanMagic,
};
