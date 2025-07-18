import AuthService from '../services/authService.js';
import { User } from '../models/User.js';
import { sendWelcomeEmail } from '../services/emailService.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('📝 Registration attempt:', { name, email, role });

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 8 caracteres'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    const result = await AuthService.register({ name, email, password, role });

    console.log('✅ User registered successfully:', result.user.email);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(console.error);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const result = await AuthService.login(email, password);

    console.log('✅ Login successful for:', email);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não encontrado'
      });
    }

    const result = await AuthService.refreshTokens(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Tokens atualizados com sucesso',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    console.error('❌ Refresh error:', error);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const result = await AuthService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token e nova senha são obrigatórios'
      });
    }

    const user = await AuthService.resetPassword(token, password);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso',
      data: { user }
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    const isValid = await AuthService.validateResetToken(token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido'
    });
  } catch (error) {
    console.error('❌ Validate reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual é obrigatória para alterar a senha'
        });
      }

      const user = await User.findByEmail(req.user.email);
      const isValidPassword = await User.validatePassword(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (newPassword) updateData.password = newPassword;

    const updatedUser = await User.update(userId, updateData);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};