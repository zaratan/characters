import { db } from './db';

export const fetchVampireFromDB = async (
  userId?: string,
  isAdmin?: boolean
) => {
  try {
    const characters = await db.vampires.list(userId, isAdmin);
    return { characters, failed: false };
  } catch (e) {
    return { characters: [], failed: true };
  }
};

export const fetchUsersFromDB = async () => {
  try {
    const users = await db.users.findAllPublic();
    return { users, failed: false };
  } catch (e) {
    return { users: [], failed: true };
  }
};

export const fetchOneVampire = async (id: string) => {
  try {
    const vampire = await db.vampires.findById(id);
    if (!vampire) return { data: null, failed: true };
    return { data: vampire, failed: false };
  } catch (e) {
    return { data: null, failed: true };
  }
};
