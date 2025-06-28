import express from 'express';
import {
  getLockers,
  getLocker,
  createLocker,
  updateLocker,
  deleteLocker
} from '../controllers/lockerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getLockers);
router.get('/:id', getLocker);
router.post('/', createLocker);
router.put('/:id', updateLocker);
router.delete('/:id', deleteLocker);

export default router;