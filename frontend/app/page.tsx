"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Eye,
  ThumbsUp,
  MessageCircle,
  Edit3,
  Save,
  Trash2,
  Plus,
  Calendar,
  Clock,
  User,
  Activity,
  Loader2,
} from "lucide-react"

// Custom hooks
import { useVideo } from "../hooks/useVideo"
import { useComments } from "../hooks/useComments"
import { useNotes } from "../hooks/useNotes"
import { useEventLogs } from "../hooks/useEventLogs"

export default function YouTubeDashboard() {
  const VIDEO_ID = "lRfEFyfOnro"

  // State for form inputs
  const [newComment, setNewComment] = useState("")
  const [newNote, setNewNote] = useState("")
  const [replyText, setReplyText] = useState("")

  // Custom hooks
  const {
    videoData,
    loading: videoLoading,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    updateVideo,
  } = useVideo(VIDEO_ID)

  const {
    comments,
    loading: commentsLoading,
    replyingTo,
    setReplyingTo,
    addComment,
    addReply,
    deleteComment,
    refetchComments
  } = useComments(VIDEO_ID)

  const {
    notes,
    addNote,
    deleteNote
  } = useNotes()

  const {
    eventLogs,
    loading: eventsLoading,
    refetchEvents
  } = useEventLogs()

  // Handlers
  const handleSaveVideo = async () => {
    const success = await updateVideo(editTitle, editDescription)
    if (success) {
      refetchEvents() // Refresh event logs after successful update
    }
  }

  const handleAddComment = async () => {
    const success = await addComment(newComment)
    if (success) {
      setNewComment("")
      refetchEvents()
    }
  }

  const handleAddReply = async (commentId: string) => {
    const success = await addReply(commentId, replyText)
    if (success) {
      setReplyText("")
      refetchEvents()
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId)
    if (success) {
      refetchEvents()
    }
  }

  const handleAddNote = async () => {
    const success = await addNote(newNote)
    if (success) {
      setNewNote("")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
  }

  const handleResetForm = () => {
    if (videoData) {
      setEditTitle(videoData.title)
      setEditDescription(videoData.description)
    }
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyText("")
  }

  if (videoLoading && !videoData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!videoData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-muted-foreground">The requested video could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">YouTube Companion Dashboard</h1>
          <p className="text-muted-foreground">Manage your video content and engagement</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Video</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Video Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={videoData.thumbnailUrl || "/placeholder.svg"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{videoData.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{videoData.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{videoData.status}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {videoData.duration}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <div className="text-2xl font-bold">{videoData.viewCount?.toLocaleString() || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm font-medium">Likes</span>
                      </div>
                      <div className="text-2xl font-bold">{videoData.likeCount || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Comments</span>
                      </div>
                      <div className="text-2xl font-bold">{comments.length || 0}</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Published</span>
                      </div>
                      <div className="text-sm font-bold">
                        {new Date(videoData.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Edit Video Details
                </CardTitle>
                <CardDescription>Update your video title and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter video title"
                    disabled={videoLoading}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter video description"
                    rows={6}
                    disabled={videoLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveVideo}
                    className="flex items-center gap-2"
                    disabled={videoLoading}
                  >
                    {videoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetForm}
                    disabled={videoLoading}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
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
                                {comment.author === "You" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-destructive hover:text-destructive"
                                    disabled={commentsLoading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
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
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Notes</CardTitle>
                <CardDescription>Keep track of ideas to improve your video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Add a note</label>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write your improvement idea..."
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    className="flex items-center gap-2"
                    disabled={!newNote.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No notes yet.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{note.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Logs
                  {eventsLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
                <CardDescription>Track all actions performed on your video</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {eventLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No activity logs yet.</p>
                    ) : (
                      eventLogs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">{log.action}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
