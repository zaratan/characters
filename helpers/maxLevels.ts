export const maxDot = (generation: number) => {
  if (generation > 7) {
    return 5;
  }
  if (generation <= 3) {
    return 10;
  }
  return 13 - generation;
};

export const maxBlood = (generation: number) => {
  switch (generation) {
    case 15:
    case 14:
    case 13:
      return 10;
    case 12:
      return 11;
    case 11:
      return 12;
    case 10:
      return 13;
    case 9:
      return 14;
    case 8:
      return 15;
    case 7:
      return 20;
    case 6:
      return 30;
    case 5:
      return 40;
    case 4:
      return 50;
    case 3:
      return 50;
    default:
      return 10;
  }
};
