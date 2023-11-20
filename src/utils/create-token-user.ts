import { IUser } from '../models/user';

const createTokenUser = (user: IUser): { name: string; userId: string; role: string } => {
  return { name: user.name, userId: user._id.toString(), role: user.role };
};

export default createTokenUser;
