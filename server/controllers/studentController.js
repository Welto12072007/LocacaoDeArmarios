import {Student} from '../models/Student.js';

// Helper function to transform database fields to frontend format
const transformStudentData = (student) => {
  if (!student) return null;
  
  return {
    ...student,
    studentId: student.student_id,
    semester: student.trimester, // Map trimester to semester for frontend compatibility
    student_id: undefined, // Remove the snake_case field
    trimester: undefined // Remove the database field
  };
};

// Helper function to transform array of students
const transformStudentsData = (students) => {
  return students.map(transformStudentData);
};

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const result = await Student.findAll(limit, offset, search);

    res.json({
      success: true,
      data: transformStudentsData(result.students),
      total: result.total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar alunos'
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    res.json({
      success: true,
      data: transformStudentData(student)
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar aluno'
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, studentId, course, semester, status } = req.body;

    if (!name || !email || !studentId || !course || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, email, matrícula, curso e trimestre'
      });
    }

    // Validar trimestre (1-3)
    if (semester < 1 || semester > 3) {
      return res.status(400).json({
        success: false,
        message: 'Trimestre deve estar entre 1 e 3'
      });
    }

    // Check if email or student_id already exists
    const [existingEmail, existingStudentId] = await Promise.all([
      Student.findByEmail(email),
      Student.findByStudentId(studentId)
    ]);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    if (existingStudentId) {
      return res.status(409).json({
        success: false,
        message: 'Matrícula já está em uso'
      });
    }

    const student = await Student.create({
      name,
      email,
      phone,
      student_id: studentId,
      course,
      trimester: parseInt(semester),
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Aluno criado com sucesso',
      data: transformStudentData(student)
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aluno'
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, studentId, course, semester, status } = req.body;

    // Map camelCase to snake_case for database
    const updateData = {
      name,
      email,
      phone,
      student_id: studentId,
      course,
      trimester: semester ? parseInt(semester) : undefined,
      status
    };

    // Validar trimestre se fornecido
    if (semester && (semester < 1 || semester > 3)) {
      return res.status(400).json({
        success: false,
        message: 'Trimestre deve estar entre 1 e 3'
      });
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const student = await Student.update(id, updateData);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: transformStudentData(student)
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar aluno'
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Student.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Aluno excluído com sucesso'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir aluno'
    });
  }
};

export const getStudentStats = async (req, res) => {
  try {
    const stats = await Student.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar estatísticas dos alunos'
    });
  }
};