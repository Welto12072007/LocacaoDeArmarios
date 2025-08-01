import express from 'express';
import {
  getArmarios,
  getArmario,
  createArmario,
  updateArmario,
  deleteArmario,
  getArmarioStats,
  getArmariosDisponiveis
} from '../controllers/lockerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();


router.use(authenticate);
router.get('/', getArmarios);
router.get('/stats', getArmarioStats);
router.get('/disponiveis', getArmariosDisponiveis);
router.get('/:id', getArmario);
router.post('/', createArmario);
router.put('/:id', updateArmario);
router.delete('/:id', deleteArmario);

export default router;