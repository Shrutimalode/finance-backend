# Finance Manager API

## Project Overview
The Finance Manager API provides a complete RESTful backend solution for managing personal or administrative financial records. It facilitates user authentication, detailed logging of income and expenses, retrieving dashboard summaries with metric aggregations, and robust system configurations like pagination, input validation, soft-delete mechanisms, and centralized error handling.

## Tech Stack Used
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB with Mongoose ORM
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs
* **Documentation**: Swagger UI (`swagger-ui-express`)
* **Security & Reliability**: `express-rate-limit`, central error interceptor

## Folder Structure Explanation
```text
finance/
├── config/           # Database and application configuration modules
├── controllers/      # Core logic handling incoming requests and crafting final responses
├── middleware/       # Custom interceptors (e.g. auth validation, error catchers, rate limiters)
├── models/           # Mongoose schemas representing database collections (Users, FinancialRecords)
├── routes/           # Endpoint mapping connecting URLs to corresponding controller methods
├── utils/            # Useful modular classes (e.g. customized ErrorResponse)
├── swagger.json      # Swagger OpenAPI 3.0 descriptor
└── server.js         # Express app entry point binding middlewares & booting the server
```

## API Endpoints

### Authentication
* **`POST /api/auth/register`** - Registers a new user. Expects `name`, `email`, and `password`.
* **`POST /api/auth/login`** - Authenticates an existing user returning a signed JWT token.

### Financial Records
* **`GET /api/records`** - Retrieves financial records. Supports pagination (`?page=1&limit=10`), searching (`?search=`), and filters (`?type=income`, `?startDate=X`).
* **`POST /api/records`** - Creates a newly validated financial record.
* **`PUT /api/records/:id`** - Modifies details of a specific financial record.
* **`DELETE /api/records/:id`** - Executes a soft-delete removing the record from general view.

### Dashboard
* **`GET /api/dashboard/summary`** - Generates analytical breakdowns of expenses, monthly trends, overall balancing, and recent transactional flows.

> Note: All API endpoints can be visually tested and explored via the Swagger UI available at `http://localhost:5000/api-docs`

## Role-based Access
The API integrates a stringent role-handling approach mapping users to designated scopes securely via token decoding:
* **Viewer**: Basic authorization class. Allowed basic visibility fetching resources.
* **Analyst**: Empowered to access standard records and specialized analytical endpoints like the dashboard natively.
* **Admin**: Complete system-wide authority handling creations, rectifications (`PUT`), deletion logic, alongside generic reads securely.

## Assumptions Made
* **Soft Deletes**: Record persistence assumes an overarching soft-delete philosophy. `DELETE /api/records/:id` will mask the timestamp instead of terminating the database node completely. 
* **Global Rate Limiting**: Limiters default at 100 API queries per 15 minutes mapping directly to the host IP seamlessly mitigating brute forces globally.
* **Pagination Constraints**: All records lists default to `page=1` & `limit=10` natively unless overridden by the sender payload specifically.

## Setup Instructions
Follow these steps to manually boot the system locally.

1. Ensure Node.js and MongoDB instances are ready.
2. Clone or open this repository in your preferred code editor.
3. Install package dependencies:
   ```bash
   npm install
   ```
4. Configure required Environment variables creating a `.env` root file (see below).
5. Start up the backend server:
   ```bash
   npm start
   ```
   *(or `node server.js` internally)*
6. Browse your API documentation via `http://localhost:5000/api-docs` seamlessly.

## Environment Variables
The root level implies a `.env` file containing fundamental values natively mapping environments over hardcodes elegantly:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db # or MongoDB Atlas URI seamlessly
JWT_SECRET=your_jwt_secret_signature_here
```
