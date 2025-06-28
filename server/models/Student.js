import { supabase } from '../config/database.js';

export class Student {
  static async findAll(limit = 50, offset = 0, search = '') {
    try {
      let query = supabase
        .from('students')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,student_id.ilike.%${search}%,course.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { students: data, total: count };
    } catch (error) {
      console.error('Error finding all students:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding student by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding student by email:', error);
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding student by student ID:', error);
      throw error;
    }
  }

  static async create(studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  static async update(id, studentData) {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data: totalStudents, error: totalError } = await supabase
        .from('students')
        .select('id', { count: 'exact' });

      if (totalError) {
        throw totalError;
      }

      const { data: activeStudents, error: activeError } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      if (activeError) {
        throw activeError;
      }

      return {
        total: totalStudents.length,
        active: activeStudents.length,
        inactive: totalStudents.length - activeStudents.length
      };
    } catch (error) {
      console.error('Error getting student stats:', error);
      throw error;
    }
  }
}