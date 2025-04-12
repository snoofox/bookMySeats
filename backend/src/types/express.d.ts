import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

declare global {
    interface Seat {
        id: number;
        row_number: number;
        seat_number: number;
    }
}