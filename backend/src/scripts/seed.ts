import { connectDatabase } from '../config/database';
import User from '../models/User';
import Transaction from '../models/Transaction';

async function seedDatabase() {
  try {
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users (password will be hashed by the User model's pre-save hook)
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123'
      },
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123'
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123'
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password: 'password123'
      }
    ]);

    console.log('👥 Created users:', users.length);

    // Check if users were created successfully
    if (!users || users.length < 4) {
      throw new Error('Failed to create users');
    }

    // Create transactions
    const transactions = await Transaction.create([
      {
        date: new Date('2024-01-15T08:34:12Z'),
        amount: 1500.00,
        category: 'Revenue',
        status: 'Paid',
        userId: users[0]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Product sales revenue'
      },
      {
        date: new Date('2024-02-21T11:14:38Z'),
        amount: 1200.50,
        category: 'Expense',
        status: 'Paid',
        userId: users[1]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Office supplies purchase'
      },
      {
        date: new Date('2024-03-03T18:22:04Z'),
        amount: 300.75,
        category: 'Revenue',
        status: 'Pending',
        userId: users[2]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Consulting services'
      },
      {
        date: new Date('2024-04-10T05:03:11Z'),
        amount: 5000.00,
        category: 'Expense',
        status: 'Paid',
        userId: users[3]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Equipment purchase'
      },
      {
        date: new Date('2024-05-20T12:01:45Z'),
        amount: 800.00,
        category: 'Revenue',
        status: 'Pending',
        userId: users[0]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Service fees'
      },
      {
        date: new Date('2024-06-12T03:13:09Z'),
        amount: 2200.25,
        category: 'Expense',
        status: 'Paid',
        userId: users[1]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Marketing campaign'
      },
      {
        date: new Date('2024-07-14T09:45:33Z'),
        amount: 900.00,
        category: 'Revenue',
        status: 'Pending',
        userId: users[2]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'License fees'
      },
      {
        date: new Date('2024-08-05T17:30:23Z'),
        amount: 150.00,
        category: 'Expense',
        status: 'Paid',
        userId: users[3]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Utility bills'
      },
      {
        date: new Date('2024-09-10T02:10:59Z'),
        amount: 650.00,
        category: 'Revenue',
        status: 'Paid',
        userId: users[0]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Subscription revenue'
      },
      {
        date: new Date('2024-10-30T14:55:12Z'),
        amount: 1200.00,
        category: 'Expense',
        status: 'Pending',
        userId: users[1]!._id,
        userProfile: 'https://thispersondoesnotexist.com/',
        description: 'Software licenses'
      }
    ]);

    console.log('💰 Created transactions:', transactions.length);
    console.log('✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase(); 