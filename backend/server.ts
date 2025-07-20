import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { youtubeAuth } from './auth/youtube-auth';
import type { YouTubeVideo, MappedVideo, Comment, Reply } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3005;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

// In-memory storage for local comments and event logs (non-YouTube data)
const eventLogs: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
}> = [];

// YouTube API helper functions
const makeYouTubeAPICall = async (endpoint: string, options: any = {}) => {
    const accessToken = await youtubeAuth.getValidAccessToken();

    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YouTube API error: ${response.status} ${errorText}`);
    }

    return response.json();
};

// Get video by ID (existing code - no changes needed)
app.get('/api/video/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        if (!process.env.YOUTUBE_API_KEY) {
            console.error('YouTube API key is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log(`Fetching video data for ID: ${videoId}`);

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            console.error(`YouTube API error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ error: 'Failed to fetch video data from YouTube' });
        }

        const data = await response.json();
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

// Get comments for a video (fetch from YouTube)
app.get('/api/comments/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;

        console.log(`Fetching comments for video: ${videoId}`);

        const data = await makeYouTubeAPICall(
            `commentThreads?part=snippet,replies&videoId=${videoId}&order=time&maxResults=50`
        );

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

        console.log(`Found ${comments.length} comments for video ${videoId}`);
        res.json(comments);

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments from YouTube' });
    }
});

// Add a new comment (post to YouTube)
app.post('/api/comments/:videoId', async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        console.log(`Adding comment to video ${videoId}: ${text.substring(0, 50)}...`);

        const commentData = {
            snippet: {
                videoId: videoId,
                topLevelComment: {
                    snippet: {
                        textOriginal: text.trim()
                    }
                }
            }
        };

        const response = await makeYouTubeAPICall('commentThreads?part=snippet', {
            method: 'POST',
            body: JSON.stringify(commentData)
        });

        // Map the response to our expected format
        const topComment = response.snippet.topLevelComment.snippet;
        const newComment = {
            id: response.id,
            videoId: videoId,
            author: topComment.authorDisplayName,
            text: topComment.textDisplay,
            publishedAt: topComment.publishedAt,
            likeCount: 0,
            replies: [],
            authorAvatar: topComment.authorProfileImageUrl
        };

        // Log the event
        eventLogs.push({
            id: Date.now().toString(),
            action: 'Comment added to YouTube',
            timestamp: new Date().toISOString(),
            details: `Posted: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`
        });

        console.log(`✅ Comment added successfully to video ${videoId}`);
        res.json(newComment);

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment to YouTube' });
    }
});

// Add a reply to a comment (post to YouTube)
app.post('/api/comments/:videoId/:commentId/reply', async (req: Request, res: Response) => {
    try {
        const { videoId, commentId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Reply text is required' });
        }

        console.log(`Adding reply to comment ${commentId}: ${text.substring(0, 50)}...`);

        const replyData = {
            snippet: {
                parentId: commentId,
                textOriginal: text.trim()
            }
        };

        const response = await makeYouTubeAPICall('comments?part=snippet', {
            method: 'POST',
            body: JSON.stringify(replyData)
        });

        // Log the event
        eventLogs.push({
            id: Date.now().toString(),
            action: 'Reply added to YouTube',
            timestamp: new Date().toISOString(),
            details: `Replied to comment ${commentId}`
        });

        // Return the updated comment thread by fetching fresh data
        const updatedThreadData = await makeYouTubeAPICall(
            `commentThreads?part=snippet,replies&id=${commentId}`
        );

        if (updatedThreadData.items && updatedThreadData.items.length > 0) {
            const item = updatedThreadData.items[0];
            const topComment = item.snippet.topLevelComment.snippet;
            const replies = item.replies?.comments?.map((reply: any) => ({
                id: reply.id,
                commentId: commentId,
                author: reply.snippet.authorDisplayName,
                text: reply.snippet.textDisplay,
                publishedAt: reply.snippet.publishedAt,
                authorAvatar: reply.snippet.authorProfileImageUrl
            })) || [];

            const updatedComment = {
                id: item.id,
                videoId: videoId,
                author: topComment.authorDisplayName,
                text: topComment.textDisplay,
                publishedAt: topComment.publishedAt,
                likeCount: topComment.likeCount || 0,
                replies: replies,
                authorAvatar: topComment.authorProfileImageUrl
            };

            console.log(`✅ Reply added successfully to comment ${commentId}`);
            res.json(updatedComment);
        } else {
            throw new Error('Failed to fetch updated comment thread');
        }

    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Failed to add reply to YouTube' });
    }
});

// Delete a comment (from YouTube)
app.delete('/api/comments/:videoId/:commentId', async (req: Request, res: Response) => {
    try {
        const { videoId, commentId } = req.params;

        console.log(`Deleting comment ${commentId} from video ${videoId}`);

        await makeYouTubeAPICall(`comments?id=${commentId}`, {
            method: 'DELETE'
        });

        // Log the event
        eventLogs.push({
            id: Date.now().toString(),
            action: 'Comment deleted from YouTube',
            timestamp: new Date().toISOString(),
            details: `Deleted comment ${commentId}`
        });

        console.log(`✅ Comment ${commentId} deleted successfully`);
        res.json({ message: 'Comment deleted successfully from YouTube' });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment from YouTube' });
    }
});

// Update video title and description (existing code - no changes needed)
app.put('/api/video/:videoId', async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        eventLogs.push({
            id: Date.now().toString(),
            action: 'Video updated',
            timestamp: new Date().toISOString(),
            details: `Title: ${title}`
        });

        res.json({
            message: 'Video updated successfully',
            title,
            description
        });

    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// Get event logs
app.get('/api/events', (req: Request, res: Response) => {
    res.json(eventLogs.slice(0, 50));
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🎥 Video endpoint: http://localhost:${PORT}/api/video/:videoId`);

    // Check configuration
    const requiredEnvVars = [
        'YOUTUBE_API_KEY',
        'YOUTUBE_CLIENT_ID',
        'YOUTUBE_CLIENT_SECRET',
        'YOUTUBE_REFRESH_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length === 0) {
        console.log('✅ All YouTube API credentials configured');
    } else {
        console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    }
});

export default app;
