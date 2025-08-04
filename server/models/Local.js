import { supabase } from '../config/database.js';

export class Local {
  static async findAll(limit = 10, offset = 0) {
    try {
      const { data, error, count } = await supabase
        .from('locais')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('nome', { ascending: true });

      if (error) throw error;

      return { locais: data, total: count };
    } catch (error) {
      console.error('Error fetching locais:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('locais')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Error fetching local by ID:', error);
      throw error;
    }
  }

  static async create(localData) {
    try {
      const { data, error } = await supabase
        .from('locais')
        .insert([localData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating local:', error);
      throw error;
    }
  }

  static async update(id, localData) {
    try {
      const { data, error } = await supabase
        .from('locais')
        .update(localData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating local:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('locais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting local:', error);
      throw error;
    }
  }
}
