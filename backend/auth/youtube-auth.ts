// auth/youtube-auth.ts
import { google } from 'googleapis';
import User from '../model/user.model';
import jwt from 'jsonwebtoken';

const OAuth2 = google.auth.OAuth2;

class YouTubeAuth {
    private createOAuth2Client() {
        return new OAuth2(
            process.env.YOUTUBE_CLIENT_ID,
            process.env.YOUTUBE_CLIENT_SECRET,
            process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3005/auth/callback'
        );
    }

    getAuthUrl(userId: string) {
        const oauth2Client = this.createOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtube',
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            redirect_uri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3005/auth/callback',
            state: userId
        });
    }


    async getTokens(code: string, userId: string) {
        const oauth2Client = this.createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: profile } = await oauth2.userinfo.get();
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
            user.youtube.accessToken = tokens.access_token
            user.youtube.refreshToken = tokens.refresh_token
            await user.save();
        } else {
            // Generate unique username
            let username = profile.name;
            let existingUser = await User.findOne({ username });

            if (!profile?.email) {
                throw new Error('Google profile does not contain email.');
            }

            let counter = 1;
            while (existingUser) {
                username = `${profile.name} (${counter})`;
                existingUser = await User.findOne({ username });
                counter++;
            }

            user = await User.create({
                id: profile.id,           // ✅ Use 'id' instead of 'googleId'
                username: username,
                email: profile.email,
                youtube: {                // ✅ Properly structure YouTube data
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000)
                }
            });
        }
        await user.updateYouTubeTokens(tokens);
        return tokens;
    }
    async getValidAccessToken(id: string) {
        const user = await User.findOne({ id }).select('+youtube.accessToken +youtube.refreshToken');
        if (!user) throw new Error('User not found');
        const { accessToken, refreshToken } = user.youtube || {};
        if (!refreshToken) {
            throw new Error('No refresh token found for user. Re-authentication required.');
        }
        const oauth2Client = this.createOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        try {
            const { credentials } = await oauth2Client.refreshAccessToken();
            // Update stored tokens
            await user.updateYouTubeTokens(credentials);
            return credentials.access_token;
        } catch (error) {
            throw new Error('Authentication required - please re-authenticate');
        }
    }

    // Helper method to get authenticated YouTube API client for a user
    async getYouTubeClient(userId: string) {
        const accessToken = await this.getValidAccessToken(userId);
        const oauth2Client = this.createOAuth2Client();
        oauth2Client.setCredentials({ access_token: accessToken });

        return google.youtube({ version: 'v3', auth: oauth2Client });
    }
}

export default new YouTubeAuth();
