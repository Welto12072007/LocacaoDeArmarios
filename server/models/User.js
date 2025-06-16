import { pool } from '../config/database.js';

class Student {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT * FROM students 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM students'
    );

    return {
      data: rows.map(this.formatStudent),
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? this.formatStudent(rows[0]) : null;
  }

  static async create(studentData) {
    const {
      name,
      email,
      phone,
      studentId,
      course,
      semester,
      status = 'active'
    } = studentData;

    const [result] = await pool.execute(
      `INSERT INTO students (name, email, phone, student_id, course, semester, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, studentId, course, semester, status]
    );

    return this.findById(result.insertId);
  }

  static async update(id, studentData) {
    const fields = [];
    const values = [];

    Object.keys(studentData).forEach(key => {
      if (studentData[key] !== undefined) {
        const dbField = key === 'studentId' ? 'student_id' : key;
        fields.push(`${dbField} = ?`);
        values.push(studentData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    await pool.execute(
      `UPDATE students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM students WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );

    return rows.length > 0 ? this.formatStudent(rows[0]) : null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE student_id = ?',
      [studentId]
    );

    return rows.length > 0 ? this.formatStudent(rows[0]) : null;
  }

  static formatStudent(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      studentId: row.student_id,
      course: row.course,
      semester: row.semester,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default Student;
