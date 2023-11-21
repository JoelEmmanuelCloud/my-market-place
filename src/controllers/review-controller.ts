import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {BadRequestError, NotFoundError} from '../errors';
import  ProductModel, {IProduct } from '../models/product';
import  ReviewModel, {IReview } from '../models/review'; 
import { checkPermissions } from '../utils';

const createReview = async (req: Request, res: Response): Promise<void> => {
  const { product: productId } = req.body;

  const isValidProduct = await ProductModel.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  const alreadySubmitted = await ReviewModel.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadySubmitted) {
    throw new BadRequestError(
      'Already submitted review for this product'
    );
  }

  req.body.user = req.user.userId;
  const review = await ReviewModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  const reviews = await ReviewModel.find({}).populate({
    path: 'product',
    select: 'name company price',
  });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req: Request, res: Response): Promise<void> => {
  const { id: reviewId } = req.params;

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req: Request, res: Response): Promise<void> => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const { id: reviewId } = req.params;

  const review = await ReviewModel.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

const getSingleProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const reviews = await ReviewModel.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export { createReview, getAllReviews, getSingleReview, updateReview, deleteReview, getSingleProductReviews };
