import express from 'express';
import {
  getLockers,
  getLocker,
  createLocker,
  updateLocker,
  deleteLocker
} from '../controllers/lockerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLockers);
router.get('/:id', getLocker);
router.post('/', createLocker);
router.put('/:id', updateLocker);
router.delete('/:id', deleteLocker);

export default router;