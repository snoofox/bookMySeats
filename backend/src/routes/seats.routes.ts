import { Router } from 'express';
import { getSeatsMap, resetAllBookings } from '../controllers/seats.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/map', verifyToken, getSeatsMap);
router.post('/reset', verifyToken, resetAllBookings);

export default router;
