import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import Transaction from '../models/Transaction';

const router = Router();

// Apply authentication to all transaction routes
router.use(authenticateToken);

// Custom date validation function with better error handling
const validateDate = (value: any) => {
  if (!value) {
    throw new Error('Date is required');
  }
  
  // Convert to string if it's not already
  const dateString = String(value).trim();
  
  if (!dateString) {
    throw new Error('Date cannot be empty');
  }
  
  // Try different date formats
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: "${dateString}". Please use ISO format (2024-12-29), full ISO (2024-12-29T10:30:00.000Z), or timestamp (2024-12-29 10:30:00)`);
  }
  
  return true;
};

// Get all transactions with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString(),
  query('category').optional().isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  query('status').optional().isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  query('dateFrom').optional().custom(validateDate).withMessage('dateFrom must be a valid date'),
  query('dateTo').optional().custom(validateDate).withMessage('dateTo must be a valid date'),
  query('amountFrom').optional().isFloat({ min: 0 }).withMessage('amountFrom must be a positive number'),
  query('amountTo').optional().isFloat({ min: 0 }).withMessage('amountTo must be a positive number')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = (req as any).user.userId;
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = { userId };

    if (req.query['search']) {
      filter.$or = [
        { description: { $regex: req.query['search'], $options: 'i' } },
        { amount: { $regex: req.query['search'], $options: 'i' } }
      ];
    }

    if (req.query['category']) {
      filter.category = req.query['category'];
    }

    if (req.query['status']) {
      filter.status = req.query['status'];
    }

    if (req.query['dateFrom'] || req.query['dateTo']) {
      filter.date = {};
      if (req.query['dateFrom']) filter.date.$gte = new Date(req.query['dateFrom'] as string);
      if (req.query['dateTo']) filter.date.$lte = new Date(req.query['dateTo'] as string);
    }

    if (req.query['amountFrom'] || req.query['amountTo']) {
      filter.amount = {};
      if (req.query['amountFrom']) filter.amount.$gte = parseFloat(req.query['amountFrom'] as string);
      if (req.query['amountTo']) filter.amount.$lte = parseFloat(req.query['amountTo'] as string);
    }

    // Get total count
    const total = await Transaction.countDocuments(filter);

    // Get paginated results
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email');

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page,
        limit,
        totalPages
      }
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
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const transaction = await Transaction.findOne({ _id: id, userId })
      .populate('userId', 'username email');

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
  body('date').custom(validateDate).withMessage('Date must be a valid date (ISO format, YYYY-MM-DD, or timestamp)'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  body('status').isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  body('description').notEmpty().withMessage('Description is required')
], async (req: Request, res: Response) => {
  try {
    // Log the incoming request for debugging
    console.log('Creating transaction with data:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = (req as any).user.userId;
    const transactionData = req.body;

    // Convert date to proper format
    const date = new Date(transactionData.date);
    console.log('Converted date:', date.toISOString());

    const newTransaction = new Transaction({
      ...transactionData,
      date,
      userId,
      userProfile: 'https://thispersondoesnotexist.com/'
    });

    await newTransaction.save();
    await newTransaction.populate('userId', 'username email');

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
  body('date').optional().custom(validateDate).withMessage('Date must be a valid date (ISO format, YYYY-MM-DD, or timestamp)'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn(['Revenue', 'Expense']).withMessage('Category must be Revenue or Expense'),
  body('status').optional().isIn(['Paid', 'Pending']).withMessage('Status must be Paid or Pending'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req: Request, res: Response) => {
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
    const userId = (req as any).user.userId;
    const updateData = req.body;

    // Convert date if provided
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email');

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
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete transaction
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

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