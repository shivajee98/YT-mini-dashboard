export interface Note {
    _id: string;
    videoId: string;
    content: string;
    createdAt: string;
    author?: string;
    tags?: string[];
    priority?: string;
    category?: string;
    completed?: boolean;
}
