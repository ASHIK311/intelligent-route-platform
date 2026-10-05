import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../repositories/database.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/error-handler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ApiResponse } from '@intelligent-route/shared-types';

export class AuthController {
  public login = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'INVALID_INPUT');
      }

      const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      const { passwordHash, ...safeUser } = user;

      res.json({
        success: true,
        data: {
          token,
          user: safeUser
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public register = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { email, password, name, role = 'user' } = req.body;
      if (!email || !password || !name) {
        throw new AppError('Name, email, and password are required', 400, 'INVALID_INPUT');
      }

      const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new AppError('Email already registered', 409, 'USER_EXISTS');
      }

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const newUser: StoredUser = {
        id,
        email,
        name,
        role: role === 'admin' ? 'user' : role, // protect admin escalation
        passwordHash,
        createdAt: new Date().toISOString(),
        preferences: {
          defaultProfile: 'balanced',
          costSensitivity: 0.5,
          timeSensitivity: 0.5,
          avoidTolls: false
        }
      };

      db.users.set(id, newUser);
      db.preferences.set(id, newUser.preferences);

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, role: newUser.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
      );

      const { passwordHash: _, ...safeUser } = newUser;

      res.status(201).json({
        success: true,
        data: {
          token,
          user: safeUser
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }
      const user = db.users.get(req.user.userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
      const { passwordHash, ...safeUser } = user;

      res.json({
        success: true,
        data: safeUser
      });
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
