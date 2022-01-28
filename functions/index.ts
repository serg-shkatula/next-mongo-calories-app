import database from '../utils/database';
import { DbUser, WithStringId } from '../types';
import { GetServerSidePropsContext } from 'next/types';
import { WithId } from 'mongodb';

export const getUserFromRequest = async (req: GetServerSidePropsContext['req']) => {
  const { authToken } = req.cookies;
  if (!authToken) return;
  return ((await (await database).users.findOne({ authToken })) as any) as DbUser;
};

export const replaceId = <T, T2 extends WithId<T>>(obj: T2): WithStringId<T2> => {
  const { _id, ...result } = obj;
  return { ...result, id: obj._id.toString() };
};

export const sanitise = <T extends readonly (keyof T2)[], T2 extends Record<string, unknown>>(
  keysToRemove: T,
  obj: T2,
) => {
  const result = { ...obj };
  keysToRemove.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T2, T[number]>;
};

export const sanitiseDbUser = (u: DbUser) => sanitise(['password', 'authToken'] as const, replaceId(u));
