import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],
    currentLectureId: {
      type: mongoose.Schema.Types.ObjectId
    },
    lastWatchTimeSeconds: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    certificateId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a user only has one progress document per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

export const Progress = mongoose.model('Progress', progressSchema);

