export interface YouTubeVideo {
    id: string;
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            medium?: {
                url: string;
            };
        };
        status?: string;
    };
    statistics: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
    contentDetails: {
        duration: string;
    };
}

export interface MappedVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    duration: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
    status: string;
}

export interface Comment {
    id: string;
    videoId: string;
    author: string;
    text: string;
    publishedAt: string;
    replies: Reply[];
}

export interface Reply {
    id: string;
    commentId: string;
    author: string;
    text: string;
    publishedAt: string;
}

import { Document } from 'mongoose';

export interface YouTubeInfo {
    channelId?: string;
    channelTitle?: string;
    channelThumbnail?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    subscriberCount?: number;
    videoCount?: number;
    totalViews?: number;
}

// types.ts
export interface IUser extends Document {
    email: string;
    username: string;
    youtube?: {
        channelId?: string;
        channelTitle?: string;
        channelThumbnail?: string;
        accessToken?: string;
        refreshToken?: string;
        tokenExpiresAt?: Date;
        subscriberCount?: number;
        videoCount?: number;
        totalViews?: number;
    };

    // Method signatures
    generateAuthToken(): string;
    generateRefreshToken(): string;
    updateYouTubeTokens(tokens: any): Promise<void>;
    getYouTubeTokens(): { access_token?: string; refresh_token?: string; expiry_date?: number } | null;
    isYouTubeTokenValid(): boolean;
    hasYouTubeAuth(): boolean;
    clearYouTubeAuth(): Promise<void>;
}
