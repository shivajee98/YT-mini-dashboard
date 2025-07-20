import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEventLogs } from "@/hooks/useEventLogs";
import { useVideo } from "@/hooks/useVideo";
import { TabsContent } from "@radix-ui/react-tabs";
import { Edit3, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoContext } from "../video/[videoId]/VideoContext";

export default function EditVideo() {
    const { videoId } = useVideoContext();
    const {
        videoData,
        loading: videoLoading,
        editTitle,
        setEditTitle,
        editDescription,
        setEditDescription,
        updateVideo,
    } = useVideo(videoId);
    const { eventLogs, refetchEvents } = useEventLogs();


    const handleSaveVideo = async () => {
        const success = await updateVideo(editTitle, editDescription);
        if (success) refetchEvents();
    };

    const handleResetForm = () => {
        if (videoData) {
            setEditTitle(videoData.title);
            setEditDescription(videoData.description);
        }
    };

    return (

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
                    <Button onClick={handleSaveVideo} className="flex items-center gap-2" disabled={videoLoading}>
                        {videoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleResetForm} disabled={videoLoading}>
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}