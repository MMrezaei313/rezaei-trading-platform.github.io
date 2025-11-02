import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '../models/user.model.js'
import { AppError } from '../utils/AppError.js'

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Register new user
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        throw new AppError('کاربر با این ایمیل قبلاً ثبت‌نام کرده است', 400)
      }

      // Create new user
      const user = new User({
        name,
        email,
        password
      })

      await user.save()

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      res.status(201).json({
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      // Check if user exists
      const user = await User.findOne({ email }).select('+password')
      if (!user) {
        throw new AppError('ایمیل یا رمز عبور اشتباه است', 401)
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new AppError('ایمیل یا رمز عبور اشتباه است', 401)
      }

      // Update last login
      user.lastLogin = new Date()
      await user.save()

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      res.json({
        success: true,
        message: 'ورود موفقیت‌آمیز بود',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.userId)
      
      if (!user) {
        throw new AppError('کاربر یافت نشد', 404)
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body
      const userId = req.user.userId

      const user = await User.findById(userId)
      
      if (!user) {
        throw new AppError('کاربر یافت نشد', 404)
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          throw new AppError('این ایمیل قبلاً استفاده شده است', 400)
        }
        user.email = email
      }

      if (name) {
        user.name = name
      }

      await user.save()

      res.json({
        success: true,
        message: 'پروفایل با موفقیت بروزرسانی شد',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user.userId

      const user = await User.findById(userId).select('+password')
      
      if (!user) {
        throw new AppError('کاربر یافت نشد', 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        throw new AppError('رمز عبور فعلی اشتباه است', 401)
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر کرد'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token. We can add token blacklisting here if needed.
      
      res.json({
        success: true,
        message: 'خروج موفقیت‌آمیز بود'
      })

    } catch (error) {
      next(error)
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res, next) {
    try {
      const userId = req.user.userId
      
      const user = await User.findById(userId)
      if (!user) {
        throw new AppError('کاربر یافت نشد', 404)
      }

      // Generate new token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      )

      res.json({
        success: true,
        token
      })

    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
