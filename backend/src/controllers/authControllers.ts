import type { Request, Response } from 'express';
import { sql } from '../utils//postgres';
import bcrypt from 'bcrypt';

interface User {
    id: number;
    email: string;
    password: string;
    created_at: Date;
}

export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Check if email exists
        const existingUser = await sql<User[]>`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (existingUser.length > 0) {
            res.status(401).json({ error: 'Email already registered' });
            return
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await sql<User[]>`
            INSERT INTO users (email, password)
            VALUES (${email}, ${hashedPassword})
            RETURNING id, email, created_at
        `;

        res.status(201).json({
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                password: newUser[0].password,
                created_at: newUser[0].created_at
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const users = await sql<User[]>`
            SELECT * FROM users WHERE email = ${email}
        `;

        if (users.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return
        }

        const user = users[0];

        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return
        }

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Failed to sign in' });
    }
};

// Optional: Get user profile
export const getProfile = async (req: Request, res: Response) => {
    const userId = req.params.id;

    try {
        const users = await sql<User[]>`
            SELECT id, email, created_at 
            FROM users 
            WHERE id = ${userId}
        `;

        if (users.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return
        }

        res.json({ user: users[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
