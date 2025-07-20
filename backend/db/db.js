import mongoose from 'mongoose';

export async function connectToMongoDB() {
    try {
        const uri = process.env.DB_URI;
        await mongoose.connect(uri, {
            dbName: 'yt-dashboard',
        });
        console.log('✅ Mongoose connected to MongoDB!');
    } catch (err) {
        console.error('❌ Error connecting Mongoose:', err);
        process.exit(1);
    }
}

