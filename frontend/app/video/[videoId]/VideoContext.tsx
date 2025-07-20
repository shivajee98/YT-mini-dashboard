"use client";

import { createContext, useContext, ReactNode } from 'react';

interface VideoContextType {
    videoId: string;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

interface VideoProviderProps {
    children: ReactNode;
    videoId: string;
}

export function VideoProvider({ children, videoId }: VideoProviderProps) {
    return (
        <VideoContext.Provider value={{ videoId }}>
            {children}
        </VideoContext.Provider>
    );
}

export function useVideoContext() {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error('useVideoContext must be used within a VideoProvider');
    }
    return context;
}
