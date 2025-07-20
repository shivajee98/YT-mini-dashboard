import { useState, useEffect } from 'react';
import { apiService } from '../app/api/ApiService';
import { toast } from '@/hooks/use-toast';

export const useEventLogs = () => {
    const [eventLogs, setEventLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await apiService.getEvents();
            setEventLogs(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast({
                title: 'Error',
                description: 'Failed to load activity logs.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return {
        eventLogs,
        loading,
        refetchEvents: fetchEvents
    };
};
