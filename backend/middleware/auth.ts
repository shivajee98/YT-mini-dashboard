import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/user.model';
import youtubeAuth from '../auth/youtube-auth';

export interface AuthenticatedRequest extends Request {
    user?: any;
    userId: string;
}

// Updated authentication middleware
export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized - No token provided",
            authUrl: youtubeAuth.getAuthUrl()
        });
    }

    try {
        // Verify and decode the JWT
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Set user info from decoded token
        req.user = decoded;
        req.userId = decoded.id; // Set userId for convenience

        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        res.status(403).json({
            error: "Forbidden - Invalid token",
            authUrl: youtubeAuth.getAuthUrl()
        });
    }
}

// Updated YouTube auth requirement middleware
export const requireYouTubeAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                authUrl: youtubeAuth.getAuthUrl()
            });
        }

        // Check if user has YouTube auth from the JWT payload
        if (!req.user.hasYouTubeAuth) {
            // Optionally fetch fresh user data from database to double-check
            const user = await User.findById(req.user.userId);
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
