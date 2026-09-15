import { body, query, validationResult } from 'express-validator';

const validCategories = ['electronics', 'clothing', 'food', 'books', 'other'];
const validStatuses = ['active', 'inactive', 'discontinued'];

export const validateCreate = [
  body('name').notEmpty().withMessage('Name is required and must be a string').isString().withMessage('Name is required and must be a string'),
  body('sku').notEmpty().withMessage('SKU is required and must be a string').isString().withMessage('SKU is required and must be a string'),
  body('category').optional().isIn(validCategories).withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
];

export const validateUpdate = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('sku').optional().isString().withMessage('SKU must be a string'),
  body('category').optional().isIn(validCategories).withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
];

export const validateFilters = [
  query('category').optional().isIn(validCategories).withMessage(`Category must be one of: ${validCategories.join(', ')}`),
  query('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  query('minPrice').optional().isFloat().withMessage('minPrice must be a number'),
  query('maxPrice').optional().isFloat().withMessage('maxPrice must be a number'),
  query('inStock').optional().isBoolean().withMessage('inStock must be a boolean'),
  query('search').optional().isString().withMessage('search must be a string'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return next({
      statusCode: 400,
      message: firstError.msg,
    });
  }
  next();
};
