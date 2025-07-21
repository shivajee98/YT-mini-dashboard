"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVideo } from "@/hooks/useVideo";
import { TabsContent } from "@radix-ui/react-tabs";
import { Calendar, Clock, Eye, Loader2, MessageCircle, Play, ThumbsUp } from "lucide-react";
import Comments from "./Comments";
import { Badge } from "@/components/ui/badge";
import { useVideoContext } from "@/app/video/[videoId]/VideoContext";
export default function Overview() {
    const { videoId } = useVideoContext();


    const {
        videoData,
        loading: videoLoading,
    } = useVideo(videoId);

    if (videoLoading && !videoData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (!videoData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Video not found</h2>
                    <p className="text-muted-foreground">The requested video could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
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
                            <div className="text-2xl font-bold">{Comments.length || 0}</div>
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
    );
}