exports.up = (pgm) => {
  pgm.addColumn('vampires', {
    owner_id: { type: 'text', references: 'users', onDelete: 'CASCADE' },
  });

  // Delete orphaned vampires (no editors) — they cannot have an owner
  pgm.sql(`
    DELETE FROM vampires
    WHERE id NOT IN (SELECT DISTINCT vampire_id FROM vampire_editors)
  `);

  // Backfill: the first editor (by user_id sort order) becomes the owner
  pgm.sql(`
    UPDATE vampires v
    SET owner_id = (
      SELECT user_id FROM vampire_editors ve
      WHERE ve.vampire_id = v.id
      ORDER BY user_id
      LIMIT 1
    )
  `);

  pgm.alterColumn('vampires', 'owner_id', { notNull: true });
  pgm.createIndex('vampires', 'owner_id', { name: 'idx_vampires_owner' });
};

exports.down = (pgm) => {
  pgm.dropColumn('vampires', 'owner_id');
};
