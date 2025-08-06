import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId;
  venue: string;
  purpose: string;
  date: Date;
  startTime: string;
  endTime: string;
  participantCount: number;
  organizerName: string;
  organizerOrganization?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  venue: {
    type: String,
    required: true,
    trim: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(time: string) {
        // Validate time format (HH:MM) and within business hours (8:00-17:00)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) return false;
        
        const [hours] = time.split(':').map(Number);
        return hours >= 8 && hours < 17;
      },
      message: 'Start time must be between 8:00 AM and 5:00 PM'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(time: string) {
        // Validate time format (HH:MM) and within business hours (8:00-17:00)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) return false;
        
        const [hours] = time.split(':').map(Number);
        return hours >= 8 && hours <= 17;
      },
      message: 'End time must be between 8:00 AM and 5:00 PM'
    }
  },
  participantCount: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    validate: {
      validator: Number.isInteger,
      message: 'Participant count must be a whole number'
    }
  },
  organizerName: {
    type: String,
    required: true,
    trim: true
  },
  organizerOrganization: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ReservationSchema.index({ userId: 1 });
ReservationSchema.index({ date: 1, venue: 1 });
ReservationSchema.index({ status: 1 });

export const Reservation = mongoose.model<IReservation>('Reservation', ReservationSchema);
