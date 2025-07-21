// components/VideoTabs/Overview.tsx
"use client";

import { useVideoContext } from "@/app/video/[videoId]/VideoContext";
// Your overview component logic here

export default function Overview() {
    const { videoId } = useVideoContext();

    return (
        <div>
            <Overview />
        </div>
    );
}
