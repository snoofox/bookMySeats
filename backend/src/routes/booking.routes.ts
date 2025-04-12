import { Router } from 'express';
import { bookSeats } from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware';
import { bookingSchema } from '../validators/booking.validator';

const router = Router();

router.post('/book', verifyToken, validate(bookingSchema), bookSeats);

export default router;
