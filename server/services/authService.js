import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendResetPasswordEmail } from './emailService.js';

class AuthService {
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async login(email, password) {
    console.log('🔐 Login attempt for:', email);

    // Check if account is locked
    if (await User.isAccountLocked(email)) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      await User.incrementFailedAttempts(email);
      throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await User.resetFailedAttempts(email);

    const tokens = this.generateTokens(user.id);
    const userResponse = User.formatUser(user);

    console.log('✅ Login successful for:', email);

    return {
      user: userResponse,
      ...tokens
    };
  }

  static async register(userData) {
    const { email, password } = userData;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user.id);

    return {
      user,
      ...tokens
    };
  }

  static async refreshTokens(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.generateTokens(user.id);
  }

  static async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = await User.generateResetToken(email);
    
    // Send reset email
    await sendResetPasswordEmail(email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  static async resetPassword(token, newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const user = await User.resetPassword(token, newPassword);
    return user;
  }

  static async validateResetToken(token) {
    const user = await User.findByResetToken(token);
    return !!user;
  }
}

export default AuthService;