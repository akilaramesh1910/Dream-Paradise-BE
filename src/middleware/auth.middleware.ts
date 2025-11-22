import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type TokenPayload = JwtPayload & { id: string; role?: string };

export const AuthReq = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) {
      console.log('No token found in header');
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    console.log('Decoded JWT token:', decoded);


    if (!decoded?.id) {
      console.log('Token invalid: missing id', decoded);
      return res.status(401).json({ message: 'Token invalid' });
    }

    req.user = { id: decoded.id, role: decoded.role };

    console.log('AuthReq user attached:', req.user);

    return next();
  } catch (error) {
    console.log('AuthReq error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};


