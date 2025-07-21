"use client"

import { useParams } from "next/navigation";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import Link from "next/link";

// Import components, not page files
import { VideoProvider } from "./VideoContext";
import Overview from "@/components/VideoTabs/OverView";
import EditVideo from "@/components/VideoTabs/EditVideo";
import Comments from "@/components/VideoTabs/Comments";
import Notes from "@/components/VideoTabs/Notes";
import Logs from "@/components/VideoTabs/Logs";

export default function VideoDetailPage() {
    const params = useParams();
    const videoId = params.videoId as string;

    return (
        <VideoProvider videoId={videoId}>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-blue-800 mb-2">
                            <Link href="/" className="hover:underline">
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
