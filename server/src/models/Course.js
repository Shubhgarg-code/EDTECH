import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'document', 'github', 'zip', 'link', 'other'], default: 'link' },
  source: { type: String, enum: ['upload', 'external'], default: 'external' }
});

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  chapterTitle: { type: String, default: '' },
  videoSource: { type: String, enum: ['upload', 'external'], default: 'external' },
  videoUrl: { type: String, required: true },
  duration: { type: String, default: '15:00' },
  durationSeconds: { type: Number, default: 900 },
  isFreePreview: { type: Boolean, default: false },
  notesSource: { type: String, enum: ['upload', 'external', 'text'], default: 'text' },
  notesUrl: { type: String, default: '' },
  notesContent: { type: String, default: '' },
  codeSnippet: { type: String, default: '' },
  resources: [resourceSchema],
  order: { type: Number, default: 1 }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 1 },
  lectures: [lectureSchema]
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  moduleTitle: { type: String, default: 'General' },
  referenceFileUrl: { type: String, default: '' },
  starterCode: { type: String, default: '' },
  solutionGuide: { type: String, default: '' },
  dueDate: { type: String, default: 'Flexible' },
  maxMarks: { type: Number, default: 100 }
});

const instructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: 'Instructor' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' }
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      default: 'General'
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels'
    },
    thumbnail: { type: String, required: true },
    promoVideoUrl: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    duration: { type: String, default: 'Self-paced' },
    batchName: { type: String, default: 'Cohort 2026' },
    startDate: { type: String, default: 'Immediate Access' },
    schedule: { type: String, default: 'Self-paced Learning' },
    features: [{ type: String }],
    prerequisites: [{ type: String }],
    syllabusSummary: [{ type: String }],
    modules: [moduleSchema],
    assignments: [assignmentSchema],
    instructor: instructorSchema,
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    totalEnrolled: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// Virtual for total lecture count
courseSchema.virtual('totalLectures').get(function () {
  if (!this.modules) return 0;
  return this.modules.reduce((acc, mod) => acc + (mod.lectures ? mod.lectures.length : 0), 0);
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export const Course = mongoose.model('Course', courseSchema);
