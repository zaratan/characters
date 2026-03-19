module.exports = {
  compiler: {
    styledComponents: true,
  },
  // TODO: Retirer ignoreDuringBuilds lors de la migration Next 16 (ESLint 9 supporté nativement)
  eslint: {
    ignoreDuringBuilds: true,
  },
};
