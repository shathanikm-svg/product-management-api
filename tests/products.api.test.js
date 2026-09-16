import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import createApp from '../src/app.js';
import productModel from '../src/models/product.js';

const app = createApp();

describe('Products API Integration Tests', () => {
  beforeEach(() => {
    productModel.reset();
    productModel.create({
      name: 'Laptop',
      sku: 'LAP-001',
      description: 'High-performance laptop',
      category: 'electronics',
      price: 1200,
      stock: 10
    });
    productModel.create({
      name: 'Coffee Mug',
      sku: 'MUG-001',
      description: 'Ceramic coffee mug',
      category: 'home',
      price: 15,
      stock: 0
    });
  });

  describe('GET /products', () => {
    it('returns 200 and an array of non-archived products', async () => {
      const res = await request(app).get('/products');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.strictEqual(res.body.data.length, 2);
    });

    it('returns only non-archived products', async () => {
      const p = productModel.create({ name: 'Archived', sku: 'ARC-001', price: 10, stock: 1 });
      productModel.delete(p.id);

      const res = await request(app).get('/products');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 2);
      assert.ok(!res.body.data.some(item => item.sku === 'ARC-001'));
    });

    it('filters by category', async () => {
      const res = await request(app).get('/products?category=electronics');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 1);
      assert.strictEqual(res.body.data[0].name, 'Laptop');
    });

    it('filters by price range', async () => {
      const res = await request(app).get('/products?minPrice=10&maxPrice=20');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 1);
      assert.strictEqual(res.body.data[0].name, 'Coffee Mug');
    });

    it('filters by inStock=true', async () => {
      const res = await request(app).get('/products?inStock=true');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.length, 1);
      assert.strictEqual(res.body.data[0].name, 'Laptop');
    });

    it('filters by search term in name and description', async () => {
      const resName = await request(app).get('/products?search=Laptop');
      assert.strictEqual(resName.body.data.length, 1);

      const resDesc = await request(app).get('/products?search=Ceramic');
      assert.strictEqual(resDesc.body.data.length, 1);
      assert.strictEqual(resDesc.body.data[0].name, 'Coffee Mug');
    });
  });

  describe('GET /products/:id', () => {
    it('returns 200 with the correct product', async () => {
      const p = productModel.create({ name: 'Test', sku: 'TST-001', price: 10, stock: 1 });
      const res = await request(app).get(`/products/${p.id}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.id, p.id);
      assert.strictEqual(res.body.data.name, 'Test');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).get('/products/non-existent-id');
      assert.strictEqual(res.status, 404);
    });

    it('returns 404 for an archived product id', async () => {
      const p = productModel.create({ name: 'Archived', sku: 'ARC-002', price: 10, stock: 1 });
      productModel.delete(p.id);
      const res = await request(app).get(`/products/${p.id}`);
      assert.strictEqual(res.status, 404);
    });
  });

  describe('POST /products', () => {
    it('returns 201 with the created product', async () => {
      const body = {
        name: 'New Product',
        sku: 'NEW-001',
        price: 100,
        stock: 5
      };
      const res = await request(app).post('/products').send(body);
      assert.strictEqual(res.status, 201);
      assert.ok(res.body.data.id);
      assert.ok(res.body.data.createdAt);
      assert.strictEqual(res.body.data.name, body.name);
      assert.strictEqual(res.body.data.sku, body.sku);
    });

    it('returns 422 when name is missing', async () => {
      const res = await request(app).post('/products').send({ sku: 'NO-NAME', price: 10, stock: 1 });
      assert.strictEqual(res.status, 422);
    });

    it('returns 422 when sku format is invalid', async () => {
      const res = await request(app).post('/products').send({ name: 'Invalid SKU', sku: '!!!', price: 10, stock: 1 });
      assert.strictEqual(res.status, 422);
    });

    it('returns 422 when price is negative', async () => {
      const res = await request(app).post('/products').send({ name: 'Neg Price', sku: 'NEG-001', price: -10, stock: 1 });
      assert.strictEqual(res.status, 422);
    });

    it('returns 409 when sku already exists', async () => {
      const res = await request(app).post('/products').send({ name: 'Dup SKU', sku: 'LAP-001', price: 10, stock: 1 });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('PATCH /products/:id', () => {
    it('returns 200 with only patched fields changed', async () => {
      const p = productModel.create({ name: 'Patch Me', sku: 'PAT-001', price: 10, stock: 1 });
      const res = await request(app).patch(`/products/${p.id}`).send({ name: 'Patched Name' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.name, 'Patched Name');
      assert.strictEqual(res.body.data.sku, 'PAT-001');
    });

    it('returns 404 for an unknown id', async () => {
      const res = await request(app).patch('/products/non-existent-id').send({ name: 'New Name' });
      assert.strictEqual(res.status, 404);
    });

    it('returns 400 when the body is empty', async () => {
      const p = productModel.create({ name: 'Empty Patch', sku: 'EMP-001', price: 10, stock: 1 });
      const res = await request(app).patch(`/products/${p.id}`).send({});
      assert.strictEqual(res.status, 400);
    });

    it('does not allow updating sku or id', async () => {
      const p = productModel.create({ name: 'No Update', sku: 'NOU-001', price: 10, stock: 1 });
      const res = await request(app).patch(`/products/${p.id}`).send({ sku: 'NEW-SKU', id: 'NEW-ID' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.sku, 'NOU-001');
      assert.strictEqual(res.body.data.id, p.id);
    });
  });

  describe('DELETE /products/:id', () => {
    it('returns 204 and archives product', async () => {
      const p = productModel.create({ name: 'Delete Me', sku: 'DEL-001', price: 10, stock: 1 });
      const res = await request(app).delete(`/products/${p.id}`);
      assert.strictEqual(res.status, 204);

      const getRes = await request(app).get(`/products/${p.id}`);
      assert.strictEqual(getRes.status, 404);
    });
  });

  describe('DELETE /products/:id/restore', () => {
    it('returns 200 and product reappears in GET /products', async () => {
      const p = productModel.create({ name: 'Restore Me', sku: 'RES-001', price: 10, stock: 1 });
      productModel.delete(p.id);

      const res = await request(app).delete(`/products/${p.id}/restore`);
      assert.strictEqual(res.status, 200);

      const getRes = await request(app).get('/products');
      assert.ok(getRes.body.data.some(item => item.sku === 'RES-001'));
    });
  });
});
