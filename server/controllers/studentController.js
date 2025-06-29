import {Student} from '../models/Student.js';

export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Student.findAll(page, limit);

    res.json({
      success: true,
      ...result
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
      data: student
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
        message: 'Campos obrigatórios: nome, email, matrícula, curso e semestre'
      });
    }

    // Check if email or studentId already exists
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
      studentId,
      course,
      semester,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Aluno criado com sucesso',
      data: student
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
    const updateData = req.body;

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
      data: student
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