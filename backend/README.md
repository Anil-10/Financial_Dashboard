# Financial Dashboard Backend

A Node.js/Express TypeScript backend API for the Financial Dashboard application.

## Features

- 🔐 JWT Authentication
- 💰 Transaction Management (CRUD)
- 📊 Dashboard Analytics
- 👤 User Management
- 🔍 Advanced Filtering & Search
- 📄 Pagination
- 🛡️ Security Middleware
- 📝 Input Validation
- 🗄️ SQLite Database

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key
   DB_PATH=./data/financial_dashboard.db
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` with hot-reloading enabled.

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_001",
      "username": "admin",
      "email": "admin@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@example.com"
}
```

### Transactions

#### GET `/api/transactions`
Get all transactions with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search in description, user_id, or amount
- `category` - Filter by category (Revenue/Expense)
- `status` - Filter by status (Paid/Pending)
- `user` - Filter by user ID
- `dateFrom` - Filter by start date (ISO format)
- `dateTo` - Filter by end date (ISO format)
- `amountFrom` - Filter by minimum amount
- `amountTo` - Filter by maximum amount

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### POST `/api/transactions`
Create a new transaction.

**Request:**
```json
{
  "date": "2024-01-15T08:34:12Z",
  "amount": 1500.00,
  "category": "Revenue",
  "status": "Paid",
  "description": "Product sales revenue"
}
```

#### PUT `/api/transactions/:id`
Update a transaction.

#### DELETE `/api/transactions/:id`
Delete a transaction.

### Dashboard

#### GET `/api/dashboard/stats`
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 50000.00,
    "totalExpenses": 30000.00,
    "netIncome": 20000.00,
    "pendingAmount": 5000.00,
    "paidAmount": 45000.00,
    "transactionCount": 150,
    "monthlyData": [
      {
        "month": "2024-01",
        "revenue": 5000.00,
        "expenses": 3000.00
      }
    ]
  }
}
```

#### GET `/api/dashboard/categories`
Get category breakdown statistics.

#### GET `/api/dashboard/status`
Get status breakdown statistics.

#### GET `/api/dashboard/recent`
Get recent transactions (last 10).

### Users

#### GET `/api/users/profile`
Get current user profile.

#### PUT `/api/users/profile`
Update current user profile.

#### GET `/api/users`
Get all users (admin only).

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT CHECK(category IN ('Revenue', 'Expense')) NOT NULL,
  status TEXT CHECK(status IN ('Paid', 'Pending')) NOT NULL,
  user_id TEXT NOT NULL,
  user_profile TEXT,
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Default Users

The database is seeded with these default users:

| Username | Password | Email |
|----------|----------|-------|
| admin | password123 | admin@example.com |
| user1 | password123 | user1@example.com |
| user2 | password123 | user2@example.com |
| user3 | password123 | user3@example.com |

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with express-validator
- SQL injection prevention with parameterized queries

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors (if applicable)
}
```

## Development

### Project Structure
```
src/
├── db/
│   └── init.ts          # Database initialization
├── middleware/
│   ├── auth.ts          # JWT authentication
│   └── errorHandler.ts  # Error handling
├── routes/
│   ├── auth.ts          # Authentication routes
│   ├── transactions.ts  # Transaction routes
│   ├── users.ts         # User routes
│   └── dashboard.ts     # Dashboard routes
├── types/
│   └── index.ts         # TypeScript definitions
└── index.ts             # Main application file
```

### Adding New Features

1. Define types in `src/types/index.ts`
2. Create database migrations if needed
3. Add routes in appropriate route file
4. Add validation using express-validator
5. Test with Postman or similar tool

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up a production database (PostgreSQL recommended)
5. Use PM2 or similar process manager
6. Set up reverse proxy (nginx)
7. Configure SSL/TLS certificates

## License

MIT 