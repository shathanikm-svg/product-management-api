import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct
} from '../controllers/productController.js';
import {
  validateCreate,
  validateUpdate,
  validateFilters,
  handleValidationErrors
} from '../validators/productValidator.js';

const router = express.Router();

router.get('/', validateFilters, handleValidationErrors, getAllProducts);
router.get('/:id', getProductById);
router.post('/', validateCreate, handleValidationErrors, createProduct);
router.patch('/:id', validateUpdate, handleValidationErrors, updateProduct);
router.delete('/:id', deleteProduct);
router.delete('/:id/restore', restoreProduct);

export default router;
