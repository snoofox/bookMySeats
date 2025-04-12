import { Request, Response } from 'express';
import pool from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const hashed = await hashPassword(password)
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashed]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) throw new Error('User not found');

        const valid = await comparePassword(password, user.password)
        if (!valid) throw new Error('Invalid password');

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        res.status(401).json({ error: (err as Error).message });
    }
};
