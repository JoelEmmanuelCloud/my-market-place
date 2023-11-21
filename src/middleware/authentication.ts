import { Request, Response, NextFunction } from 'express';
import CustomError from '../errors';
import { isTokenValid } from '../utils';

interface UserPayload {
  name: string;
  userId: string;
  role: string;
}

const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  try {
    const { name, userId, role } = isTokenValid({ token }) as UserPayload;
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError('Unauthorized to access this route');
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
