import { v4 as uuidv4 } from 'uuid';

class ProductModel {
  constructor() {
    this.products = new Map();
  }

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

  findById(id) {
    const product = this.products.get(id);
    return (product && product.archivedAt === null) ? product : null;
  }

  findBySku(sku) {
    return Array.from(this.products.values()).find(p => p.sku === sku);
  }

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

  update(id, patch) {
    const product = this.findById(id);
    if (!product) return null;

    if (patch.sku) {
      const skuExists = this.findBySku(patch.sku);
      if (skuExists && skuExists.id !== id) {
        throw { statusCode: 409, message: 'Product with this SKU already exists' };
      }
    }

    const updatedProduct = {
      ...product,
      ...patch,
      price: patch.price ? parseFloat(parseFloat(patch.price).toFixed(2)) : product.price,
      stock: patch.stock !== undefined ? parseInt(patch.stock, 10) : product.stock,
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  delete(id) {
    const product = this.products.get(id);
    if (!product || product.archivedAt !== null) return null;
    product.archivedAt = new Date();
    this.products.set(id, product);
    return product;
  }

  restore(id) {
    const product = this.products.get(id);
    if (!product || product.archivedAt === null) return null;
    product.archivedAt = null;
    this.products.set(id, product);
    return product;
  }
}

export default new ProductModel();
