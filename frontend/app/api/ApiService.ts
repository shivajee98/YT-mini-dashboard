const BASE_URL = 'http://localhost:3005';

// Types for better type safety
interface AuthResponse {
    user: {
        id: string;
        email: string;
        username: string;
        hasYouTubeAuth: boolean;
    };
    token: string;
}

interface ApiError {
    error: string;
    authUrl?: string;
}

// Enhanced fetch wrapper with auth handling
const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        credentials: 'include', // 🔑 Always send cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    // Handle different response types
    if (response.status === 401) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Authentication required' }));
        throw new AuthError(errorData.error, errorData.authUrl);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Custom error class for auth-related errors
class AuthError extends Error {
    constructor(message: string, public authUrl?: string) {
        super(message);
        this.name = 'AuthError';
    }
}

export const apiService = {
    // ============= AUTH OPERATIONS =============
    register: async (userData: { email: string; username: string }) => {
        return authFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }) as Promise<AuthResponse>;
    },

    login: async (email: string) => {
        return authFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email })
        }) as Promise<AuthResponse>;
    },

    // ============= YOUTUBE AUTH OPERATIONS =============
    getYouTubeAuthUrl: () => {
        return `${BASE_URL}/auth/youtube`;
    },

    checkYouTubeAuthStatus: async () => {
        return authFetch('/api/user/youtube-status') as Promise<{
            isAuthenticated: boolean;
            authUrl?: string;
        }>;
    },

    // ============= USER VIDEO OPERATIONS (YouTube Auth Required) =============
    getUserVideos: async (params?: {
        maxResults?: number;
        pageToken?: string;
        order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
    }) => {
        let endpoint = '/api/user/videos';

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) searchParams.append(key, value.toString());
            });
            if (searchParams.toString()) {
                endpoint += `?${searchParams}`;
            }
        }

        return authFetch(endpoint) as Promise<{
            videos: Array<{
                id: string;
                title: string;
                description: string;
                thumbnailUrl: string;
                publishedAt: string;
                channelTitle: string;
            }>;
            nextPageToken?: string;
            prevPageToken?: string;
            totalResults: number;
        }>;
    },

    getUserChannel: async () => {
        return authFetch('/api/user/channel') as Promise<{
            id: string;
            title: string;
            customUrl?: string;
            thumbnailUrl?: string;
        }>;
    },

    // ============= PUBLIC VIDEO OPERATIONS =============
    getVideo: async (videoId: string) => {
        const response = await fetch(`${BASE_URL}/api/video/${videoId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json() as Promise<{
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
        }>;
    },

    // ============= COMMENT OPERATIONS (Public) =============
    getComments: async (videoId: string) => {
        const response = await fetch(`${BASE_URL}/api/comments/${videoId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json() as Promise<Array<{
            id: string;
            videoId: string;
            author: string;
            text: string;
            publishedAt: string;
            likeCount: number;
            authorAvatar?: string;
            replies: Array<{
                id: string;
                commentId: string;
                author: string;
                text: string;
                publishedAt: string;
                authorAvatar?: string;
            }>;
        }>>;
    },

    // ============= NOTES OPERATIONS (Auth Required) =============
    getNotes: async (videoId: string, filters?: {
        category?: string;
        priority?: string;
        completed?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        let endpoint = `/api/notes/${videoId}`;

        if (filters) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, value.toString());
            });
            if (params.toString()) {
                endpoint += `?${params}`;
            }
        }

        return authFetch(endpoint) as Promise<Array<{
            _id: string;
            videoId: string;
            userId: string;
            content: string;
            author: string;
            tags: string[];
            priority: 'low' | 'medium' | 'high';
            category: string;
            completed: boolean;
            createdAt: string;
            updatedAt: string;
        }>>;
    },

    addNote: async (videoId: string, noteData: {
        content: string;
        author?: string;
        tags?: string[];
        priority?: 'low' | 'medium' | 'high';
        category?: string;
    }) => {
        return authFetch(`/api/notes/${videoId}`, {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
    },

    updateNote: async (noteId: string, updates: {
        content?: string;
        tags?: string[];
        priority?: 'low' | 'medium' | 'high';
        category?: string;
        completed?: boolean;
    }) => {
        return authFetch(`/api/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    deleteNote: async (noteId: string) => {
        return authFetch(`/api/notes/${noteId}`, {
            method: 'DELETE'
        });
    },

    // ============= EVENT LOGS (Auth Required) =============
    getEvents: async () => {
        return authFetch('/api/events') as Promise<Array<{
            id: string;
            action: string;
            timestamp: string;
            details: string;
        }>>;
    },

    // ============= HEALTH CHECK =============
    healthCheck: async () => {
        const response = await fetch(`${BASE_URL}/health`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json() as Promise<{
            status: string;
            timestamp: string;
        }>;
    }
};

// Export the custom error class for handling auth errors in components
export { AuthError };

// Helper hook for handling auth errors in React components
export const handleApiError = (error: unknown, router?: any) => {
    if (error instanceof AuthError) {
        console.error('Authentication required:', error.message);
        if (error.authUrl) {
            // Redirect to YouTube auth if needed
            window.location.href = error.authUrl;
        } else if (router) {
            // Redirect to login page
            router.push('/auth/youtube');
        }
        return 'Authentication required. Please log in.';
    } else if (error instanceof Error) {
        console.error('API Error:', error.message);
        return error.message;
    } else {
        console.error('Unknown error:', error);
        return 'An unexpected error occurred.';
    }
};
