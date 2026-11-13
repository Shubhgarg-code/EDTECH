import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Progress } from '../models/Progress.js';
import { Media } from '../models/Media.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { AssignmentSubmission } from '../models/AssignmentSubmission.js';

// Real Dashboard Metrics (Zero fabricated data)
export const getPlatformOverview = async (req, res, next) => {
  try {
    const [
      totalCourses,
      totalPublishedCourses,
      totalDraftCourses,
      totalStudents,
      totalMedia,
      totalContactInquiries,
      unreadInquiries,
      totalSubmissions,
      recentStudents,
      recentCourses,
      recentMedia
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Course.countDocuments({ isPublished: false }),
      User.countDocuments({ role: 'student' }),
      Media.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'unread' }),
      AssignmentSubmission.countDocuments(),
      User.find({ role: 'student' }).select('name email createdAt avatar').sort({ createdAt: -1 }).limit(5),
      Course.find().select('title slug isPublished createdAt totalEnrolled').sort({ createdAt: -1 }).limit(5),
      Media.find().select('originalName category size createdAt url').sort({ createdAt: -1 }).limit(5)
    ]);

    // Build real activity timeline
    const activity = [];

    recentStudents.forEach((s) => {
      activity.push({
        type: 'student_registered',
        title: `New student registration: ${s.name}`,
        detail: s.email,
        timestamp: s.createdAt
      });
    });

    recentCourses.forEach((c) => {
      activity.push({
        type: 'course_activity',
        title: `Course: ${c.title}`,
        detail: c.isPublished ? 'Status: Published' : 'Status: Draft',
        timestamp: c.createdAt
      });
    });

    recentMedia.forEach((m) => {
      activity.push({
        type: 'media_upload',
        title: `File uploaded: ${m.originalName}`,
        detail: `Type: ${m.category} (${(m.size / 1024).toFixed(0)} KB)`,
        timestamp: m.createdAt
      });
    });

    // Sort combined activity descending
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const overviewStats = {
      totalCourses,
      totalPublishedCourses,
      totalDraftCourses,
      totalStudents,
      totalMedia,
      totalContactInquiries,
      unreadInquiries,
      totalSubmissions
    };

    res.status(200).json({
      success: true,
      stats: overviewStats,
      analytics: overviewStats,
      recentActivity: activity.slice(0, 10),
      recentCourses,
      recentStudents
    });
  } catch (error) {
    next(error);
  }
};

// Student Management
export const getAllStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .populate('enrolledCourses.course', 'title slug thumbnail category price')
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// Get single student learning details
export const getStudentDetails = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId)
      .populate('enrolledCourses.course')
      .select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const progressRecords = await Progress.find({ user: studentId }).populate('course', 'title slug');
    const submissions = await AssignmentSubmission.find({ user: studentId }).populate('course', 'title');

    res.status(200).json({
      success: true,
      student,
      progress: progressRecords,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// Toggle student course enrollment
export const toggleCourseEnrollment = async (req, res, next) => {
  try {
    const { userId, courseId, action } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ success: false, message: 'User or course not found.' });
    }

    const enrolledIndex = user.enrolledCourses.findIndex(
      (item) => item.course && item.course.toString() === courseId.toString()
    );

    if (action === 'grant' && enrolledIndex === -1) {
      user.enrolledCourses.push({
        course: courseId,
        enrolledAt: new Date(),
        orderId: `admin_granted_${Date.now()}`
      });
      await course.updateOne({ $inc: { totalEnrolled: 1 } });

      // Initialize progress
      await Progress.create({
        user: userId,
        course: courseId,
        completedLectures: [],
        percentage: 0
      });
    } else if (action === 'revoke' && enrolledIndex !== -1) {
      user.enrolledCourses.splice(enrolledIndex, 1);
      await course.updateOne({ $inc: { totalEnrolled: -1 } });
      await Progress.findOneAndDelete({ user: userId, course: courseId });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Course enrollment successfully ${action === 'grant' ? 'granted' : 'revoked'}.`,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    next(error);
  }
};
