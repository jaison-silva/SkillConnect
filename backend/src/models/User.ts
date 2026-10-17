import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../constants/enums.js';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  googleId?: string;
  isVerified: boolean;
  isBlocked: boolean;
  strikeCount: number;
  otp?: {
    codeHash?: string;
    expiresAt?: Date;
  };
  location?: {
    type: 'Point';
    coordinates: number[];
  };
  providerProfile?: {
    skills: string[];
    hourlyRate: number;
    connectedAccountId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true,
    },
    googleId: { type: String, sparse: true }, 
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    strikeCount: { type: Number, default: 0 },
    otp: {
      codeHash: { type: String },
      expiresAt: { type: Date },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    providerProfile: {
      skills: [{ type: String }],
      hourlyRate: { type: Number, default: 0 },
      connectedAccountId: { type: String },
    },
  },
  { timestamps: true }
);


UserSchema.index({ location: '2dsphere' });


UserSchema.index({ name: 'text', email: 'text' });

export default mongoose.model<IUser>('User', UserSchema);