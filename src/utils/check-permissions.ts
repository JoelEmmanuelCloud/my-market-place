import { UnauthorizedError } from '../errors';

const checkPermissions = (requestUser: { role: string, userId: string }, resourceUserId: string): void => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnauthorizedError('Not authorized to access this route');
};

export default checkPermissions;
