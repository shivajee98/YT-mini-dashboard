import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiService } from '../app/api/ApiService';
import { Note } from '@/app/types/types';

export const useNotes = (videoId: string) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial fetch on mount or videoId change
    useEffect(() => {
        if (videoId) fetchNotes();
    }, [videoId]);

    const fetchNotes = async () => {
        if (!videoId) return;

        setLoading(true);
        try {
            const fetchedNotes = await apiService.getNotes(videoId);
            setNotes(fetchedNotes);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            toast({
                title: 'Error',
                description: 'Failed to load notes.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const addNote = async (content: string) => {
        if (!content.trim() || !videoId) return false;

        setLoading(true);
        try {
            await apiService.addNote(videoId, { content });
            await fetchNotes(); // 💡 Refetch after add
            toast({
                title: 'Note added',
                description: 'Your improvement note has been saved.',
            });
            return true;
        } catch (error) {
            console.error('Failed to add note:', error);
            toast({
                title: 'Error',
                description: 'Failed to save note.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateNote = async (
        noteId: string,
        updates: {
            content?: string;
            tags?: string[];
            priority?: string;
            category?: string;
            completed?: boolean;
        }
    ) => {
        if (!noteId) return false;

        setLoading(true);
        try {
            await apiService.updateNote(noteId, updates);
            await fetchNotes(); // 💡 Refetch after update
            toast({
                title: 'Note updated',
                description: 'Your note has been successfully updated.',
            });
            return true;
        } catch (error) {
            console.error('Failed to update note:', error);
            toast({
                title: 'Error',
                description: 'Failed to update note.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        if (!noteId) return false;

        setLoading(true);
        try {
            await apiService.deleteNote(noteId);
            await fetchNotes(); // 💡 Refetch after delete
            toast({
                title: 'Note deleted',
                description: 'Your note has been removed.',
            });
            return true;
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete note.',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        notes,
        loading,
        addNote,
        updateNote,
        deleteNote,
        refetchNotes: fetchNotes, // exposed for manual refresh
    };
};
