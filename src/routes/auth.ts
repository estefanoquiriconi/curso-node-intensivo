import type { IncomingMessage, ServerResponse } from 'http';
import {
  authSchema,
  createUser,
  findUserByEmail,
  HttpMethod,
  validatePassword,
} from '../models';
import { parseBody } from '../utils/parseBody';
import { safeParse } from 'valibot';
import { sign } from 'jsonwebtoken';
import { config } from '../config';

export const authRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  if (url === '/auth/register' && method === HttpMethod.POST) {
    const body = await parseBody(req);

    const result = safeParse(authSchema, body);

    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Bad  Request' }));
      return;
    }

    const { email, password } = body;

    try {
      const user = await createUser(email, password);
      res.statusCode = 201;
      res.end(JSON.stringify(user));
    } catch (err) {
      if (err instanceof Error) {
        res.end(JSON.stringify({ message: err.message }));
      } else {
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
      }
    }
  }

  if (url === '/auth/login' && method === HttpMethod.POST) {
    const body = await parseBody(req);

    const result = safeParse(authSchema, body);

    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Bad Request' }));
      return;
    }

    const { email, password } = body;
    const user = findUserByEmail(email);

    if (!user || !(await validatePassword(user, password))) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: 'Invalid email or password' }));
      return;
    }

    const accessToken = sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    const refreshToken = sign({ id: user.id }, config.jwtSecret, {
      expiresIn: '1d',
    });

    user.refreshToken = refreshToken;

    res.end(JSON.stringify({ accessToken, refreshToken }));
    return;
  }
};
