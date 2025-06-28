import { supabase } from '../config/database.js';

export class User {
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