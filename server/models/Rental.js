import { pool } from '../config/database.js';

class Rental {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT 
        r.*,
        l.number as locker_number,
        l.location as locker_location,
        l.size as locker_size,
        s.name as student_name,
        s.email as student_email,
        s.student_id as student_student_id
       FROM rentals r
       LEFT JOIN lockers l ON r.locker_id = l.id
       LEFT JOIN students s ON r.student_id = s.id
       ORDER BY r.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM rentals'
    );

    return {
      data: rows.map(this.formatRental),
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        r.*,
        l.number as locker_number,
        l.location as locker_location,
        l.size as locker_size,
        s.name as student_name,
        s.email as student_email,
        s.student_id as student_student_id
       FROM rentals r
       LEFT JOIN lockers l ON r.locker_id = l.id
       LEFT JOIN students s ON r.student_id = s.id
       WHERE r.id = ?`,
      [id]
    );

    return rows.length > 0 ? this.formatRental(rows[0]) : null;
  }

  static async create(rentalData) {
    const {
      lockerId,
      studentId,
      startDate,
      endDate,
      monthlyPrice,
      totalAmount,
      status = 'active',
      paymentStatus = 'pending',
      notes
    } = rentalData;

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create rental
      const [result] = await connection.execute(
        `INSERT INTO rentals (locker_id, student_id, start_date, end_date, monthly_price, total_amount, status, payment_status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lockerId, studentId, startDate, endDate, monthlyPrice, totalAmount, status, paymentStatus, notes]
      );

      // Update locker status to rented
      await connection.execute(
        'UPDATE lockers SET status = ? WHERE id = ?',
        ['rented', lockerId]
      );

      await connection.commit();
      return this.findById(result.insertId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, rentalData) {
    const fields = [];
    const values = [];

    Object.keys(rentalData).forEach(key => {
      if (rentalData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = ?`);
        values.push(rentalData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    await pool.execute(
      `UPDATE rentals SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get rental info before deletion
      const [rental] = await connection.execute(
        'SELECT locker_id FROM rentals WHERE id = ?',
        [id]
      );

      if (rental.length === 0) {
        throw new Error('Rental not found');
      }

      // Delete rental
      const [result] = await connection.execute(
        'DELETE FROM rentals WHERE id = ?',
        [id]
      );

      // Update locker status back to available
      await connection.execute(
        'UPDATE lockers SET status = ? WHERE id = ?',
        ['available', rental[0].locker_id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM rentals
    `);

    return stats[0];
  }

  static formatRental(row) {
    return {
      id: row.id,
      lockerId: row.locker_id,
      studentId: row.student_id,
      startDate: row.start_date,
      endDate: row.end_date,
      monthlyPrice: parseFloat(row.monthly_price),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      paymentStatus: row.payment_status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      locker: row.locker_number ? {
        id: row.locker_id,
        number: row.locker_number,
        location: row.locker_location,
        size: row.locker_size
      } : null,
      student: row.student_name ? {
        id: row.student_id,
        name: row.student_name,
        email: row.student_email,
        studentId: row.student_student_id
      } : null
    };
  }
}

export default Rental;