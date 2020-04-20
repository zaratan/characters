export const maxDot = (generation: number) => {
  if (generation > 7) {
    return 5;
  }
  if (generation <= 3) {
    return 10;
  }
  return 13 - generation;
};
