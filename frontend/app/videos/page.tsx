"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define a basic video type
type Video = {
    id: string;
    title: string;
    thumbnail: string;
};

const BASE_URL = 'http://localhost:3006/api';

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch(`${BASE_URL}/user/videos`);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log('API Response:', data); // Debug log

                // Use data.videos instead of data.items
                const mappedVideos = data.videos?.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    thumbnail: item.thumbnailUrl, // Note: changed from thumbnails.medium.url
                })) || [];

                setVideos(mappedVideos);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p>Loading your videos...</p>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p>No videos found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 px-6 py-10 text-white">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Your Uploaded YouTube Videos ({videos.length})
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <div
                        key={video.id}
                        className="bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer hover:scale-[1.02] hover:shadow-lg transition"
                        onClick={() => router.push(`/video/${video.id}`)} // Fixed route
                    >
                        <Image
                            src={video.thumbnail}
                            alt={video.title}
                            width={320}
                            height={180}
                            className="w-full object-cover"
                        />
                        <div className="p-4">
                            <p className="text-sm font-semibold line-clamp-2">
                                {video.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
