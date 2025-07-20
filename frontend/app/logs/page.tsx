"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEventLogs } from "@/hooks/useEventLogs";
import { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb } from "@radix-ui/react-scroll-area";
import { TabsContent } from "@radix-ui/react-tabs";
import { Activity, Loader2, User } from "lucide-react";

// Clean up the log type
interface EventLog {
    id: string;
    action: string;
    timestamp: string | Date;
    details: string;
}

export default function Logs() {
    const { eventLogs, loading: eventsLoading, refetchEvents } = useEventLogs();

    return (
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
                <ScrollArea className="h-96 w-full">
                    <ScrollAreaViewport className="h-full w-full">
                        <div className="space-y-3 pr-4">
                            {eventLogs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No activity logs yet.</p>
                            ) : (
                                eventLogs.map((log: EventLog) => (
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
                    </ScrollAreaViewport>
                    <ScrollAreaScrollbar orientation="vertical">
                        <ScrollAreaThumb />
                    </ScrollAreaScrollbar>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
