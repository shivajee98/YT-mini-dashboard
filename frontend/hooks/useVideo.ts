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

    // In your useVideo hook
    const updateVideo = async (title: string, description: string) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3006/api/video/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Update failed:', errorData.error);
                alert(`Failed to update video: ${errorData.error}`);
                return false;
            }

            const result = await response.json();
            console.log('Video updated successfully:', result);

            // Update local state
            if (videoData) {
                setVideoData({
                    ...videoData,
                    title: title,
                    description: description
                });
            }

            alert('Video updated successfully on YouTube!');
            return true;
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Network error while updating video');
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
