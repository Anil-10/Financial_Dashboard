import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../db/init';
import { AuthRequest, AuthResponse, UserResponse } from '../types';

const router = Router();

// Login route
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, password }: AuthRequest = req.body;

    // Find user by username
    const user = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username 
      },
      secret,
      { expiresIn }
    );

    // Prepare user response (without password)
    const userResponse: UserResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    const response: AuthResponse = {
      user: userResponse,
      token
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Register route
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
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

    const { username, password, email } = req.body;

    // Check if user already exists
    const existingUser = await new Promise<any>((resolve, reject) => {
      db.get(
        'SELECT id FROM users WHERE username = ?',
        [username],
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user_${Date.now()}`;

    // Insert new user
    await new Promise<void>((resolve, reject) => {
      db.run(
        'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
        [userId, username, hashedPassword, email],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const token = jwt.sign(
      { 
        userId, 
        username 
      },
      secret,
      { expiresIn }
    );

    // Prepare user response
    const userResponse: UserResponse = {
      id: userId,
      username,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response: AuthResponse = {
      user: userResponse,
      token
    };

    res.status(201).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as authRoutes }; 