import { apiService } from "@/app/api/ApiService";
import { useState } from "react";

// hooks/useVideoActions.ts
export const useVideoActions = (videoId: string) => {
    const [loading, setLoading] = useState(false);

    const updateVideo = async (title: string, description: string) => {
        setLoading(true);
        try {
            const result = await apiService.updateVideo(videoId, title, description);
            return result;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { updateVideo, loading };
};

// hooks/useComments.ts
export const useComments = (videoId: string) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const addComment = async (text: string) => {
        setLoading(true);
        try {
            const comment = await apiService.addComment(videoId, text);
            setComments(prev => [comment, ...prev]);
            return comment;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteComment = async (commentId: string) => {
        setLoading(true);
        try {
            await apiService.deleteComment(videoId, commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { comments, setComments, addComment, deleteComment, loading };
};
