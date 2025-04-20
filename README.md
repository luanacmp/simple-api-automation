# Simple API Automation

This project is an automated test suite for a Node.js-based RESTful API built with Express and SQLite. It includes a user registration and login flow, as well as CRUD operations for movie data.

## 📌 Stack

- **Node.js / Express**
- **SQLite** (as the database)
- **Jest** (test runner)
- **Supertest** (HTTP assertions)
- **Swagger** (API documentation)

## ✅ Features

- User registration and login with JWT authentication.
- Movie creation, update (PUT and PATCH), retrieval, and deletion.
- Automated tests with unit and integration coverage.
- Seed script to populate the database.
- Code coverage reports.

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the application

```bash
node app.js
```

The server will run at `http://localhost:3000`.

### 3. View API Documentation

Swagger is available at:

```
http://localhost:3000/api-docs
```

### 4. Seed the database

Run the seed script to register a user and add movie data:

```bash
node scripts/seed.js
```

### 5. Run tests

```bash
npm test
```

### 6. Generate coverage report

```bash
npx jest --coverage
```

## 📁 Project Structure

```
├── models/              # Business logic for users and movies
├── tests/               # Unit and integration tests
├── scripts/             # Seed file to populate the DB
├── db.js                # Database connection and setup
├── app.js               # Express app and API routes
```

## 🧪 Test Strategy

- **Unit tests**: Validates isolated functions (models).
- **Integration tests**: Validates complete API behavior using the database and HTTP requests.
- **Coverage tracking**: Ensures functions, branches, and lines are properly tested.

## ✍️ Author

Developed by [Luana CMP](https://github.com/luanacmp)