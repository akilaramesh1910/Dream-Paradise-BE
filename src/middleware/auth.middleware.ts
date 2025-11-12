// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type TokenPayload = JwtPayload & { id: string; role?: string };

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    if (!decoded?.id) return res.status(401).json({ message: 'Token invalid' });

    req.user = { id: decoded.id, role: decoded.role }; // now matches the global type
    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
};
