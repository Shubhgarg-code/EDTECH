import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';
import crypto from 'crypto';

export const getLmsClassroomData = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Verify enrollment
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(
      (item) => item.course.toString() === course._id.toString()
    ) || user.role === 'admin';

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course. Please enroll to access the classroom.'
      });
    }

    // Find or initialize progress
    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      // Find first lecture if available
      let firstLectureId = null;
      if (course.modules && course.modules.length > 0 && course.modules[0].lectures.length > 0) {
        firstLectureId = course.modules[0].lectures[0]._id;
      }

      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLectures: [],
        currentLectureId: firstLectureId,
        percentage: 0
      });
    }

    res.status(200).json({
      success: true,
      course,
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const updateLectureProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lectureId, completed, lastWatchTimeSeconds } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = new Progress({
        user: userId,
        course: courseId,
        completedLectures: []
      });
    }

    if (lectureId) {
      progress.currentLectureId = lectureId;
    }

    if (lastWatchTimeSeconds !== undefined) {
      progress.lastWatchTimeSeconds = Number(lastWatchTimeSeconds);
    }

    if (completed !== undefined && lectureId) {
      const lectureObjId = lectureId.toString();
      const isAlreadyCompleted = progress.completedLectures.some(
        (id) => id.toString() === lectureObjId
      );

      if (completed && !isAlreadyCompleted) {
        progress.completedLectures.push(lectureId);
      } else if (!completed && isAlreadyCompleted) {
        progress.completedLectures = progress.completedLectures.filter(
          (id) => id.toString() !== lectureObjId
        );
      }
    }

    // Calculate percentage
    let totalLectures = 0;
    course.modules.forEach((mod) => {
      totalLectures += mod.lectures ? mod.lectures.length : 0;
    });

    if (totalLectures > 0) {
      const pct = Math.round((progress.completedLectures.length / totalLectures) * 100);
      progress.percentage = Math.min(100, Math.max(0, pct));
    } else {
      progress.percentage = 0;
    }

    // Check completion condition
    if (progress.percentage >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      if (!progress.certificateId) {
        progress.certificateId = `MATH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      }
    }

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      progress
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateData = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    const progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress || !progress.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Course is not yet 100% completed. Complete all lectures to unlock certificate.'
      });
    }

    res.status(200).json({
      success: true,
      certificate: {
        certificateId: progress.certificateId,
        studentName: user.name,
        courseTitle: course.title,
        instructorName: course.instructor.name,
        completedAt: progress.completedAt || new Date(),
        batchName: course.batchName,
        verificationUrl: `${req.protocol}://${req.get('host')}/verify-certificate/${progress.certificateId}`
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrolledDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'enrolledCourses.course'
    });

    const enrolledCourseIds = user.enrolledCourses
      .filter((item) => item.course)
      .map((item) => item.course._id);

    const progressRecords = await Progress.find({
      user: userId,
      course: { $in: enrolledCourseIds }
    }).populate('course');

    // Aggregate learning statistics
    const totalCourses = enrolledCourseIds.length;
    const completedCourses = progressRecords.filter((p) => p.isCompleted).length;
    let totalCompletedLectures = 0;
    progressRecords.forEach((p) => {
      totalCompletedLectures += p.completedLectures ? p.completedLectures.length : 0;
    });

    // Estimate learning hours (~20 min per completed lecture)
    const totalHoursLearned = (totalCompletedLectures * 0.35).toFixed(1);

    res.status(200).json({
      success: true,
      stats: {
        totalCourses,
        completedCourses,
        totalCompletedLectures,
        totalHoursLearned
      },
      enrolledCourses: user.enrolledCourses,
      progressList: progressRecords
    });
  } catch (error) {
    next(error);
  }
};

