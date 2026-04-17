import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if ((req as any).headers.authorization && (req as any).headers.authorization.startsWith('Bearer')) {
    try {
      token = (req as any).headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as any;
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return (res as any).status(401).json({ message: 'Not authorized, user failed' });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error(error);
      (res as any).status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    (res as any).status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return (res as any).status(403).json({ message: `User role ${user?.role} is not authorized to access this route` });
    }
    next();
  };
};