import { Request, Response } from 'express';
import pool from '../config/db';

export const getSeatsMap = async (req: Request, res: Response): Promise<void> => {
    try {
        const { rows } = await pool.query(`
        SELECT s.id, s.row_number, s.seat_number, 
               CASE WHEN b.id IS NULL THEN false ELSE true END as is_booked
        FROM seats s
        LEFT JOIN bookings b ON s.id = b.seat_id
        ORDER BY s.row_number, s.seat_number
      `);

        // Organize by rows for easier frontend rendering
        const seatMap: Record<number, any[]> = {};
        rows.forEach(seat => {
            if (!seatMap[seat.row_number]) {
                seatMap[seat.row_number] = [];
            }
            seatMap[seat.row_number].push({
                id: seat.id,
                seatNumber: seat.seat_number,
                isBooked: seat.is_booked
            });
        });

        res.status(200).json(seatMap);
    } catch (err) {
        console.error('Error fetching seat map:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('DELETE FROM bookings');
        console.log(`Reset successful: ${result.rowCount} bookings deleted.`);
        res.status(200).json({ message: 'All seat bookings have been successfully reset.' });
    } catch (err) {
        console.error('Error resetting bookings:', err);
        res.status(500).json({ message: 'Internal server error while resetting bookings.' });
    }
};