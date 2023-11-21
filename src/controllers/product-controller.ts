import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import ProductModel, { IProduct } from '../models/product';
import {BadRequestError, NotFoundError} from '../errors';

const createProduct = async (req: Request, res: Response): Promise<void> => {
  req.body.user = req.user.userId;
  const product = await ProductModel.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await ProductModel.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const product = await ProductModel.findOne({ _id: productId }).populate('reviews');

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const product = await ProductModel.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const product = await ProductModel.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.files) {
    throw new BadRequestError('No File Uploaded');
  }

  const productImage = req.files.image;

  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('Please Upload Image');
  }

  const maxSize = 1024 * 1024;

  if (productImage.size > maxSize) {
    throw new BadRequestError('Please upload image smaller than 1MB');
  }

  const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

export { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct, uploadImage };
