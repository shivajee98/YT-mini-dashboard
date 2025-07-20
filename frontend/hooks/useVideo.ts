import { useState, useEffect } from 'react';
import { apiService } from '../app/api/ApiService';
import { toast } from '@/hooks/use-toast';

export const useVideo = (videoId: string) => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const fetchVideo = async () => {
        setLoading(true);
        try {
            const data = await apiService.getVideo(videoId);
            setVideoData(data);
            setEditTitle(data.title);
            setEditDescription(data.description);
        } catch (error) {
            console.error('Failed to fetch video:', error);
            toast({
                title: 'Error',
                description: 'Failed to load video details.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateVideo = async (title: string, description: string) => {
        if (!title.trim() || !description.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Title and description cannot be empty.',
                variant: 'destructive'
            });
            return false;
        }

        setLoading(true);
        try {
            await apiService.updateVideo(videoId, title, description);
            setVideoData(prev => ({ ...prev, title, description }));
            toast({
                title: 'Video updated successfully',
                description: 'Your video title and description have been saved.',
            });
            return true;
        } catch (error) {
            console.error('Error updating video:', error);
            toast({
                title: 'Error updating video',
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
            fetchVideo();
        }
    }, [videoId]);

    return {
        videoData,
        loading,
        editTitle,
        setEditTitle,
        editDescription,
        setEditDescription,
        updateVideo,
        refetchVideo: fetchVideo
    };
};
