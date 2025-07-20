"use client"

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  User,
} from "lucide-react";

import HomePage from "./home/page";
import VideosPage from "./videos/page";
import Logs from "./logs/page";
import Overview from "./overview/page";
import EditVideo from "./edit/page";
import Comments from "./comments/page";
import Notes from "./notes/page";
import { TabsContent } from "@radix-ui/react-tabs";

// Define a type for the user object for better type safety
interface User {
  channel: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export default function YouTubeDashboard() {

  // State for form inputs
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:3006/api/user/channel');
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3006/auth/status');
        const { authenticated } = await response.json();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuthStatus();
  }, []);



  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">YouTube Companion Dashboard</h1>
            <p className="text-muted-foreground">Manage your video content and engagement</p>
          </div>
          <HomePage />
          <VideosPage />
        </div>
      </div>
    </>
  );
}