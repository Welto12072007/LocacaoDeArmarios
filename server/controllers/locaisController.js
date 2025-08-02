import { supabase } from '../config/database.js';

export const getLocais = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('locais')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      data,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLocalById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('locais')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Local não encontrado' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createLocal = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const { data, error } = await supabase
      .from('locais')
      .insert([{ nome, descricao }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLocal = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const { data, error } = await supabase
      .from('locais')
      .update({ nome, descricao })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLocal = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('locais')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
