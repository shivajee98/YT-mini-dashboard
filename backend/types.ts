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