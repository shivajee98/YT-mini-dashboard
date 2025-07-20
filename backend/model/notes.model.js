// Add userId field to your notes schema
import mongoose, { Schema } from 'mongoose';

const noteSchema = new Schema({
    videoId: { type: String, required: true },
    userId: { type: String, required: true }, // Add this line
    content: { type: String, required: true },
    author: { type: String, default: 'You' },
    tags: [String],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['improvement', 'bug', 'feature', 'content'],
        default: 'improvement'
    },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
