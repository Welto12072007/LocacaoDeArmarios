import express from 'express';
import {
  getLocais,
  getLocalById,
  createLocal,
  updateLocal,
  deleteLocal
} from '../controllers/locaisController.js';

const router = express.Router();

router.get('/', getLocais);
router.get('/:id', getLocalById);
router.post('/', createLocal);
router.put('/:id', updateLocal);
router.delete('/:id', deleteLocal);

export default router;
