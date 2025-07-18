import { supabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class User {
  static formatUser(user) {
    if (!user) return null;
    // Retorne apenas os campos que você quer expor para o frontend
    const { id, name, email, role, created_at, updated_at } = user;
    return { id, name, email, role, created_at, updated_at };
  }

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

  static async validatePassword(plainPassword, hashedPassword) {
    console.log('Comparando:', plainPassword, hashedPassword);
    return bcrypt.compare(plainPassword, hashedPassword);
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

  static async generateResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user) throw new Error('User not found');

    const resetToken = uuidv4();
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await this.setResetToken(email, resetToken, expiry.toISOString());
    return resetToken;
  }

  static async create(userData) {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
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

  static async findAll(limit = 50, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { users: data, total: count };
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
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

  static async incrementFailedAttempts(email) {
    // Busca o usuário pelo email
    const user = await this.findByEmail(email);
    if (!user) return;

    const attempts = (user.failed_login_attempts || 0) + 1;
    await this.updateFailedLoginAttempts(user.id, attempts);
  }

  static async resetFailedAttempts(email) {
    const user = await this.findByEmail(email);
    if (!user) return;
    await this.updateFailedLoginAttempts(user.id, 0);
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
}
