-- YouTube Companion Dashboard Database Schema

-- Videos table to store video metadata
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'unlisted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notes table for video improvement ideas
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Event logs table for tracking all actions
CREATE TABLE IF NOT EXISTS event_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    video_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE SET NULL
);

-- Comments cache table (optional - for caching YouTube comments)
CREATE TABLE IF NOT EXISTS comments_cache (
    id VARCHAR(255) PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255),
    author_avatar VARCHAR(500),
    text TEXT NOT NULL,
    published_at TIMESTAMP,
    like_count INTEGER DEFAULT 0,
    parent_id VARCHAR(255), -- For replies
    is_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Users table (if implementing user authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    youtube_channel_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_video_id ON notes(video_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_video_id ON event_logs(video_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_timestamp ON event_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_comments_cache_video_id ON comments_cache(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_cache_parent_id ON comments_cache(parent_id);

-- Insert sample data
INSERT INTO videos (id, title, description, duration, view_count, like_count, comment_count, published_at, status) 
VALUES (
    'dQw4w9WgXcQ',
    'My Awesome Video Tutorial',
    'This is a comprehensive tutorial about web development using modern technologies.',
    '15:42',
    1250,
    89,
    23,
    '2024-01-15 10:30:00',
    'unlisted'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO notes (video_id, content) VALUES 
('dQw4w9WgXcQ', 'Add more examples in the beginning section'),
('dQw4w9WgXcQ', 'Consider adding captions for better accessibility')
ON CONFLICT DO NOTHING;

INSERT INTO event_logs (action, details, video_id) VALUES 
('Video created', 'Initial video upload', 'dQw4w9WgXcQ'),
('Note added', 'Added improvement suggestion', 'dQw4w9WgXcQ')
ON CONFLICT DO NOTHING;
