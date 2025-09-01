import { supabase } from '../config/database.js';

export class Locker {
  static async findAll(limit = 50, offset = 0, search = '') {
    try {
      let query = supabase
        .from('armarios')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`numero.ilike.%${search}%,localizacao.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('numero', { ascending: true });

      if (error) {
        throw error;
      }

      return { armarios: data, total: count };
    } catch (error) {
      console.error('Error finding all armarios:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding armario by ID:', error);
      throw error;
    }
  }

  static async findByNumero(numero) {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .select('*')
        .eq('numero', numero)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding armario by numero:', error);
      throw error;
    }
  }

  static async create(armarioData) {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .insert([armarioData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating armario:', error);
      throw error;
    }
  }

  static async update(id, armarioData) {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .update(armarioData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating armario:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('armarios')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting armario:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data: totalArmarios, error: totalError } = await supabase
        .from('armarios')
        .select('id', { count: 'exact' });

      if (totalError) {
        throw totalError;
      }

      const { data: disponiveis, error: disponiveisError } = await supabase
        .from('armarios')
        .select('id', { count: 'exact' })
        .eq('status', 'disponível');

      if (disponiveisError) {
        throw disponiveisError;
      }

      const { data: alugados, error: alugadosError } = await supabase
        .from('armarios')
        .select('id', { count: 'exact' })
        .eq('status', 'alugado');

      if (alugadosError) {
        throw alugadosError;
      }

      const { data: manutencao, error: manutencaoError } = await supabase
        .from('armarios')
        .select('id', { count: 'exact' })
        .eq('status', 'manutenção');

      if (manutencaoError) {
        throw manutencaoError;
      }

      return {
        total: totalArmarios.length,
        disponivel: disponiveis.length,
        alugado: alugados.length,
        manutencao: manutencao.length
      };
    } catch (error) {
      console.error('Error getting armario stats:', error);
      throw error;
    }
  }

  static async findDisponiveis() {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .select('*')
        .eq('status', 'disponível')
        .order('numero', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding available armarios:', error);
      throw error;
    }
  }

  static async findByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('armarios')
        .select('*')
        .eq('status', status)
        .order('numero', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding armarios by status:', error);
      throw error;
    }
  }
}