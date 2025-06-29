import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import Transaction from '../models/Transaction';

const router = Router();

// Apply authentication to all dashboard routes
router.use(authenticateToken);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Get all transactions for the user
    const transactions = await Transaction.find({ userId });

    // Calculate statistics
    const totalRevenue = transactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.category === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalRevenue - totalExpenses;

    const pendingAmount = transactions
      .filter(t => t.status === 'Pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const paidAmount = transactions
      .filter(t => t.status === 'Paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionCount = transactions.length;

    // Get monthly data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$category', 'Revenue'] },
                '$amount',
                0
              ]
            }
          },
          expenses: {
            $sum: {
              $cond: [
                { $eq: ['$category', 'Expense'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly data
    const formattedMonthlyData = monthlyData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue,
      expenses: item.expenses
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netIncome,
        pendingAmount,
        paidAmount,
        transactionCount,
        monthlyData: formattedMonthlyData
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/dashboard/recent-transactions - Get recent transactions
router.get('/recent-transactions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query['limit'] as string) || 5;

    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('userId', 'username email');

    res.json({
      success: true,
      data: recentTransactions
    });

  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/dashboard/category-breakdown - Get category breakdown
router.get('/category-breakdown', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: categoryBreakdown
    });

  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as dashboardRoutes }; 