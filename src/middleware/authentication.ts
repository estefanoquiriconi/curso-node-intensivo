import { ServerResponse, type IncomingMessage } from 'http';
import { verify, type JwtPayload } from 'jsonwebtoken';
import { isTokenRevoke } from '../models';
import config from '../config/config';

/**
 * Interface representing an authenticated request.
 * Extends the IncomingMessage to include user information.
 */
export interface AuthenticatedRequest extends IncomingMessage {
  user?: JwtPayload | string;
}

/**
 * Middleware function to authenticate a token from the request.
 *
 * @param {AuthenticatedRequest} req - The incoming request object containing the token.
 * @param {ServerResponse} res - The server response object to send responses.
 * @returns {Promise<boolean>} - Returns true if authentication is successful, otherwise false.
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: ServerResponse
): Promise<boolean> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: 'Unauthorized' }));
    return false;
  }

  if (isTokenRevoke(token)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: 'Forbidden' }));
    return false;
  }

  try {
    const decoded = verify(token, config.jwtSecret);

    req.user = decoded;

    return true;
  } catch (_err) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: 'Forbidden' }));
    return false;
  }
};
