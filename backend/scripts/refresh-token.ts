// scripts/get-refresh-token.ts
import express from 'express';
import open from 'open';

const app = express();
const CLIENT_ID = 'your_client_id';
const CLIENT_SECRET = 'your_client_secret';
const REDIRECT_URI = 'http://localhost:3005/auth/callback';

// Step 1: Generate authorization URL
app.get('/auth', (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${REDIRECT_URI}&` +
        `scope=https://www.googleapis.com/auth/youtube.force-ssl&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

    res.redirect(authUrl);
});

// Step 2: Handle callback and exchange code for tokens
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code as string;

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
            code: code
        })
    });

    const tokens = await response.json();
    console.log('🎉 Your tokens:');
    console.log('ACCESS_TOKEN:', tokens.access_token);
    console.log('REFRESH_TOKEN:', tokens.refresh_token);

    res.send(`
        <h1>Success!</h1>
        <p>Check your console for the tokens.</p>
        <p>Add YOUTUBE_REFRESH_TOKEN to your .env file.</p>
    `);
});

app.listen(3005, () => {
    console.log('Visit: http://localhost:3005/auth');
    open('http://localhost:3005/auth');
});
