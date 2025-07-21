"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useComments } from "@/hooks/useComments";
import { useEventLogs } from "@/hooks/useEventLogs";
import { Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useVideoContext } from "@/app/video/[videoId]/VideoContext";

export default function Comments() {
    const { videoId } = useVideoContext();
    const {
        comments,
        loading: commentsLoading,
        replyingTo,
        setReplyingTo,
        addComment,
        addReply,
        deleteCommentOrReply,
    } = useComments(videoId);

    const [newComment, setNewComment] = useState("");
    const { eventLogs, loading: eventsLoading, refetchEvents } = useEventLogs();
    const [replyText, setReplyText] = useState("");

    const handleAddComment = async () => {
        const success = await addComment(newComment);
        if (success) {
            setNewComment("");
            refetchEvents();
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const success = await deleteCommentOrReply(commentId);
        if (success) refetchEvents();
    };

    const handleAddReply = async (commentId: string) => {
        const success = await addReply(commentId, replyText);
        if (success) {
            setReplyText("");
            setReplyingTo(null);
            refetchEvents();
        }
    };

    // Add the missing function
    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments Management
                    {commentsLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add a comment</label>
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                        rows={3}
                        disabled={commentsLoading}
                    />
                    <Button
                        onClick={handleAddComment}
                        className="flex items-center gap-2"
                        disabled={commentsLoading || !newComment.trim()}
                    >
                        <Plus className="h-4 w-4" />
                        Add Comment
                    </Button>
                </div>
                <Separator />
                <ScrollArea className="h-96">
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No comments yet.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="border rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} />
                                            <AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{comment.author}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(comment.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-2">{comment.text}</p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setReplyingTo(comment.id)}
                                                    disabled={commentsLoading}
                                                >
                                                    Reply
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-destructive hover:text-destructive"
                                                    disabled={commentsLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {comment.likeCount || 0} likes
                                                </span>
                                            </div>
                                            {replyingTo === comment.id && (
                                                <div className="mt-3 space-y-2">
                                                    <Textarea
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder="Write your reply..."
                                                        rows={2}
                                                        disabled={commentsLoading}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddReply(comment.id)}
                                                            disabled={commentsLoading || !replyText.trim()}
                                                        >
                                                            Reply
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleCancelReply}
                                                            disabled={commentsLoading}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-3 ml-4 space-y-2">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex items-start gap-2 p-2 bg-muted rounded">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={reply.authorAvatar || "/placeholder.svg"} />
                                                                <AvatarFallback>{reply.author.slice(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-medium text-xs">{reply.author}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(reply.publishedAt).toLocaleDateString()}
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteComment(reply.id)}
                                                                        className="text-destructive hover:text-destructive ml-auto"
                                                                        disabled={commentsLoading}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <p className="text-xs">{reply.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
