import mongoose, { Schema, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import type { IUser } from '../types.ts';

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    id: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    youtube: {
        channelId: { type: String, sparse: true, unique: true },
        channelTitle: String,
        channelThumbnail: String,
        accessToken: { type: String, select: false },
        refreshToken: { type: String, select: false },
        tokenExpiresAt: Date,
        subscriberCount: { type: Number, default: 0 },
        videoCount: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete (ret as any).__v;
            delete ret.youtube?.accessToken;
            delete ret.youtube?.refreshToken;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// JWT Methods
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
    return token;
};


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        userId: this._id,
        type: 'refresh'
    }, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret', {
        expiresIn: '30d'
    });
};

// YouTube Token Methods - Fixed to match your schema structure
userSchema.methods.updateYouTubeTokens = async function (tokens: any) {
    // Initialize youtube object if it doesn't exist
    if (!this.youtube) {
        this.youtube = {};
    }

    this.youtube.accessToken = tokens.access_token;
    this.youtube.refreshToken = tokens.refresh_token;
    this.youtube.tokenExpiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000); // 1 hour default

    await this.save();
};

userSchema.methods.getYouTubeTokens = function () {
    if (!this.youtube) {
        return null;
    }

    return {
        access_token: this.youtube.accessToken,
        refresh_token: this.youtube.refreshToken,
        expiry_date: this.youtube.tokenExpiresAt?.getTime()
    };
};

userSchema.methods.isYouTubeTokenValid = function () {
    return this.youtube?.tokenExpiresAt && this.youtube.tokenExpiresAt > new Date();
};

userSchema.methods.hasYouTubeAuth = function () {
    return !!(this.youtube?.refreshToken && this.youtube?.accessToken);
};

// Optional: Method to clear YouTube authentication
userSchema.methods.clearYouTubeAuth = async function () {
    if (this.youtube) {
        this.youtube.accessToken = undefined;
        this.youtube.refreshToken = undefined;
        this.youtube.tokenExpiresAt = undefined;
        await this.save();
    }
};

export default mongoose.model<IUser>('User', userSchema);
