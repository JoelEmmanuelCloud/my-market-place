import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface UserPayload {
  name: string;
  userId: string;
  role: string;
}

const createJWT = ({ payload }: { payload: UserPayload }): string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }: { token: string }): any => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user }: { res: Response; user: UserPayload }): void => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

export { createJWT, isTokenValid, attachCookiesToResponse };
