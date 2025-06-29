import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db/init';
import { UserResponse } from '../types';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const user = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
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

    const userId = req.user!.userId;
    const { email, username } = req.body;

    // Check if username is already taken (if updating username)
    if (username) {
      const existingUser = await new Promise<any>((resolve, reject) => {
        db.get(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const params: any[] = [];

    if (email !== undefined) {
      updateFields.push('email = ?');
      params.push(email);
    }

    if (username !== undefined) {
      updateFields.push('username = ?');
      params.push(username);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(userId);

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated user
    const updatedUser = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const userResponse: UserResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };

    res.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all users (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const users = await new Promise<any[]>((resolve, reject) => {
      db.all(
        'SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const userResponses: UserResponse[] = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    res.json({
      success: true,
      data: userResponses
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as userRoutes }; 