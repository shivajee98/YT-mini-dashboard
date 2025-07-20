const BASE_URL = 'http://localhost:3006/api';

export const apiService = {
    // Video operations
    getVideo: async (videoId: string) => {
        const response = await fetch(`${BASE_URL}/video/${videoId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    updateVideo: async (videoId: string, title: string, description: string) => {
        const response = await fetch(`${BASE_URL}/video/${videoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Comment operations
    getComments: async (videoId: string) => {
        const response = await fetch(`${BASE_URL}/comments/${videoId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    addComment: async (videoId: string, text: string, author: string = 'You') => {
        const response = await fetch(`${BASE_URL}/comments/${videoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, author })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    addReply: async (videoId: string, commentId: string, text: string, author: string = 'You') => {
        const response = await fetch(`${BASE_URL}/comments/${videoId}/${commentId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, author })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    deleteCommentOrReply: async (id: string, type: 'comment' | 'reply') => {
        const endpoint = type === 'comment' ? `comments/${id}` : `replies/${id}`;
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Event logs
    getEvents: async () => {
        const response = await fetch(`${BASE_URL}/events`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },
    getNotes: async (videoId: string, filters?: {
        category?: string;
        priority?: string;
        completed?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }) => {
        let url = `${BASE_URL}/notes/${videoId}`;

        if (filters) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, value.toString());
            });
            if (params.toString()) {
                url = `${BASE_URL}/notes/${videoId}/filter?${params}`;
            }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    // Notes 

    addNote: async (videoId: string, noteData: {
        content: string;
        author?: string;
        tags?: string[];
        priority?: string;
        category?: string;
    }) => {
        const response = await fetch(`${BASE_URL}/notes/${videoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    updateNote: async (noteId: string, updates: {
        content?: string;
        tags?: string[];
        priority?: string;
        category?: string;
        completed?: boolean;
    }) => {
        const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    },

    deleteNote: async (noteId: string) => {
        const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    }
};