import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user.model';
import youtubeAuth from '../auth/youtube-auth';

export interface AuthenticatedRequest extends Request {
    user?: any;
    userId: string;
}

// Updated authentication middleware - Note: req parameter is now Request, not AuthenticatedRequest
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized - No token provided",
            authUrl: youtubeAuth.getAuthUrl()
        });
    }

    try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Type assertion to add custom properties
        (req as AuthenticatedRequest).user = decoded;
        (req as AuthenticatedRequest).userId = decoded.id;

        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        res.status(403).json({
            error: "Forbidden - Invalid token",
            authUrl: youtubeAuth.getAuthUrl()
        });
    }
}

// Updated YouTube auth requirement middleware - Note: req parameter is now Request, not AuthenticatedRequest
export const requireYouTubeAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authReq = req as AuthenticatedRequest;
        
        if (!authReq.user) {
            return res.status(401).json({
                error: 'Authentication required',
                authUrl: youtubeAuth.getAuthUrl()
            });
        }

        // Fix the logic here - check hasYouTubeAuth instead of checking if user exists again
        if (!authReq.user.hasYouTubeAuth) {
            const user = await User.findById(authReq.user.userId);
            if (!user) {
                return res.status(401).json({
                    error: 'YouTube authentication required',
                    authUrl: youtubeAuth.getAuthUrl()
                });
            }
        }

        next();
    } catch (error: any) {
        console.error('YouTube auth check failed:', error);
        res.status(500).json({
            error: 'Authentication check failed',
            details: error.message
        });
    }
};
