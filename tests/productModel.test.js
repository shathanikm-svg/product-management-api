import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import productModel from '../src/models/product.js';

describe('ProductModel', () => {
  beforeEach(() => {
    productModel.reset();
  });

  describe('findAll()', () => {
    it('should return all non-archived products', () => {
      const p1 = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const p2 = productModel.create({ name: 'P2', sku: 'S2', price: '20', stock: '10' });
      const p3 = productModel.create({ name: 'P3', sku: 'S3', price: '30', stock: '15' });
      productModel.delete(p3.id);

      const products = productModel.findAll();
      assert.strictEqual(products.length, 2);
      assert.ok(products.find(p => p.id === p1.id));
      assert.ok(products.find(p => p.id === p2.id));
      assert.ok(!products.find(p => p.id === p3.id));
    });

    it('should return empty array if no products', () => {
      const products = productModel.findAll();
      assert.deepStrictEqual(products, []);
    });
  });

  describe('findById(id)', () => {
    it('should return the correct product for valid id', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const found = productModel.findById(p.id);
      assert.deepStrictEqual(found, p);
    });

    it('should return null for unknown id', () => {
      const found = productModel.findById('unknown-id');
      assert.strictEqual(found, null);
    });

    it('should return null for an archived product id', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      productModel.delete(p.id);
      const found = productModel.findById(p.id);
      assert.strictEqual(found, null);
    });
  });

  describe('findBySku(sku)', () => {
    it('should return the correct product', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const found = productModel.findBySku('S1');
      assert.deepStrictEqual(found, p);
    });

    it('should return null for unknown sku', () => {
      const found = productModel.findBySku('unknown-sku');
      assert.strictEqual(found, null);
    });
  });

  describe('update(id, patch)', () => {
    it('should update only the provided fields', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const updated = productModel.update(p.id, { name: 'P1 Updated' });
      assert.strictEqual(updated.name, 'P1 Updated');
      assert.strictEqual(updated.sku, 'S1');
      assert.strictEqual(updated.price, 10);
    });

    it('should not allow overwriting id or createdAt', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const originalId = p.id;
      const originalCreatedAt = p.createdAt;

      productModel.update(p.id, { id: 'new-id', createdAt: new Date(0) });
      const found = productModel.findById(originalId);

      assert.strictEqual(found.id, originalId);
      assert.strictEqual(found.createdAt, originalCreatedAt);
    });
  });

  describe('delete(id)', () => {
    it('should set archivedAt (soft archive)', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      const deleted = productModel.delete(p.id);
      assert.ok(deleted.archivedAt instanceof Date);
    });

    it('should exclude archived product from findAll()', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      productModel.delete(p.id);
      const products = productModel.findAll();
      assert.strictEqual(products.length, 0);
    });
  });

  describe('restore(id)', () => {
    it('should clear archivedAt and product should reappear in findAll()', () => {
      const p = productModel.create({ name: 'P1', sku: 'S1', price: '10', stock: '5' });
      productModel.delete(p.id);
      productModel.restore(p.id);

      const products = productModel.findAll();
      assert.strictEqual(products.length, 1);
      assert.strictEqual(products[0].id, p.id);
      assert.strictEqual(products[0].archivedAt, null);
    });
  });
});
