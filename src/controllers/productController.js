import productModel from '../models/product.js';

const validateProduct = (data) => {
  const { name, sku, category, price, stock, status } = data;
  const validCategories = ['electronics', 'clothing', 'food', 'books', 'other'];
  const validStatuses = ['active', 'inactive', 'discontinued'];

  if (!name || typeof name !== 'string') throw { statusCode: 400, message: 'Name is required and must be a string' };
  if (!sku || typeof sku !== 'string') throw { statusCode: 400, message: 'SKU is required and must be a string' };

  if (category && !validCategories.includes(category)) {
    throw { statusCode: 400, message: `Category must be one of: ${validCategories.join(', ')}` };
  }

  if (price !== undefined) {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) throw { statusCode: 400, message: 'Price must be a positive number' };
  }

  if (stock !== undefined) {
    const s = parseInt(stock, 10);
    if (isNaN(s) || s < 0) throw { statusCode: 400, message: 'Stock must be a non-negative integer' };
  }

  if (status && !validStatuses.includes(status)) {
    throw { statusCode: 400, message: `Status must be one of: ${validStatuses.join(', ')}` };
  }
};

export const getAllProducts = (req, res, next) => {
  try {
    const products = productModel.findAll(req.query);
    res.json({
      success: true,
      data: products,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = (req, res, next) => {
  try {
    const product = productModel.findById(req.params.id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    res.json({
      success: true,
      data: product,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = (req, res, next) => {
  try {
    validateProduct(req.body);
    const product = productModel.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
      error: null,
    });
  } catch (error) {
    if (error.message === 'Product with this SKU already exists') {
      error.statusCode = 409;
    }
    next(error);
  }
};

export const updateProduct = (req, res, next) => {
  try {
    validateProduct(req.body);
    const product = productModel.update(req.params.id, req.body);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    res.json({
      success: true,
      data: product,
      error: null,
    });
  } catch (error) {
    if (error.message === 'Product with this SKU already exists') {
      error.statusCode = 409;
    }
    next(error);
  }
};

export const deleteProduct = (req, res, next) => {
  try {
    const product = productModel.delete(req.params.id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    res.json({
      success: true,
      data: product,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
