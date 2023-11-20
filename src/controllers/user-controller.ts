import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError, UnauthenticatedError } from '../errors';
import {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} from '../utils';
import User from '../models/user';

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req: Request, res: Response): Promise<void> => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
