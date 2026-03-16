exports.up = (pgm) => {
  // --- Tables NextAuth ---
  pgm.createTable('users', {
    id: {
      type: 'text',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'text' },
    email: { type: 'text', unique: true },
    emailVerified: { type: 'timestamptz' },
    image: { type: 'text' },
    is_admin: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createTable('accounts', {
    id: {
      type: 'text',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    userId: {
      type: 'text',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    type: { type: 'text', notNull: true },
    provider: { type: 'text', notNull: true },
    providerAccountId: { type: 'text', notNull: true },
    refresh_token: { type: 'text' },
    access_token: { type: 'text' },
    expires_at: { type: 'integer' },
    token_type: { type: 'text' },
    scope: { type: 'text' },
    id_token: { type: 'text' },
    session_state: { type: 'text' },
  });
  pgm.addConstraint('accounts', 'accounts_provider_unique', {
    unique: ['provider', 'providerAccountId'],
  });

  pgm.createTable('sessions', {
    id: {
      type: 'text',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    sessionToken: { type: 'text', notNull: true, unique: true },
    userId: {
      type: 'text',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
    expires: { type: 'timestamptz', notNull: true },
  });

  pgm.createTable('verification_tokens', {
    identifier: { type: 'text', notNull: true },
    token: { type: 'text', notNull: true, unique: true },
    expires: { type: 'timestamptz', notNull: true },
  });
  pgm.addConstraint('verification_tokens', 'verification_tokens_pkey', {
    primaryKey: ['identifier', 'token'],
  });

  // --- Tables applicatives ---
  pgm.createTable('vampires', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    private_sheet: { type: 'boolean', notNull: true, default: false },
    data: { type: 'jsonb', notNull: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createTable('vampire_editors', {
    vampire_id: {
      type: 'uuid',
      notNull: true,
      references: 'vampires',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'text',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('vampire_editors', 'vampire_editors_pkey', {
    primaryKey: ['vampire_id', 'user_id'],
  });
  pgm.addConstraint('vampire_editors', 'vampire_editors_user_id_check', {
    check: "user_id <> ''",
  });

  pgm.createTable('vampire_viewers', {
    vampire_id: {
      type: 'uuid',
      notNull: true,
      references: 'vampires',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'text',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('vampire_viewers', 'vampire_viewers_pkey', {
    primaryKey: ['vampire_id', 'user_id'],
  });
  pgm.addConstraint('vampire_viewers', 'vampire_viewers_user_id_check', {
    check: "user_id <> ''",
  });

  // --- Index pour les requêtes fréquentes ---
  pgm.createIndex('vampire_editors', 'user_id', {
    name: 'idx_vampire_editors_user',
  });
  pgm.createIndex('vampire_viewers', 'user_id', {
    name: 'idx_vampire_viewers_user',
  });
  pgm.createIndex('vampires', 'private_sheet', {
    name: 'idx_vampires_private',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('vampire_viewers');
  pgm.dropTable('vampire_editors');
  pgm.dropTable('vampires');
  pgm.dropTable('verification_tokens');
  pgm.dropTable('sessions');
  pgm.dropTable('accounts');
  pgm.dropTable('users');
};
