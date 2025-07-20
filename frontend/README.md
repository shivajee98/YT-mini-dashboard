# YouTube Companion Dashboard

A comprehensive dashboard for managing YouTube videos with advanced features for content creators.

## Features

- **Video Management**: View and edit video details (title, description)
- **Comments System**: Add, reply to, and delete comments
- **Notes System**: Keep improvement notes for your videos
- **Activity Logging**: Track all actions performed
- **Analytics Dashboard**: View video statistics and engagement metrics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (recommended) / MongoDB / SQLite
- **External APIs**: YouTube Data API v3

## Setup Instructions

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables (see .env.example)
4. Set up your database
5. Run the development server: \`npm run dev\`

## Environment Variables

\`\`\`
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_oauth_client_secret
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
\`\`\`

## API Endpoints

### Video Management
- \`GET /api/video/[videoId]\` - Get video details
- \`PUT /api/video/[videoId]\` - Update video title and description

### Comments Management
- \`GET /api/comments/[videoId]\` - Get video comments
- \`POST /api/comments\` - Add a new comment or reply
- \`DELETE /api/comments?commentId=[id]\` - Delete a comment

### Notes Management
- \`GET /api/notes/[videoId]\` - Get notes for a video
- \`POST /api/notes/[videoId]\` - Create a new note
- \`DELETE /api/notes/[videoId]?noteId=[id]\` - Delete a note

### Event Logging
- \`POST /api/events\` - Log an event
- \`GET /api/events\` - Get all events

## Database Schema

### Videos Table
\`\`\`sql
CREATE TABLE videos (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  duration VARCHAR(20),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Notes Table
\`\`\`sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
\`\`\`

### Event Logs Table
\`\`\`sql
CREATE TABLE event_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  video_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE SET NULL
);
\`\`\`

### Comments Cache Table (Optional)
\`\`\`sql
CREATE TABLE comments_cache (
  id VARCHAR(255) PRIMARY KEY,
  video_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255),
  author_avatar VARCHAR(500),
  text TEXT NOT NULL,
  published_at TIMESTAMP,
  like_count INTEGER DEFAULT 0,
  parent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);
\`\`\`

## YouTube API Integration

### Required Scopes
- \`https://www.googleapis.com/auth/youtube\` - Manage YouTube account
- \`https://www.googleapis.com/auth/youtube.force-ssl\` - Manage YouTube account (SSL)

### API Endpoints Used
- **Videos**: \`youtube.videos.list\`, \`youtube.videos.update\`
- **Comments**: \`youtube.commentThreads.list\`, \`youtube.commentThreads.insert\`, \`youtube.comments.delete\`

## Features Implementation

### 1. Video Details Display
- Fetches video metadata from YouTube API
- Displays thumbnail, title, description, and analytics
- Shows video status (public, unlisted, private)

### 2. Video Editing
- Update video title and description
- Real-time preview of changes
- Validation and error handling

### 3. Comments Management
- Display all comments and replies
- Add new comments and replies
- Delete own comments
- Real-time updates

### 4. Notes System
- Create improvement notes for videos
- Edit and delete notes
- Persistent storage in database

### 5. Activity Logging
- Log all user actions
- Track timestamps and details
- Display activity history

## Security Considerations

- OAuth 2.0 authentication with YouTube
- API rate limiting
- Input validation and sanitization
- CSRF protection
- Secure environment variable handling

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
