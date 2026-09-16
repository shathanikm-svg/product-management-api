import { v4 as uuidv4 } from 'uuid';

class ProductModel {
  constructor() {
    this.products = new Map();
  }

  /**
   * Retrieve a list of products based on optional filters.
   *
   * Note: Only returns products that are not soft-archived (archivedAt === null).
   *
   * @param {Object} [filters={}] - Filtering criteria (category, status, minPrice, maxPrice, inStock, search).
   * @returns {Array<Object>} List of non-archived products.
   */
  findAll(filters = {}) {
    let results = Array.from(this.products.values()).filter(p => p.archivedAt === null);

    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }
    if (filters.minPrice) {
      results = results.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= parseFloat(filters.maxPrice));
    }
    if (filters.inStock !== undefined) {
      const inStock = filters.inStock === 'true' || filters.inStock === true;
      results = results.filter(p => (p.stock > 0) === inStock);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    return results;
  }

  /**
   * Find a specific product by its unique identifier.
   *
   * Note: Returns null if the product is soft-archived.
   *
   * @param {string} id - The unique ID of the product.
   * @returns {Object|null} The product object if found and not archived, otherwise null.
   */
  findById(id) {
    const product = this.products.get(id);
    return (product && product.archivedAt === null) ? product : null;
  }

  /**
   * Find a product using its Stock Keeping Unit (SKU).
   *
   * Note: This method checks all products regardless of soft-archive status to ensure SKU uniqueness.
   *
   * @param {string} sku - The unique SKU of the product.
   * @returns {Object|null} The product object if found, otherwise null.
   */
  findBySku(sku) {
    return Array.from(this.products.values()).find(p => p.sku === sku) || null;
  }

  /**
   * Create a new product record.
   *
   * Note: Ensures SKU uniqueness across the entire product set.
   *
   * @param {Object} data - Product details (name, sku, description, category, price, stock, status).
   * @returns {Object} The newly created product object.
   * @throws {Object} Throws a 409 error if the SKU already exists.
   */
  create(data) {
    const skuExists = this.findBySku(data.sku);
    if (skuExists) {
      throw { statusCode: 409, message: 'Product with this SKU already exists' };
    }

    const product = {
      id: uuidv4(),
      name: data.name,
      sku: data.sku,
      description: data.description || '',
      category: data.category || 'other',
      price: parseFloat(parseFloat(data.price).toFixed(2)),
      stock: parseInt(data.stock, 10),
      status: data.status || 'active',
      createdAt: new Date(),
      archivedAt: null,
    };

    this.products.set(product.id, product);
    return product;
  }

  /**
   * Update an existing product's details.
   *
   * Note: Maintains SKU uniqueness; prevents updating to an SKU already assigned to another product.
   *
   * @param {string} id - Unique ID of the product.
   * @param {Object} patch - Fields to update.
   * @returns {Object|null} The updated product object, or null if not found or archived.
   * @throws {Object} Throws a 409 error if the updated SKU is already taken by another product.
   */
  update(id, patch) {
    const product = this.findById(id);
    if (!product) return null;

    if (patch.sku) {
      const skuExists = this.findBySku(patch.sku);
      if (skuExists && skuExists.id !== id) {
        throw { statusCode: 409, message: 'Product with this SKU already exists' };
      }
    }

    // Destructure to remove id and createdAt from the patch
    const { id: _, createdAt: __, ...cleanPatch } = patch;

    const updatedProduct = {
      ...product,
      ...cleanPatch,
      price: cleanPatch.price ? parseFloat(parseFloat(cleanPatch.price).toFixed(2)) : product.price,
      stock: cleanPatch.stock !== undefined ? parseInt(cleanPatch.stock, 10) : product.stock,
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  /**
   * Clear all product data from the store.
   *
   * @returns {void}
   */
  reset() {
    this.products.clear();
  }

  /**
   * Soft-delete a product by archiving it.
   *
   * Note: Implements soft-archive by setting archivedAt to current date instead of removing the record.
   *
   * @param {string} id - Unique ID of the product.
   * @returns {Object|null} The archived product object, or null if not found or already archived.
   */
  delete(id) {
    const product = this.products.get(id);
    if (!product || product.archivedAt !== null) return null;
    product.archivedAt = new Date();
    this.products.set(id, product);
    return product;
  }

  /**
   * Restore a previously soft-deleted product.
   *
   * Note: Reverses soft-archive by setting archivedAt back to null.
   *
   * @param {string} id - Unique ID of the product.
   * @returns {Object|null} The restored product object, or null if not found or not archived.
   */
  restore(id) {
    const product = this.products.get(id);
    if (!product || product.archivedAt === null) return null;
    product.archivedAt = null;
    this.products.set(id, product);
    return product;
  }
}

export default new ProductModel();
