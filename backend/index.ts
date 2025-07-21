import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { YouTubeVideo, MappedVideo, Comment, Reply } from './types';
import Note from './model/notes.model';
import User from './model/user.model';
import { connectToMongoDB } from './db/db';
import { createLog, getAllLogs } from './controller/log.controller';
import { authenticateUser, requireYouTubeAuth, type AuthenticatedRequest } from './middleware/auth';
import youtubeAuth from './auth/youtube-auth';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
declare module 'express-serve-static-core' {
    interface Request {
        userId?: string; // or string if always present
    }
}

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://yt-mini-dashboard.vercel.app/'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// YouTube API helper functions
const makeYouTubeAPICall = async (endpoint: string, userId?: string) => {
    try {
        const isAuthenticatedEndpoint = userId && (
            endpoint.includes('mine=true') ||
            endpoint.includes('forMine=true') ||
            endpoint.includes('my')
        );

        if (isAuthenticatedEndpoint) {
            const youtube = await youtubeAuth.getYouTubeClient(userId);

            if (endpoint.includes('search?')) {
                const params = new URLSearchParams(endpoint.split('?')[1]);
                const result = await youtube.search.list({
                    part: [params.get('part') || 'snippet'],
                    forMine: params.get('forMine') === 'true',
                    type: params.get('type') as any,
                    order: params.get('order') as any,
                    maxResults: parseInt(params.get('maxResults') || '25'),
                    pageToken: params.get('pageToken') || undefined
                });
                return result.data;
            }
            else if (endpoint.includes('channels?')) {
                const params = new URLSearchParams(endpoint.split('?')[1]);
                const result = await youtube.channels.list({
                    part: [params.get('part') || 'snippet'],
                    mine: params.get('mine') === 'true'
                });
                return result.data;
            }
            else if (endpoint.includes('videos?')) {
                // Handle video list for authenticated user
                const params = new URLSearchParams(endpoint.split('?')[1]);
                const result = await youtube.videos.list({
                    part: [params.get('part') || 'snippet'],
                    chart: params.get('chart') as any,
                    myRating: params.get('myRating') as any,
                    maxResults: parseInt(params.get('maxResults') || '25')
                });
                return result.data;
            }
            else {
                throw new Error(`Unsupported authenticated endpoint: ${endpoint}`);
            }
        } else {
            if (!process.env.YOUTUBE_API_KEY) {
                throw new Error('YOUTUBE_API_KEY environment variable is not set');
            }

            const url = `https://www.googleapis.com/youtube/v3/${endpoint}&key=${process.env.YOUTUBE_API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('YouTube API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: url.replace(process.env.YOUTUBE_API_KEY, 'API_KEY_HIDDEN'),
                    body: errorBody
                });

                if (response.status === 403) {
                    throw new Error(`YouTube API 403 Error: Check API key restrictions and quotas. ${errorBody}`);
                }

                throw new Error(`YouTube API error: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        }
    } catch (error) {
        console.error('YouTube API call failed:', error);
        throw error;
    }
};

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// YouTube OAuth routes
app.get('/auth/youtube', (req, res) => {
    const authUrl = youtubeAuth.getAuthUrl();
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${process.env.BASE_URL}/?auth=error`);
        }

        // Get tokens and user info
        const tokens = await youtubeAuth.getTokens(code as string, req.userId!);

        // Find the user that was just created/updated
        const user = await User.findOne({ 'youtube.accessToken': tokens.access_token });


        if (!user) {
            throw new Error('User not found after authentication');
        }

        // Generate JWT token with user information (not OAuth tokens)
        const authToken = jwt.sign(
            {
                user
            },
            process.env.JWT_SECRET!,

            { expiresIn: '1h' }

        );

        // Set the JWT token as a cookie (not the OAuth tokens)
        res.cookie('auth_token', authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (match JWT expiry)
        });

        // Optional: Also set a separate cookie for quick client-side auth status check
        res.cookie('auth_status', 'authenticated', {
            httpOnly: false, // Allow client-side access for this one
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.BASE_URL}/videos?auth=success`);

    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.BASE_URL}/?auth=error`);
    }
});

// Check YouTube auth status
app.get('/api/user/youtube-status', (req, res) => {
    res.json({
        isAuthenticated: (req as any).user?.hasYouTubeAuth(),
        authUrl: (req as any).user?.hasYouTubeAuth() ? null : youtubeAuth.getAuthUrl()
    });
});

// Get video by ID (public endpoint - no auth needed)
app.get('/api/video/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }


        const data = await makeYouTubeAPICall(`videos?part=snippet,statistics,contentDetails&id=${videoId}`);
        const video: YouTubeVideo = data.items?.[0];

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const { snippet, statistics, contentDetails } = video;

        const mappedVideo: MappedVideo = {
            id: videoId,
            title: snippet.title,
            description: snippet.description,
            thumbnailUrl: snippet.thumbnails?.medium?.url || '/placeholder.svg',
            duration: contentDetails?.duration || 'Unknown',
            viewCount: Number(statistics.viewCount) || 0,
            likeCount: Number(statistics.likeCount) || 0,
            commentCount: Number(statistics.commentCount) || 0,
            publishedAt: snippet.publishedAt,
            status: snippet.status || 'unlisted',
        };

        res.json(mappedVideo);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get comments for a video (public endpoint)
app.get('/api/comments/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        const data = await makeYouTubeAPICall(`commentThreads?part=snippet,replies&videoId=${videoId}&order=time&maxResults=50`);

        const comments = data.items?.map((item: any) => {
            const topComment = item.snippet.topLevelComment.snippet;
            const replies = item.replies?.comments?.map((reply: any) => ({
                id: reply.id,
                commentId: item.id,
                author: reply.snippet.authorDisplayName,
                text: reply.snippet.textDisplay,
                publishedAt: reply.snippet.publishedAt,
                authorAvatar: reply.snippet.authorProfileImageUrl
            })) || [];

            return {
                id: item.id,
                videoId: videoId,
                author: topComment.authorDisplayName,
                text: topComment.textDisplay,
                publishedAt: topComment.publishedAt,
                likeCount: topComment.likeCount || 0,
                replies: replies,
                authorAvatar: topComment.authorProfileImageUrl
            };
        }) || [];

        res.json(comments);

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments from YouTube' });
    }
});

// Protected YouTube endpoints (require authentication)
app.get('/api/user/videos',
    async (req, res) => {
        try {
            console.log(`Fetching videos for user: ${req.userId}`);

            const { maxResults = 25, pageToken, order = 'date' } = req.query;

            let endpoint = `search?part=snippet&forMine=true&type=video&order=${order}&maxResults=${maxResults}`;

            if (pageToken) {
                endpoint += `&pageToken=${pageToken}`;
            }

            const data = await makeYouTubeAPICall(endpoint, req.userId);

            const videos = data.items?.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails?.medium?.url || '/placeholder.svg',
                publishedAt: item.snippet.publishedAt,
                channelTitle: item.snippet.channelTitle
            })) || [];


            res.json({
                videos,
                nextPageToken: data.nextPageToken,
                prevPageToken: data.prevPageToken,
                totalResults: data.pageInfo?.totalResults || 0
            });

        } catch (error) {
            console.error('Error fetching user videos:', error);

            if (error instanceof Error && error.message.includes('Authentication required')) {

                return res.status(401).json({
                    error: 'YouTube authentication expired',
                    authUrl: youtubeAuth.getAuthUrl()
                });
            }

            res.status(500).json({ error: 'Failed to fetch user videos' });
        }
    }
);

app.get('/api/user/channel',
    async (req, res) => {
        try {

            const data = await makeYouTubeAPICall('channels?part=snippet&mine=true', req.userId);
            const channel = data.items?.[0];

            if (channel) {
                const channelInfo = {
                    id: channel.id,
                    title: channel.snippet.title,
                    customUrl: channel.snippet.customUrl,
                    thumbnailUrl: channel.snippet.thumbnails?.default?.url
                };

                res.json(channelInfo);
            } else {
                res.status(404).json({ error: 'Channel not found' });
            }
        } catch (error) {

            if (error instanceof Error && error.message.includes('Authentication required')) {
                return res.status(401).json({
                    error: 'YouTube authentication expired',
                    authUrl: youtubeAuth.getAuthUrl()
                });
            }

            res.status(500).json({ error: 'Failed to fetch channel info' });
        }
    }
);

// Notes endpoints (require user auth but not YouTube auth)
app.get('/api/notes/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        const notes = await Note.find({ videoId, userId: req.userId });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.post('/api/notes/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const { content, author, tags, priority, category } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const note = new Note({
            videoId,
            userId: req.userId,
            content: content.trim(),
            author: author || (req as any).user?.username,
            tags: tags || [],
            priority: priority || 'medium',
            category: category || 'improvement'
        });

        const savedNote = await note.save();

        createLog({
            id: Date.now().toString(),
            action: 'Note added',
            timestamp: new Date().toISOString(),
            details: `Added note for video ${videoId}`
        });

        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

app.put('/api/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const { content, tags, priority, category, completed } = req.body;

        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId: req.userId },
            { content, tags, priority, category, completed },
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

app.delete('/api/notes/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;

        const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: req.userId });

        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        createLog({
            id: Date.now().toString(),
            action: 'Note deleted',
            timestamp: new Date().toISOString(),
            details: `Deleted note ${noteId}`
        });

        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Get event logs
app.get('/api/events', async (req, res) => {
    const logs = await getAllLogs();
    res.json(logs);
});

const PORT = Number(process.env.PORT) || 10000;

const startServer = async () => {
    try {
        await connectToMongoDB();
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🎥 Video endpoint: http://localhost:${PORT}/api/video/:videoId`);
            console.log(`🔐 Auth endpoint: http://localhost:${PORT}/auth/youtube`);
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

startServer();

export default app;
