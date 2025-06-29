import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// GET /api/users/profile - Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { username, email } = req.body;

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/users/profile - Delete user account
router.delete('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });

  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export { router as userRoutes }; 