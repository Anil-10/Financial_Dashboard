import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = process.env['DB_PATH'] || './data/financial_dashboard.db';

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath);

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
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
        )
      `);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
      db.run('CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)');
      db.run('CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)');
      db.run('CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)');

      // Seed initial data
      seedInitialData()
        .then(() => {
          console.log('Database tables created and seeded successfully');
          resolve();
        })
        .catch(reject);
    });
  });
}

async function seedInitialData(): Promise<void> {
  // Check if users already exist
  const userCount = await new Promise<number>((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  if (userCount === 0) {
    // Create default users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { id: 'user_001', username: 'admin', password: hashedPassword, email: 'admin@example.com' },
      { id: 'user_002', username: 'user1', password: hashedPassword, email: 'user1@example.com' },
      { id: 'user_003', username: 'user2', password: hashedPassword, email: 'user2@example.com' },
      { id: 'user_004', username: 'user3', password: hashedPassword, email: 'user3@example.com' }
    ];

    for (const user of users) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
          [user.id, user.username, user.password, user.email],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Seed transactions data
    const transactionsData = [
      { date: '2024-01-15T08:34:12Z', amount: 1500.00, category: 'Revenue', status: 'Paid', user_id: 'user_001', user_profile: 'https://thispersondoesnotexist.com/', description: 'Product sales revenue' },
      { date: '2024-02-21T11:14:38Z', amount: 1200.50, category: 'Expense', status: 'Paid', user_id: 'user_002', user_profile: 'https://thispersondoesnotexist.com/', description: 'Office supplies purchase' },
      { date: '2024-03-03T18:22:04Z', amount: 300.75, category: 'Revenue', status: 'Pending', user_id: 'user_003', user_profile: 'https://thispersondoesnotexist.com/', description: 'Consulting services' },
      { date: '2024-04-10T05:03:11Z', amount: 5000.00, category: 'Expense', status: 'Paid', user_id: 'user_004', user_profile: 'https://thispersondoesnotexist.com/', description: 'Equipment purchase' },
      { date: '2024-05-20T12:01:45Z', amount: 800.00, category: 'Revenue', status: 'Pending', user_id: 'user_001', user_profile: 'https://thispersondoesnotexist.com/', description: 'Service fees' },
      { date: '2024-06-12T03:13:09Z', amount: 2200.25, category: 'Expense', status: 'Paid', user_id: 'user_002', user_profile: 'https://thispersondoesnotexist.com/', description: 'Marketing campaign' },
      { date: '2024-07-14T09:45:33Z', amount: 900.00, category: 'Revenue', status: 'Pending', user_id: 'user_003', user_profile: 'https://thispersondoesnotexist.com/', description: 'License fees' },
      { date: '2024-08-05T17:30:23Z', amount: 150.00, category: 'Expense', status: 'Paid', user_id: 'user_004', user_profile: 'https://thispersondoesnotexist.com/', description: 'Utility bills' },
      { date: '2024-09-10T02:10:59Z', amount: 650.00, category: 'Revenue', status: 'Paid', user_id: 'user_001', user_profile: 'https://thispersondoesnotexist.com/', description: 'Subscription revenue' },
      { date: '2024-10-30T14:55:12Z', amount: 1200.00, category: 'Expense', status: 'Pending', user_id: 'user_002', user_profile: 'https://thispersondoesnotexist.com/', description: 'Software licenses' }
    ];

    for (const transaction of transactionsData) {
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO transactions (date, amount, category, status, user_id, user_profile, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transaction.date, transaction.amount, transaction.category, transaction.status, transaction.user_id, transaction.user_profile, transaction.description],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('Initial data seeded successfully');
  }
} 