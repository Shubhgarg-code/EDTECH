import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true // in bytes
    },
    url: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      default: 'other'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for formatted size
mediaSchema.virtual('formattedSize').get(function () {
  if (this.size < 1024) return `${this.size} B`;
  if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`;
  return `${(this.size / (1024 * 1024)).toFixed(1)} MB`;
});

mediaSchema.set('toJSON', { virtuals: true });
mediaSchema.set('toObject', { virtuals: true });

export const Media = mongoose.model('Media', mediaSchema);
