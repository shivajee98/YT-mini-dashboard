const BASE_URL = 'http://localhost:3005/api';

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

    deleteComment: async (videoId: string, commentId: string) => {
        const response = await fetch(`${BASE_URL}/comments/${videoId}/${commentId}`, {
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
    }
};
