import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db/init';
import { DashboardStats } from '../types';

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total revenue
    const totalRevenue = await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE category = "Revenue"',
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // Get total expenses
    const totalExpenses = await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE category = "Expense"',
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // Get pending amount
    const pendingAmount = await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = "Pending"',
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // Get paid amount
    const paidAmount = await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = "Paid"',
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });

    // Get total transaction count
    const transactionCount = await new Promise<number>((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM transactions',
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    // Get monthly data for the last 12 months
    const monthlyData = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN category = 'Revenue' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN category = 'Expense' THEN amount ELSE 0 END) as expenses
        FROM transactions 
        WHERE date >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
        LIMIT 12
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const stats: DashboardStats = {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingAmount,
      paidAmount,
      transactionCount,
      monthlyData: monthlyData.map(row => ({
        month: row.month,
        revenue: row.revenue,
        expenses: row.expenses
      }))
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get category breakdown
router.get('/categories', async (req, res) => {
  try {
    const categoryStats = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT 
          category,
          COUNT(*) as count,
          SUM(amount) as total,
          AVG(amount) as average
        FROM transactions 
        GROUP BY category
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: categoryStats
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get status breakdown
router.get('/status', async (req, res) => {
  try {
    const statusStats = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(amount) as total
        FROM transactions 
        GROUP BY status
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: statusStats
    });

  } catch (error) {
    console.error('Get status stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get recent transactions
router.get('/recent', async (req, res) => {
  try {
    const recentTransactions = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT * FROM transactions 
        ORDER BY date DESC 
        LIMIT 10
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: recentTransactions
    });

  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as dashboardRoutes }; 