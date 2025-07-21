"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Video = {
    id: string;
    title: string;
    thumbnail: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005'

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/user/videos`, {
                    method: 'GET',
                    credentials: 'include', // 🔑 This sends cookies!
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log('API Response:', data);

                const mappedVideos = data.videos?.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    thumbnail: item.thumbnailUrl,
                })) || [];

                setVideos(mappedVideos);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <p>Loading your videos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div className="text-center">
                    <p className="mb-4">No videos found.</p>
                    <button
                        onClick={() => router.push('/auth/youtube')}
                        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                    >
                        Connect YouTube
                    </button>
                </div>
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
                        onClick={() => router.push(`/video/${video.id}`)}
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
