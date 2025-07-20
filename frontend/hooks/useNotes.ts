import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useNotes = () => {
    const [notes, setNotes] = useState([
        {
            id: "1",
            content: "Add more examples in the beginning section",
            createdAt: "2024-01-18T10:00:00Z",
        },
        {
            id: "2",
            content: "Consider adding captions for better accessibility",
            createdAt: "2024-01-18T11:30:00Z",
        },
    ]);

    const addNote = async (content: string) => {
        if (!content.trim()) return false;

        const note = {
            id: Date.now().toString(),
            content,
            createdAt: new Date().toISOString(),
        };

        setNotes(prev => [note, ...prev]);
        toast({
            title: 'Note added',
            description: 'Your improvement note has been saved.',
        });
        return true;
    };

    const deleteNote = async (noteId: string) => {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        toast({
            title: 'Note deleted',
            description: 'Your note has been removed.',
        });
        return true;
    };

    return {
        notes,
        addNote,
        deleteNote
    };
};
