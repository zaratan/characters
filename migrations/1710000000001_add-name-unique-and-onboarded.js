exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addConstraint('users', 'users_name_unique', {
    unique: ['name'],
  });
  pgm.addColumn('users', {
    has_onboarded: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });
  pgm.sql('UPDATE users SET has_onboarded = true');
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'has_onboarded');
  pgm.dropConstraint('users', 'users_name_unique');
};
