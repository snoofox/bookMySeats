import { ZodSchema, ZodError } from 'zod';
import { RequestHandler } from 'express';

export const validate = (schema: ZodSchema): RequestHandler => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({ errors: err.errors });
                return;
            }
            next(err);
        }
    };
};