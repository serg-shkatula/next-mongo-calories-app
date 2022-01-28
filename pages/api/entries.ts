import type { NextApiRequest, NextApiResponse } from 'next';
import { DbEntry } from '../../types';
import database from '../../utils/database';
import { getUserFromRequest } from '../../functions';
import { ObjectId } from 'mongodb';

type ResponseData = DbEntry[] | { error: string } | { ok: boolean } | undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'You must be logged in' });
  }

  const isAdmin = user.role === 'admin';
  const payload = JSON.parse(req.body || '{}');

  const db = await database;

  try {
    let result: ResponseData;
    switch (req.method) {
      case 'GET':
        result = await db.entries.find(isAdmin ? {} : { owner: user._id.toString() }).toArray();
        break;
      case 'POST':
        await db.entries.insertOne({ ...payload.data, ...(isAdmin ? {} : { owner: user._id.toString() }) });
        result = { ok: true };
        break;
      case 'PUT':
        if (!isAdmin) return res.status(403).json({ error: 'You are not authorised to update entries' });
        if (!payload.changes || !Object.keys(payload.changes).length) throw new Error('Missing data...');
        await db.entries.bulkWrite(
          Object.keys(payload.changes).map((key) => ({
            updateOne: {
              filter: {
                _id: new ObjectId(key),
              },
              update: {
                $set: payload.changes[key],
              },
            },
          })),
        );
        result = { ok: true };
        break;
      case 'DELETE':
        if (!isAdmin) return res.status(403).json({ error: 'You are not authorised to delete entries' });
        if (!payload.ids || !payload.ids.length) throw new Error('Missing IDs...');
        await db.entries.deleteMany({
          _id: { $in: payload.ids.map((id: string) => new ObjectId(id)) },
        });
        result = { ok: true };
        break;
    }
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ error: 'Error while manipulating/fetching entries: ' + String(e) });
  }
}
