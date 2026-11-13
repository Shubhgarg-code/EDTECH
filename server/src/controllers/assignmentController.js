import { AssignmentSubmission } from '../models/AssignmentSubmission.js';
import { Course } from '../models/Course.js';

export const submitAssignment = async (req, res, next) => {
  try {
    const { courseId, assignmentId, title, githubUrl, liveUrl, submissionNotes } = req.body;
    const userId = req.user._id;

    if (!courseId || !assignmentId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, Assignment ID, and Title are required.'
      });
    }

    // Check if previously submitted
    let submission = await AssignmentSubmission.findOne({
      course: courseId,
      assignmentId,
      user: userId
    });

    if (submission) {
      submission.title = title;
      submission.githubUrl = githubUrl || submission.githubUrl;
      submission.liveUrl = liveUrl || submission.liveUrl;
      submission.submissionNotes = submissionNotes || submission.submissionNotes;
      submission.status = 'submitted';
      await submission.save();

      return res.status(200).json({
        success: true,
        message: 'Assignment re-submitted successfully!',
        submission
      });
    }

    submission = await AssignmentSubmission.create({
      course: courseId,
      assignmentId,
      user: userId,
      title,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      submissionNotes: submissionNotes || '',
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSubmissions = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const submissions = await AssignmentSubmission.find({
      course: courseId,
      user: userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all assignment submissions
export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await AssignmentSubmission.find()
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Grade submission
export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, status } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.score = score !== undefined ? Number(score) : submission.score;
    submission.feedback = feedback !== undefined ? feedback : submission.feedback;
    submission.status = status || 'reviewed';
    submission.reviewedBy = req.user.name;
    submission.reviewedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};

