// server/controllers/rentalController.js
import { Rental } from '../models/Rental.js';

export const getRentals = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || '').trim();
    const offset = (page - 1) * limit;

    const result = await Rental.findAll(limit, offset, search);

    const totalPages = Math.max(Math.ceil((result.total || 0) / limit), 1);

    res.json({
      success: true,
      data: result.rentals || [],
      total: result.total || 0,
      totalPages,
      page,
      limit,
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar locações' });
  }
};

export const getRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Locação não encontrada' });
    }

    res.json({ success: true, data: rental });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({ success: false, message: 'Erro ao carregar locação' });
  }
};

export const createRental = async (req, res) => {
  try {
    // ========= INÍCIO DA CORREÇÃO =========
    // 1. Ler as variáveis do req.body usando snake_case
    const {
      locker_id,
      student_id,
      start_date,
      end_date,
      monthly_price,
      total_amount,
      status = 'active',
      payment_status = 'pending',
      notes,
    } = req.body;

    // 2. Usar as novas variáveis na validação
    if (!locker_id || !student_id || !start_date || !end_date || !monthly_price || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: armário, aluno, datas, preço mensal e valor total',
      });
    }

    // 3. Passar os dados para o Model usando camelCase, pois a função toDb fará a conversão
    const rental = await Rental.create({
      lockerId: locker_id,
      studentId: student_id,
      startDate: start_date,
      endDate: end_date,
      monthlyPrice: monthly_price,
      totalAmount: total_amount,
      status,
      paymentStatus: payment_status,
      notes,
    });
    // ========= FIM DA CORREÇÃO =========

    res.status(201).json({ success: true, message: 'Locação criada com sucesso', data: rental });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar locação' });
  }
};

export const updateRental = async (req, res) => {
  try {
    const { id } = req.params;

    // ========= INÍCIO DA CORREÇÃO =========
    // 1. Ler as variáveis do req.body usando snake_case
    const {
      locker_id,
      student_id,
      start_date,
      end_date,
      monthly_price,
      total_amount,
      status,
      payment_status,
      notes,
    } = req.body;
    
    // 2. Montar um objeto com camelCase para enviar ao Model
    const updatePayload = {
        lockerId: locker_id,
        studentId: student_id,
        startDate: start_date,
        endDate: end_date,
        monthlyPrice: monthly_price,
        totalAmount: total_amount,
        status,
        paymentStatus: payment_status,
        notes,
    };

    const rental = await Rental.update(id, updatePayload);
    // ========= FIM DA CORREÇÃO =========

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Locação não encontrada' });
    }

    res.json({ success: true, message: 'Locação atualizada com sucesso', data: rental });
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar locação' });
  }
};

export const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Rental.delete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Locação não encontrada' });
    }

    res.json({ success: true, message: 'Locação excluída com sucesso' });
  } catch (error) {
    console.error('Delete rental error:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir locação' });
  }
};