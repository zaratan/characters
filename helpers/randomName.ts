const adjectives = [
  'Cunning',
  'Dashing',
  'Brooding',
  'Ancient',
  'Shadowy',
  'Elegant',
  'Fierce',
  'Mystic',
  'Silent',
  'Radiant',
  'Veiled',
  'Crimson',
  'Pale',
  'Nocturnal',
  'Arcane',
  'Sovereign',
  'Ethereal',
  'Relentless',
  'Twilight',
  'Spectral',
];

const nouns = [
  'Nosferatu',
  'Tremere',
  'Ventrue',
  'Toreador',
  'Brujah',
  'Malkavian',
  'Gangrel',
  'Lasombra',
  'Tzimisce',
  'Ravnos',
  'Setite',
  'Assamite',
  'Caitiff',
  'Kindred',
  'Elder',
  'Neonate',
  'Ancilla',
  'Methuselah',
  'Archon',
  'Primogen',
];

export const generateRandomName = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${adj} ${noun} #${suffix}`;
};
