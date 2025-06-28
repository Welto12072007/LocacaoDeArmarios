import { supabase } from '../config/database.js';

export class Locker {
  static async findAll(limit = 50, offset = 0, search = '') {
    try {
      let query = supabase
        .from('lockers')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`number.ilike.%${search}%,location.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('number', { ascending: true });

      if (error) {
        throw error;
      }

      return { lockers: data, total: count };
    } catch (error) {
      console.error('Error finding all lockers:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('lockers')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding locker by ID:', error);
      throw error;
    }
  }

  static async findByNumber(number) {
    try {
      const { data, error } = await supabase
        .from('lockers')
        .select('*')
        .eq('number', number)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding locker by number:', error);
      throw error;
    }
  }

  static async create(lockerData) {
    try {
      const { data, error } = await supabase
        .from('lockers')
        .insert([lockerData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating locker:', error);
      throw error;
    }
  }

  static async update(id, lockerData) {
    try {
      const { data, error } = await supabase
        .from('lockers')
        .update(lockerData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating locker:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('lockers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting locker:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data: totalLockers, error: totalError } = await supabase
        .from('lockers')
        .select('id', { count: 'exact' });

      if (totalError) {
        throw totalError;
      }

      const { data: availableLockers, error: availableError } = await supabase
        .from('lockers')
        .select('id', { count: 'exact' })
        .eq('status', 'available');

      if (availableError) {
        throw availableError;
      }

      const { data: rentedLockers, error: rentedError } = await supabase
        .from('lockers')
        .select('id', { count: 'exact' })
        .eq('status', 'rented');

      if (rentedError) {
        throw rentedError;
      }

      const { data: maintenanceLockers, error: maintenanceError } = await supabase
        .from('lockers')
        .select('id', { count: 'exact' })
        .eq('status', 'maintenance');

      if (maintenanceError) {
        throw maintenanceError;
      }

      return {
        total: totalLockers.length,
        available: availableLockers.length,
        rented: rentedLockers.length,
        maintenance: maintenanceLockers.length
      };
    } catch (error) {
      console.error('Error getting locker stats:', error);
      throw error;
    }
  }

  static async findAvailable() {
    try {
      const { data, error } = await supabase
        .from('lockers')
        .select('*')
        .eq('status', 'available')
        .order('number', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding available lockers:', error);
      throw error;
    }
  }
}