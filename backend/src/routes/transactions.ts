import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db/init';
import { Transaction, TransactionFilters, TransactionCreateRequest, TransactionUpdateRequest, PaginatedResponse } from '../types';

const router = Router();

// Apply authentication to all transaction routes
router.use(authenticateToken);

// Get all transactions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString(),
  query('category').optional().isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  query('status').optional().isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  query('user').optional().isString(),
  query('dateFrom').optional().isISO8601().withMessage('dateFrom must be a valid date'),
  query('dateTo').optional().isISO8601().withMessage('dateTo must be a valid date'),
  query('amountFrom').optional().isFloat({ min: 0 }).withMessage('amountFrom must be a positive number'),
  query('amountTo').optional().isFloat({ min: 0 }).withMessage('amountTo must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const filters: TransactionFilters = req.query;
    const page = parseInt(filters.page as string) || 1;
    const limit = parseInt(filters.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions: string[] = [];
    let params: any[] = [];

    if (filters.search) {
      whereConditions.push('(description LIKE ? OR user_id LIKE ? OR CAST(amount AS TEXT) LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      whereConditions.push('category = ?');
      params.push(filters.category);
    }

    if (filters.status) {
      whereConditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.user) {
      whereConditions.push('user_id = ?');
      params.push(filters.user);
    }

    if (filters.dateFrom) {
      whereConditions.push('date >= ?');
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      whereConditions.push('date <= ?');
      params.push(filters.dateTo);
    }

    if (filters.amountFrom !== undefined) {
      whereConditions.push('amount >= ?');
      params.push(filters.amountFrom);
    }

    if (filters.amountTo !== undefined) {
      whereConditions.push('amount <= ?');
      params.push(filters.amountTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await new Promise<number>((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
        params,
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });

    // Get paginated results
    const transactions = await new Promise<Transaction[]>((resolve, reject) => {
      db.all(
        `SELECT * FROM transactions ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as Transaction[]);
        }
      );
    });

    const totalPages = Math.ceil(countResult / limit);

    const response: PaginatedResponse<Transaction> = {
      data: transactions,
      pagination: {
        page,
        limit,
        total: countResult,
        totalPages
      }
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get single transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await new Promise<Transaction>((resolve, reject) => {
      db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row as Transaction);
        }
      );
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new transaction
router.post('/', [
  body('date').isISO8601().withMessage('Date must be a valid ISO date'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  body('status').isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const transactionData: TransactionCreateRequest = req.body;
    const userId = req.user!.userId;

    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        `INSERT INTO transactions (date, amount, category, status, user_id, user_profile, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionData.date,
          transactionData.amount,
          transactionData.category,
          transactionData.status,
          userId,
          'https://thispersondoesnotexist.com/',
          transactionData.description
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    // Get the created transaction
    const newTransaction = await new Promise<Transaction>((resolve, reject) => {
      db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [result.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row as Transaction);
        }
      );
    });

    res.status(201).json({
      success: true,
      data: newTransaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update transaction
router.put('/:id', [
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  body('status').optional().isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData: TransactionUpdateRequest = req.body;

    // Check if transaction exists
    const existingTransaction = await new Promise<Transaction>((resolve, reject) => {
      db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row as Transaction);
        }
      );
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updateData.date !== undefined) {
      updateFields.push('date = ?');
      params.push(updateData.date);
    }

    if (updateData.amount !== undefined) {
      updateFields.push('amount = ?');
      params.push(updateData.amount);
    }

    if (updateData.category !== undefined) {
      updateFields.push('category = ?');
      params.push(updateData.category);
    }

    if (updateData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(updateData.status);
    }

    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      params.push(updateData.description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated transaction
    const updatedTransaction = await new Promise<Transaction>((resolve, reject) => {
      db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row as Transaction);
        }
      );
    });

    res.json({
      success: true,
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const existingTransaction = await new Promise<Transaction>((resolve, reject) => {
      db.get(
        'SELECT * FROM transactions WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row as Transaction);
        }
      );
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    await new Promise<void>((resolve, reject) => {
      db.run(
        'DELETE FROM transactions WHERE id = ?',
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as transactionRoutes }; 