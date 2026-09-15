import productModel from '../models/product.js';
import catchAsync from '../middleware/catchAsync.js';

export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = productModel.findAll(req.query);
  res.json({
    success: true,
    data: products,
    error: null,
  });
});

export const getProductById = catchAsync(async (req, res, next) => {
  const product = productModel.findById(req.params.id);
  if (!product) {
    throw { statusCode: 404, message: 'Product not found' };
  }
  res.json({
    success: true,
    data: product,
    error: null,
  });
});

export const createProduct = catchAsync(async (req, res, next) => {
  const product = productModel.create(req.body);
  res.status(201).json({
    success: true,
    data: product,
    error: null,
  });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const product = productModel.update(req.params.id, req.body);
  if (!product) {
    throw { statusCode: 404, message: 'Product not found' };
  }
  res.json({
    success: true,
    data: product,
    error: null,
  });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = productModel.delete(req.params.id);
  if (!product) {
    throw { statusCode: 404, message: 'Product not found' };
  }
  res.json({
    success: true,
    data: product,
    error: null,
  });
});

export const restoreProduct = catchAsync(async (req, res, next) => {
  const product = productModel.restore(req.params.id);
  if (!product) {
    throw { statusCode: 404, message: 'Product not found or not archived' };
  }
  res.json({
    success: true,
    data: product,
    error: null,
  });
});
