import {Rental} from '../models/Rental.js';

export const getRentals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Rental.findAll(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar locações'
    });
  }
};

export const getRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Locação não encontrada'
      });
    }

    res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar locação'
    });
  }
};

export const createRental = async (req, res) => {
  try {
    const {
      lockerId,
      studentId,
      startDate,
      endDate,
      monthlyPrice,
      totalAmount,
      status,
      paymentStatus,
      notes
    } = req.body;

    if (!lockerId || !studentId || !startDate || !endDate || !monthlyPrice || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: armário, aluno, datas, preço mensal e valor total'
      });
    }

    const rental = await Rental.create({
      lockerId,
      studentId,
      startDate,
      endDate,
      monthlyPrice,
      totalAmount,
      status,
      paymentStatus,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Locação criada com sucesso',
      data: rental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar locação'
    });
  }
};

export const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const rental = await Rental.update(id, updateData);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Locação não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Locação atualizada com sucesso',
      data: rental
    });
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar locação'
    });
  }
};

export const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Rental.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Locação não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Locação excluída com sucesso'
    });
  } catch (error) {
    console.error('Delete rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir locação'
    });
  }
};