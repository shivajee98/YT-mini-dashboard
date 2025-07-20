"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Tabs,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";

import { TabsContent } from "@radix-ui/react-tabs";

// Create a context to share video ID across components
import { VideoProvider } from "./VideoContext";
import Overview from "@/app/overview/page";
import EditVideo from "@/app/edit/page";
import Comments from "@/app/comments/page";
import Notes from "@/app/notes/page";
import Logs from "@/app/logs/page";
import Link from "next/link";

export default function VideoDetailPage() {
    const params = useParams();
    const videoId = params.videoId as string;

    return (
        <VideoProvider videoId={videoId}>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">
                            <Link href="/videos" className="hover:underline">
                                Video Dashboard
                            </Link>
                        </h1>
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
                        <TabsContent value="overview"><Overview /></TabsContent>
                        <TabsContent value="edit"><EditVideo /></TabsContent>
                        <TabsContent value="comments"><Comments /></TabsContent>
                        <TabsContent value="notes"><Notes /></TabsContent>
                        <TabsContent value="logs"><Logs /></TabsContent>
                    </Tabs>
                </div>
            </div>
        </VideoProvider>
    );
}
