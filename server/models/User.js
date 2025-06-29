import { supabase } from '../config/database.js';
import bcrypt from 'bcryptjs';

export default class User {
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { email, password, role = 'user' } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email,
          password: hashedPassword,
          role
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const updateData = { ...userData };
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = data;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Remove passwords from response
      const usersWithoutPasswords = data.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return { 
        users: usersWithoutPasswords, 
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  static async updateFailedLoginAttempts(id, attempts) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          failed_login_attempts: attempts,
          locked_until: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating failed login attempts:', error);
      throw error;
    }
  }

  static async setResetToken(email, token, expiry) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          reset_password_token: token,
          reset_token_expiry: expiry
        })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error setting reset token:', error);
      throw error;
    }
  }

  static async findByResetToken(token) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('reset_password_token', token)
        .gt('reset_token_expiry', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  static async clearResetToken(id) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          reset_password_token: null,
          reset_token_expiry: null
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error clearing reset token:', error);
      throw error;
    }
  }

  static async isAccountLocked(email) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return false;

      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  }

  static async incrementFailedAttempts(email) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return;

      const newAttempts = (user.failed_login_attempts || 0) + 1;
      await this.updateFailedLoginAttempts(user.id, newAttempts);
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
    }
  }

  static async resetFailedAttempts(email) {
    try {
      const user = await this.findByEmail(email);
      if (!user) return;

      await this.updateFailedLoginAttempts(user.id, 0);
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  static async generateResetToken(email) {
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await this.setResetToken(email, token, expiry.toISOString());
      return token;
    } catch (error) {
      console.error('Error generating reset token:', error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const user = await this.findByResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      const { error } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          reset_password_token: null,
          reset_token_expiry: null,
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  static formatUser(user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}