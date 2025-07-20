import mongoose, { Schema, model } from 'mongoose';

const eventLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    details: {
        type: String,
        required: true,
        maxlength: 1000
    }
}, {
    timestamps: true,
    collection: 'eventlogs'
});


// Create indexes for better query performance
eventLogSchema.index({ action: 1, timestamp: -1 });
eventLogSchema.index({ timestamp: -1 });

const EventLog = model('EventLog', eventLogSchema);

export default EventLog;
