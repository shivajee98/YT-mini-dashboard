"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    const router = useRouter();

    const handleYouTubeAuth = () => {
        // Environment-aware URL
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005';
        window.location.href = `${backendUrl}/auth/youtube`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
            {/* Background image overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20 z-0"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1950&q=80')",
                }}
            />

            {/* Content */}
            <div className="z-10 text-center px-4">
                <h1 className="text-5xl font-extrabold mb-4">
                    YouTube Companion Dashboard
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto">
                    Manage your video notes, comments, logs and insights — all in one
                    place.
                </p>

                <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg rounded-full transition-all duration-300 shadow-lg"
                    onClick={handleYouTubeAuth}
                >
                    🚀 Get Started with Google
                </Button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-gray-500 text-sm z-10">
                Built for creators. Powered by Next.js.
            </div>
        </div>
    );
}
