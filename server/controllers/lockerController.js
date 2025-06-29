import {Locker} from '../models/Locker.js';

export const getLockers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Locker.findAll(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get lockers error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar armários'
    });
  }
};

export const getLocker = async (req, res) => {
  try {
    const { id } = req.params;
    const locker = await Locker.findById(id);

    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    res.json({
      success: true,
      data: locker
    });
  } catch (error) {
    console.error('Get locker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar armário'
    });
  }
};

export const createLocker = async (req, res) => {
  try {
    const { number, location, size, monthlyPrice, status } = req.body;

    if (!number || !location || !size || !monthlyPrice) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: número, localização, tamanho e preço mensal'
      });
    }

    // Check if number already exists
    const existingLocker = await Locker.findByNumber(number);
    if (existingLocker) {
      return res.status(409).json({
        success: false,
        message: 'Número do armário já está em uso'
      });
    }

    const locker = await Locker.create({
      number,
      location,
      size,
      monthlyPrice,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Armário criado com sucesso',
      data: locker
    });
  } catch (error) {
    console.error('Create locker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar armário'
    });
  }
};

export const updateLocker = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const locker = await Locker.update(id, updateData);

    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Armário atualizado com sucesso',
      data: locker
    });
  } catch (error) {
    console.error('Update locker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar armário'
    });
  }
};

export const deleteLocker = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Locker.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Armário excluído com sucesso'
    });
  } catch (error) {
    console.error('Delete locker error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir armário'
    });
  }
};