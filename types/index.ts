import { WithId } from 'mongodb';

export type DbUser = WithId<{
  name: string;
  role?: 'admin';
  password: string;
  authToken: string;
  maxCaloriesPerDay?: number;
}>;
export type DbEntry = WithId<{
  date: string;
  foodName: string;
  calories: number;
  owner: string;
}>;

export type WithStringId<T extends WithId<unknown>> = Omit<T, '_id'> & {
  id: string;
};

export type User = Omit<WithStringId<DbUser>, 'password' | 'authToken'>;
export type Entry = WithStringId<DbEntry>;
