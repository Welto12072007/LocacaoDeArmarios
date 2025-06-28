import express from 'express';
import {
  getRentals,
  getRental,
  createRental,
  updateRental,
  deleteRental
} from '../controllers/rentalController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getRentals);
router.get('/:id', getRental);
router.post('/', createRental);
router.put('/:id', updateRental);
router.delete('/:id', deleteRental);

export default router;