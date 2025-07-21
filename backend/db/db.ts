import mongoose from 'mongoose';

export const connectToMongoDB = async () => {
    try {
        const uri = process.env.DB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(uri, {
            dbName: 'yt-dashboard'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};
