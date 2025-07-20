import { useState, useEffect } from 'react';
import { apiService } from '../app/api/ApiService';
import { toast } from '@/hooks/use-toast';

export const useComments = (videoId: string) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const data = await apiService.getComments(videoId);
            setComments(data);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            toast({
                title: 'Error',
                description: 'Failed to load comments.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const addComment = async (text: string) => {
        if (!text.trim()) return false;

        setLoading(true);
        try {
            const comment = await apiService.addComment(videoId, text);
            setComments(prev => [comment, ...prev]);
            toast({
                title: 'Comment added',
                description: 'Your comment has been posted.',
            });
            return true;
        } catch (error) {
            console.error('Error adding comment:', error);
            toast({
                title: 'Error adding comment',
                description: 'Please try again later.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const addReply = async (commentId: string, text: string) => {
        if (!text.trim()) return false;

        setLoading(true);
        try {
            const updatedComment = await apiService.addReply(videoId, commentId, text);
            setComments(prev =>
                prev.map(comment =>
                    comment.id === commentId ? updatedComment : comment
                )
            );
            setReplyingTo(null);
            toast({
                title: 'Reply added',
                description: 'Your reply has been posted.',
            });
            return true;
        } catch (error) {
            console.error('Error adding reply:', error);
            toast({
                title: 'Error adding reply',
                description: 'Please try again later.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteCommentOrReply = async (commentId: string) => {
        setLoading(true);
        try {
            await apiService.deleteCommentOrReply(commentId, 'comment');
            setComments(prev => prev.filter(comment => comment.id !== commentId));
            toast({
                title: 'Comment deleted',
                description: 'Your comment has been removed.',
            });
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                title: 'Error deleting comment',
                description: 'Please try again later.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (videoId) {
            fetchComments();
        }
    }, [videoId]);

    return {
        comments,
        loading,
        replyingTo,
        setReplyingTo,
        addComment,
        addReply,
        deleteCommentOrReply,
        refetchComments: fetchComments
    };
};
