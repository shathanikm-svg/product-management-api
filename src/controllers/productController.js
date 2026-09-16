import productModel from '../models/product.js';
import catchAsync from '../middleware/catchAsync.js';

/**
 * Retrieve all products based on query filters.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 200 - Success
 */
export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = productModel.findAll(req.query);
  res.json({
    success: true,
    data: products,
    error: null,
  });
});

/**
 * Retrieve a single product by ID.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 200 - Success
 * @status 404 - Product not found
 */
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

/**
 * Create a new product.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 201 - Product created
 * @status 409 - SKU already exists
 */
export const createProduct = catchAsync(async (req, res, next) => {
  const product = productModel.create(req.body);
  res.status(201).json({
    success: true,
    data: product,
    error: null,
  });
});

/**
 * Update an existing product.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 200 - Product updated
 * @status 404 - Product not found
 * @status 409 - SKU already exists
 */
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

/**
 * Soft-delete a product.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 200 - Product archived
 * @status 404 - Product not found or already archived
 */
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

/**
 * Restore a soft-deleted product.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns {Promise<void>}
 * @status 200 - Product restored
 * @status 404 - Product not found or not archived
 */
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
