# Product Management API

A RESTful API for managing a product catalogue, featuring full CRUD operations, soft-archive support, and advanced filtering and searching capabilities. The API allows for efficient product tracking with SKU uniqueness constraints and a flexible query system for catalogue discovery.

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-management-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the server in development mode:
```bash
npm start
```
The server will start by default on `http://localhost:3000`.

## Running Tests

Execute the test suite:
```bash
npm test
```

Generate a coverage report:
```bash
npm run test:coverage
```

## API Endpoints

| Method | Path | Description | Example curl |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | List all active products | `curl "http://localhost:3000/products?category=electronics"` |
| `GET` | `/products/:id` | Get product by ID | `curl http://localhost:3000/products/123e4567-e89b-12d3-a456-426614174000` |
| `POST` | `/products` | Create a new product | `curl -X POST -H "Content-Type: application/json" -d '{"name":"Gaming Mouse", "sku":"GM-101", "price":59.99, "stock":50}' http://localhost:3000/products` |
| `PATCH` | `/products/:id` | Update product details | `curl -X PATCH -H "Content-Type: application/json" -d '{"price":49.99}' http://localhost:3000/products/123e4567-e89b-12d3-a456-426614174000` |
| `DELETE` | `/products/:id` | Soft-archive a product | `curl -X DELETE http://localhost:3000/products/123e4567-e89b-12d3-a456-426614174000` |
| `DELETE` | `/products/:id/restore` | Restore an archived product | `curl -X DELETE http://localhost:3000/products/123e4567-e89b-12d3-a456-426614174000/restore` |

## Query Parameters for `GET /products`

| Parameter | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `category` | `string` | Filter by product category | `category=electronics` |
| `status` | `string` | Filter by status (e.g., active) | `status=active` |
| `minPrice` | `number` | Minimum price filter | `minPrice=10.00` |
| `maxPrice` | `number` | Maximum price filter | `maxPrice=100.00` |
| `inStock` | `boolean` | Filter by stock availability | `inStock=true` |
| `search` | `string` | Search in name or description | `search=mouse` |

## Product Schema

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique UUID (generated automatically) |
| `name` | `string` | Yes | Name of the product |
| `sku` | `string` | Yes | Unique Stock Keeping Unit |
| `description` | `string` | No | Detailed product description |
| `category` | `string` | No | Category group (default: 'other') |
| `price` | `number` | Yes | Product price (rounded to 2 decimals) |
| `stock` | `number` | Yes | Current inventory count |
| `status` | `string` | No | Product status (default: 'active') |
| `createdAt` | `date` | No | Timestamp of creation |
| `archivedAt` | `date` | No | Timestamp of soft-deletion (null if active) |

## Project Structure

```text
project-management-api/
├── src/
│   ├── controllers/     # Request handlers
│   │   └── productController.js
│   ├── middleware/       # Express middleware (error handling, async wrappers)
│   │   ├── catchAsync.js
│   │   └── errorHandler.js
│   ├── models/          # Data layer and business logic
│   │   └── product.js
│   ├── routes/           # API route definitions
│   │   └── products.js
│   ├── validators/      # Input validation logic
│   │   └── productValidator.js
│   ├── app.js           # Express application configuration
│   └── index.js         # Server entry point
├── package.json
└── README.md
```

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | Port number the server listens on |
| `NODE_ENV` | `development` | Environment mode (development, production, test) |

## Contributing

Contributions are welcome! Please ensure your code follows the project's naming conventions and include comprehensive tests for any new functionality or bug fixes. Submit a pull request for review.

## License

This project is licensed under the MIT License.
