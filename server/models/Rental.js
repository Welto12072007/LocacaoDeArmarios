// server/models/rentals.js
import { supabase } from '../config/database.js';

const toDb = (r = {}) => {
  const map = {
    student_id: r.studentId,
    locker_id: r.lockerId,
    start_date: r.startDate,
    end_date: r.endDate,
    monthly_price: r.monthlyPrice,
    total_amount: r.totalAmount,
    status: r.status,
    payment_status: r.paymentStatus,
    notes: r.notes,
  };
  const out = {};
  for (const [k, v] of Object.entries(map)) {
    if (v !== undefined) out[k] = v; // não envia undefined no update
  }
  return out;
};

const baseSelect = `
  *,
  student:student_id (
    id,
    name,
    email,
    student_id
  ),
  locker:locker_id (
    id,
    numero,
    localizacao
  )
`;

export class Rental {
  static async findAll(limit = 50, offset = 0, search = '') {
    try {
      let query = supabase.from('rentals').select(baseSelect, { count: 'exact' });

      if (search) {
        query = query.or(`notes.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { rentals: data, total: count || 0 };
    } catch (error) {
      console.error('Error finding all rentals:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(baseSelect)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error finding rental by ID:', error);
      throw error;
    }
  }

  static async create(rentalData) {
    try {
      const payload = toDb(rentalData);
      const { data, error } = await supabase
        .from('rentals')
        .insert([payload])
        .select(baseSelect)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating rental:', error);
      throw error;
    }
  }

  static async update(id, rentalData) {
    try {
      const payload = toDb(rentalData);
      const { data, error } = await supabase
        .from('rentals')
        .update(payload)
        .eq('id', id)
        .select(baseSelect)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating rental:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase.from('rentals').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting rental:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const { data: totalRentals, error: totalError } = await supabase
        .from('rentals')
        .select('id', { count: 'exact' });
      if (totalError) throw totalError;

      const { data: activeRentals, error: activeError } = await supabase
        .from('rentals')
        .select('id', { count: 'exact' })
        .eq('status', 'active');
      if (activeError) throw activeError;

      const { data: overdueRentals, error: overdueError } = await supabase
        .from('rentals')
        .select('id', { count: 'exact' })
        .eq('status', 'overdue');
      if (overdueError) throw overdueError;

      const { data: completedRentals, error: completedError } = await supabase
        .from('rentals')
        .select('id', { count: 'exact' })
        .eq('status', 'completed');
      if (completedError) throw completedError;

      const { data: revenueData, error: revenueError } = await supabase
        .from('rentals')
        .select('total_amount')
        .eq('payment_status', 'paid');
      if (revenueError) throw revenueError;

      const totalRevenue = (revenueData || []).reduce(
        (sum, r) => sum + parseFloat(r.total_amount || 0),
        0
      );

      return {
        total: totalRentals?.length || 0,
        active: activeRentals?.length || 0,
        overdue: overdueRentals?.length || 0,
        completed: completedRentals?.length || 0,
        revenue: totalRevenue,
      };
    } catch (error) {
      console.error('Error getting rental stats:', error);
      throw error;
    }
  }

  static async findByStudentId(studentId) {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(baseSelect)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding rentals by student ID:', error);
      throw error;
    }
  }

  static async findByLockerId(lockerId) {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(baseSelect)
        .eq('locker_id', lockerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding rentals by locker ID:', error);
      throw error;
    }
  }
}
