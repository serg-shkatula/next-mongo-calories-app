import type { NextApiRequest, NextApiResponse } from 'next';
import database from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credentials } = JSON.parse(req.body);
  let authToken = 'no-token';

  if (credentials.password) {
    try {
      const user = await (await database).users.findOne({ password: credentials.password });
      if (user) authToken = user.authToken;
    } catch (e) {
      console.log(e);
    }
  }

  res
    .setHeader(
      'Set-Cookie',
      `authToken=${authToken}; path=/; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`,
    )
    .status(200)
    .end();
}
