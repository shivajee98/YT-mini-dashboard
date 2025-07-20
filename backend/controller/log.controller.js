import EventLog from "../model/logs.model";

export async function createLog(logData) {
    try {
        const newLog = new EventLog({
            id: logData.id || new mongoose.Types.ObjectId().toString(),
            action: logData.action,
            timestamp: new Date(logData.timestamp) || new Date(),
            details: logData.details
        });

        const savedLog = await newLog.save();
        return savedLog;
    } catch (error) {
        console.error('Error creating log:', error);
        throw error;
    }
}

// Get all logs
export async function getAllLogs() {
    return await EventLog.find().sort({ timestamp: -1 });
}

// Get logs by action
export async function getLogsByAction(action) {
    return await EventLog.find({ action }).sort({ timestamp: -1 });
}

// Get logs within date range
export async function getLogsByDateRange(startDate, endDate) {
    return await EventLog.find({
        timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ timestamp: -1 });
}
