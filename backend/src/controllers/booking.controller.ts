import { Request, Response } from 'express';
import pool from '../config/db';

export const bookSeats = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const count = req.body.count;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: availableSeats }: { rows: Seat[] } = await client.query(
            `
            SELECT id, row_number, seat_number 
            FROM seats 
            WHERE id NOT IN (SELECT seat_id FROM bookings)
            ORDER BY row_number, seat_number
            FOR UPDATE
            `
        );

        if (availableSeats.length < count) {
            await client.query('ROLLBACK');
            res.status(400).json({ message: 'Not enough seats available' });
            return;
        }

        const seatsByRow: Record<number, Seat[]> = {};
        availableSeats.forEach((seat) => {
            if (!seatsByRow[seat.row_number]) {
                seatsByRow[seat.row_number] = [];
            }
            seatsByRow[seat.row_number].push(seat);
        });

        const sortedRowNumbers = Object.keys(seatsByRow)
            .map(Number)
            .sort((a, b) => a - b);

        let selectedSeats: Seat[] = [];

        for (const rowNumber of sortedRowNumbers) {
            const rowSeats = seatsByRow[rowNumber];

            rowSeats.sort((a, b) => a.seat_number - b.seat_number);

            const consecutiveGroups: Seat[][] = [];
            let currentGroup: Seat[] = [];

            for (let i = 0; i < rowSeats.length; i++) {
                if (i === 0 || rowSeats[i].seat_number === rowSeats[i - 1].seat_number + 1) {
                    currentGroup.push(rowSeats[i]);
                } else {
                    if (currentGroup.length > 0) {
                        consecutiveGroups.push([...currentGroup]);
                        currentGroup = [rowSeats[i]];
                    }
                }
            }

            if (currentGroup.length > 0) {
                consecutiveGroups.push(currentGroup);
            }

            const suitableGroup = consecutiveGroups.find(group => group.length >= count);

            if (suitableGroup) {
                selectedSeats = suitableGroup.slice(0, count);
                break;
            }
        }

        if (selectedSeats.length === 0) {
            let remainingCount = count;
            selectedSeats = [];
            
            // Start with a multirow strategy that prioritizes nearby rows
            let bestAllocation: Seat[] = [];
            let bestRowSpan = Number.MAX_SAFE_INTEGER;
            
            for (let startIdx = 0; startIdx < sortedRowNumbers.length; startIdx++) {
                let seatsFromRows: Seat[] = [];
                let collected = 0;
                let lastRowIdx = -1;
                
                for (let i = startIdx; i < sortedRowNumbers.length && collected < count; i++) {
                    const rowSeats = seatsByRow[sortedRowNumbers[i]];
                    const seatsToTake = Math.min(rowSeats.length, count - collected);
                    
                    seatsFromRows = [...seatsFromRows, ...rowSeats.slice(0, seatsToTake)];
                    collected += seatsToTake;
                    lastRowIdx = i;
                }
                
                if (collected === count) {
                    const rowSpan = lastRowIdx - startIdx + 1;
                    if (rowSpan < bestRowSpan) {
                        bestAllocation = seatsFromRows;
                        bestRowSpan = rowSpan;
                    }
                }
            }
            
            if (bestAllocation.length === count) {
                selectedSeats = bestAllocation;
            } else {
                // Fallback to the original algorithm if the new approach fails
                selectedSeats = availableSeats.slice(0, count);
            }
        }

        for (const seat of selectedSeats) {
            await client.query(
                `INSERT INTO bookings (user_id, seat_id) VALUES ($1, $2)`,
                [userId, seat.id]
            );
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Seats booked successfully',
            seats: selectedSeats.map((s) => ({
                row: s.row_number,
                seat: s.seat_number
            }))
        });
        return;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Booking failed:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
    } finally {
        client.release();
    }
};
