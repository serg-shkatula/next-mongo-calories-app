import { Collection, MongoClient } from 'mongodb';
import { DbEntry, DbUser } from '../types';

type DatabaseApi = {
  users: Collection<DbUser>;
  entries: Collection<DbEntry>;
};

const globalObject = (global as unknown) as { _databaseApi: DatabaseApi };
let resolve: (dbApi: DatabaseApi) => void;
let dbApi: Promise<DatabaseApi> | DatabaseApi = new Promise<DatabaseApi>((res) => (resolve = res));

if (!globalObject._databaseApi) {
  const client = new MongoClient(process.env.MONGODB_URI);

  client.connect(async (err) => {
    if (err) return;
    console.log('connection created');
    const db = client.db(process.env.MONGODB_DB);
    globalObject._databaseApi = {
      users: db.collection('users'),
      entries: db.collection('entries'),
    };
    resolve(globalObject._databaseApi);
  });
} else {
  dbApi = globalObject._databaseApi;
}

export default dbApi;
