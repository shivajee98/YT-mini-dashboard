// auth/youtube-auth.ts
import dotenv from 'dotenv';
dotenv.config();

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

class YouTubeAuth {
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.accessToken = process.env.YOUTUBE_ACCESS_TOKEN || null;
    }

    private async refreshAccessToken(): Promise<string> {
        const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
        const clientId = process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

        if (!refreshToken || !clientId || !clientSecret) {
            throw new Error('Missing OAuth credentials in environment variables');
        }

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
        }

        const data: TokenResponse = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('✅ YouTube access token refreshed successfully');
        return this.accessToken;
    }

    async getValidAccessToken(): Promise<string> {
        // If no token or token is expired, refresh it
        if (!this.accessToken || Date.now() >= this.tokenExpiry - 60000) { // Refresh 1 minute before expiry
            await this.refreshAccessToken();
        }

        return this.accessToken!;
    }
}

export const youtubeAuth = new YouTubeAuth();
