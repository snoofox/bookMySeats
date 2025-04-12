import { z } from 'zod';

export const bookingSchema = z.object({
    count: z
        .number()
        .int()
        .min(1, { message: 'Count must be at least 1.' })
        .max(7, { message: 'Count must be at most 7.' })
});