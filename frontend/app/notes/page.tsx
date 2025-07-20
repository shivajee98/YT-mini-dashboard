"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { TabsContent } from "@radix-ui/react-tabs";
import { Check, Edit, Plus, Trash2, X } from "lucide-react";
import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import { useVideoContext } from "../video/[videoId]/VideoContext";


export default function Notes() {

    const { videoId } = useVideoContext();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<string>('');
    const [newNote, setNewNote] = useState("");
    const { notes, addNote, deleteNote, updateNote } = useNotes(videoId);


    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        const success = await addNote(newNote);
        if (success) setNewNote('');
    };

    const handleDeleteNote = async (noteId: string) => {
        await deleteNote(noteId);
    };

    const handleUpdateNote = async (noteId: string, updatedContent: string) => {
        if (!updatedContent.trim()) return;
        const success = await updateNote(noteId, { content: updatedContent });
        if (success) {
            setEditingNoteId(null);
            setEditedContent('');
        }
    };

    const handleStartEditNote = (noteId: SetStateAction<string | null>, currentContent: SetStateAction<string>) => {
        setEditingNoteId(noteId);
        setEditedContent(currentContent);
    };

    const handleCancelEditNote = () => {
        setEditingNoteId(null);
        setEditedContent('');
    };



    return (

        <Card>
            <CardHeader>
                <CardTitle>Improvement Notes</CardTitle>
                <CardDescription>Keep track of ideas to improve your video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {editingNoteId ? 'Update note' : 'Add a new note'}
                    </label>
                    <Textarea
                        value={editingNoteId ? editedContent : newNote}
                        onChange={(e) => editingNoteId ? setEditedContent(e.target.value) : setNewNote(e.target.value)}
                        placeholder={editingNoteId ? "Update your improvement idea..." : "Write a new improvement idea..."}
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Button
                            onClick={editingNoteId ? () => handleUpdateNote(editingNoteId, editedContent) : handleAddNote}
                            className="flex items-center gap-2"
                            disabled={editingNoteId ? !editedContent.trim() : !newNote.trim()}
                        >
                            {editingNoteId ? (
                                <><Check className="h-4 w-4" /> Update Note</>
                            ) : (
                                <><Plus className="h-4 w-4" /> Add Note</>
                            )}
                        </Button>
                        {editingNoteId && (
                            <Button onClick={handleCancelEditNote} variant="outline" className="flex items-center gap-2">
                                <X className="h-4 w-4" /> Cancel
                            </Button>
                        )}
                    </div>
                </div>
                <Separator />
                <div className="space-y-3">
                    {notes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No notes yet.</p>
                    ) : (
                        notes.map((note) => (
                            <div key={note._id} className="border rounded-lg p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm flex-1">{note.content}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleStartEditNote(note._id, note.content)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note._id)} className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(note.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}