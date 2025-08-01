import { Locker } from '../models/Locker.js';

export const getArmarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const offset = (page - 1) * limit;

    let result;
    if (status) {
      const armarios = await Armario.findByStatus(status);
      result = {
        armarios: armarios.slice(offset, offset + limit),
        total: armarios.length
      };
    } else {
      result = await Armario.findAll(limit, offset, search);
    }

    res.json({
      success: true,
      data: result.armarios,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / limit),
        totalItems: result.total,
        hasNext: page < Math.ceil(result.total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get armarios error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar armários'
    });
  }
};

export const getArmario = async (req, res) => {
  try {
    const { id } = req.params;
    const armario = await Armario.findById(id);

    if (!armario) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    res.json({
      success: true,
      data: armario
    });
  } catch (error) {
    console.error('Get armario error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar armário'
    });
  }
};

export const createArmario = async (req, res) => {
  try {
    const { numero, localizacao, status, observacoes } = req.body;

    // Validação dos campos obrigatórios
    if (!numero || !localizacao) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: número e localização'
      });
    }

    // Validação do status
    const statusValidos = ['disponível', 'alugado', 'manutenção'];
    if (status && !statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser: disponível, alugado ou manutenção'
      });
    }

    // Verifica se o número já existe
    const armarioExistente = await Armario.findByNumero(numero);
    if (armarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Número do armário já está em uso'
      });
    }

    const armarioData = {
      numero,
      localizacao,
      status: status || 'disponível',
      observacoes: observacoes || null
    };

    const armario = await Armario.create(armarioData);

    res.status(201).json({
      success: true,
      message: 'Armário criado com sucesso',
      data: armario
    });
  } catch (error) {
    console.error('Create armario error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar armário'
    });
  }
};

export const updateArmario = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, localizacao, status, observacoes } = req.body;

    // Verifica se o armário existe
    const armarioExistente = await Armario.findById(id);
    if (!armarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    // Se o número foi alterado, verifica se o novo número já existe
    if (numero && numero !== armarioExistente.numero) {
      const armarioComNumero = await Armario.findByNumero(numero);
      if (armarioComNumero) {
        return res.status(409).json({
          success: false,
          message: 'Número do armário já está em uso'
        });
      }
    }

    // Validação do status
    const statusValidos = ['disponível', 'alugado', 'manutenção'];
    if (status && !statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser: disponível, alugado ou manutenção'
      });
    }

    const updateData = {};
    if (numero) updateData.numero = numero;
    if (localizacao) updateData.localizacao = localizacao;
    if (status) updateData.status = status;
    if (observacoes !== undefined) updateData.observacoes = observacoes;

    const armario = await Armario.update(id, updateData);

    res.json({
      success: true,
      message: 'Armário atualizado com sucesso',
      data: armario
    });
  } catch (error) {
    console.error('Update armario error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar armário'
    });
  }
};

export const deleteArmario = async (req, res) => {
  try {
    const { id } = req.params;

    const armarioExistente = await Armario.findById(id);
    if (!armarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Armário não encontrado'
      });
    }

    const deleted = await Armario.delete(id);

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
    console.error('Delete armario error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir armário'
    });
  }
};

export const getArmarioStats = async (req, res) => {
  try {
    const stats = await Armario.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get armario stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar estatísticas dos armários'
    });
  }
};

export const getArmariosDisponiveis = async (req, res) => {
  try {
    const armarios = await Armario.findDisponiveis();

    res.json({
      success: true,
      data: armarios
    });
  } catch (error) {
    console.error('Get armarios disponiveis error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao carregar armários disponíveis'
    });
  }
};