import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { storageService } from '../services/storageService.js';
import { extractYouTubeId } from '../utils/youtube.js';

// Public: Get published courses
export const getAllCourses = async (req, res, next) => {
  try {
    const { category, level, search, sort } = req.query;
    let query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All') {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-low') sortOptions = { discountPrice: 1, price: 1 };
    if (sort === 'price-high') sortOptions = { discountPrice: -1, price: -1 };
    if (sort === 'popular') sortOptions = { totalEnrolled: -1 };

    const courses = await Course.find(query)
      .select('-modules.lectures.videoUrl -modules.lectures.notesContent')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all courses (including unpublished drafts)
export const adminGetAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// Public & Student: Get single course by slug
export const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check if user is admin or enrolled
    let isEnrolled = false;
    let isAdmin = false;

    if (req.user) {
      if (req.user.role === 'admin') {
        isAdmin = true;
        isEnrolled = true;
      } else {
        const user = await User.findById(req.user._id);
        isEnrolled = user.enrolledCourses.some(
          (item) => item.course && item.course.toString() === course._id.toString()
        );
      }
    }

    // If course is draft and user is not admin, deny access
    if (!course.isPublished && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'This course is currently in draft mode.'
      });
    }

    const courseData = course.toObject();

    // Sanitize non-preview video URLs if student is not enrolled
    if (!isEnrolled) {
      courseData.modules = await Promise.all(
        courseData.modules.map(async (mod) => {
          const lectures = await Promise.all(
            mod.lectures.map(async (lec) => {
              let previewUrl = null;
              if (lec.isFreePreview) {
                if (lec.videoSource === 'youtube') {
                  previewUrl = lec.videoUrl;
                } else if (lec.videoUrl) {
                  try {
                    previewUrl = await storageService.getPlaybackUrl(lec.storageKey || lec.videoUrl);
                  } catch (e) {
                    previewUrl = null;
                  }
                }
              }

              return {
                _id: lec._id,
                title: lec.title,
                description: lec.description,
                chapterTitle: lec.chapterTitle,
                duration: lec.duration,
                durationSeconds: lec.durationSeconds,
                isFreePreview: lec.isFreePreview,
                isPublished: lec.isPublished,
                order: lec.order,
                videoSource: lec.videoSource,
                videoUrl: previewUrl,
                youtubeVideoId: lec.isFreePreview ? lec.youtubeVideoId : null,
                hasNotes: !!lec.notesUrl || !!lec.notesContent,
                resourcesCount: lec.resources ? lec.resources.length : 0
              };
            })
          );
          return { ...mod, lectures };
        })
      );
    } else {
      // Enrolled student or admin: sign private video URLs and notes
      for (const mod of courseData.modules) {
        if (mod.lectures) {
          for (const lec of mod.lectures) {
            if (
              lec.videoSource === 'b2' ||
              lec.videoSource === 'r2' ||
              (lec.videoSource === 'upload' && !lec.videoUrl.startsWith('http')) ||
              (lec.storageKey && !lec.videoUrl.startsWith('http'))
            ) {
              try {
                lec.videoUrl = await storageService.getPlaybackUrl(lec.storageKey || lec.videoUrl);
              } catch (e) {}
            }
            if (lec.notesUrl && !lec.notesUrl.startsWith('http')) {
              try {
                lec.notesUrl = await storageService.getFileUrl(lec.notesUrl);
              } catch (e) {}
            }
            if (lec.resources && Array.isArray(lec.resources)) {
              for (const resItem of lec.resources) {
                if (resItem.url && !resItem.url.startsWith('http')) {
                  try {
                    resItem.url = await storageService.getFileUrl(resItem.url);
                  } catch (e) {}
                }
              }
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      course: courseData,
      isEnrolled
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Course
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      tagline,
      description,
      category,
      level,
      thumbnail,
      promoVideoUrl,
      price,
      discountPrice,
      duration,
      batchName,
      startDate,
      schedule,
      features,
      prerequisites,
      instructor,
      isPublished
    } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course title, description, and price.'
      });
    }

    // Generate unique slug
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const course = await Course.create({
      title,
      slug,
      tagline: tagline || title,
      description,
      category: category || 'General',
      level: level || 'All Levels',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      promoVideoUrl: promoVideoUrl || '',
      price: Number(price),
      discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : Number(price),
      duration: duration || 'Self-paced',
      batchName: batchName || 'Batch 2026',
      startDate: startDate || 'Immediate Access',
      schedule: schedule || 'Self-paced',
      features: features || [],
      prerequisites: prerequisites || [],
      instructor: typeof instructor === 'string'
        ? { name: instructor, title: 'IIT Delhi Alumnus | Former Oracle | 5+ Years Experience', avatar: '', bio: 'IIT Delhi alumnus and former Oracle professional with 5 years of teaching experience.' }
        : (instructor || {
            name: 'Aman Mishra',
            title: 'IIT Delhi Alumnus | Former Oracle | 5+ Years Experience',
            avatar: '',
            bio: 'IIT Delhi alumnus and former Oracle professional with 5 years of teaching experience dedicated to concept-first mathematics.'
          }),
      isPublished: !!isPublished,
      modules: []
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (typeof updateData.instructor === 'string') {
      updateData.instructor = {
        name: updateData.instructor,
        title: 'Lead Instructor',
        avatar: '',
        bio: ''
      };
    }

    const course = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle Course Visibility (Publish / Unpublish)
export const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: course.isPublished
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Add Module to Course
export const addModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Module title is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    course.modules.push({
      title,
      description: description || '',
      order: course.modules.length + 1,
      lectures: []
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Module
export const updateModule = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    if (title) mod.title = title;
    if (description !== undefined) mod.description = description;
    if (order !== undefined) mod.order = order;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Module
export const deleteModule = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    course.modules = course.modules.filter((m) => m._id.toString() !== moduleId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Add Lecture to Module
export const addLecture = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const moduleId = req.params.moduleId || req.body.moduleId;
    const {
      title,
      description,
      chapterTitle,
      videoSource,
      videoUrl,
      storageKey,
      duration,
      durationSeconds,
      isFreePreview,
      isPublished,
      notesSource,
      notesUrl,
      notesContent,
      codeSnippet,
      resources
    } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Lecture title and video URL are required.' });
    }

    if (!moduleId) {
      return res.status(400).json({ success: false, message: 'Target module ID is required.' });
    }

    let finalSource = videoSource || 'youtube';
    let yId = '';

    // If source is youtube or if videoUrl matches YouTube pattern
    const detectedYId = extractYouTubeId(videoUrl);
    if (finalSource === 'youtube' || detectedYId) {
      if (!detectedYId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL. Please provide a valid YouTube watch, youtu.be, shorts or embed link.'
        });
      }
      finalSource = 'youtube';
      yId = detectedYId;
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const resolvedStorageKey = storageKey || (finalSource === 'b2' || finalSource === 'r2' || finalSource === 'upload' ? (!videoUrl.startsWith('http') ? videoUrl : '') : '');

    mod.lectures.push({
      title,
      description: description || '',
      chapterTitle: chapterTitle || '',
      videoSource: finalSource,
      videoUrl,
      youtubeVideoId: yId,
      storageKey: resolvedStorageKey,
      duration: duration || '15:00',
      durationSeconds: durationSeconds || 900,
      isFreePreview: !!isFreePreview,
      isPublished: isPublished !== undefined ? !!isPublished : true,
      notesSource: notesSource || 'text',
      notesUrl: notesUrl || '',
      notesContent: notesContent || '',
      codeSnippet: codeSnippet || '',
      resources: resources || [],
      order: mod.lectures.length + 1
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Lecture
export const updateLecture = async (req, res, next) => {
  try {
    const { courseId, moduleId, lectureId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const lec = mod.lectures.id(lectureId);
    if (!lec) return res.status(404).json({ success: false, message: 'Lecture not found.' });

    const updatePayload = { ...req.body };

    // Validate YouTube if updated
    if (updatePayload.videoUrl) {
      const detectedYId = extractYouTubeId(updatePayload.videoUrl);
      if (updatePayload.videoSource === 'youtube' || (!updatePayload.videoSource && lec.videoSource === 'youtube')) {
        if (!detectedYId) {
          return res.status(400).json({
            success: false,
            message: 'Invalid YouTube URL. Please provide a valid YouTube watch, youtu.be, shorts or embed link.'
          });
        }
        updatePayload.youtubeVideoId = detectedYId;
        updatePayload.videoSource = 'youtube';
      } else if (detectedYId) {
        updatePayload.youtubeVideoId = detectedYId;
        updatePayload.videoSource = 'youtube';
      }
    }

    Object.assign(lec, updatePayload);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Lecture with Storage Object Cleanup
export const deleteLecture = async (req, res, next) => {
  try {
    const { courseId, moduleId, lectureId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const lec = mod.lectures.id(lectureId);
    if (!lec) return res.status(404).json({ success: false, message: 'Lecture not found.' });

    // Clean up physical B2 / R2 / local storage object if present
    const storageKeyToDelete = lec.storageKey || (lec.videoSource === 'b2' || lec.videoSource === 'r2' || lec.videoSource === 'upload' ? lec.videoUrl : null);
    if (storageKeyToDelete && !storageKeyToDelete.startsWith('http')) {
      try {
        await storageService.deleteFile(storageKeyToDelete);
      } catch (delErr) {
        console.warn('[deleteLecture] Failed to clean up storage object:', delErr.message);
      }
    }

    mod.lectures = mod.lectures.filter((l) => l._id.toString() !== lectureId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reorder Lectures within a Module
export const reorderLectures = async (req, res, next) => {
  try {
    const { courseId, moduleId } = req.params;
    const { lectureIds } = req.body;

    if (!Array.isArray(lectureIds)) {
      return res.status(400).json({ success: false, message: 'lectureIds array is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const mod = course.modules.id(moduleId);
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found.' });

    const lectureMap = new Map(mod.lectures.map((l) => [l._id.toString(), l]));
    const reordered = [];

    lectureIds.forEach((id, idx) => {
      const lecture = lectureMap.get(id.toString());
      if (lecture) {
        lecture.order = idx + 1;
        reordered.push(lecture);
        lectureMap.delete(id.toString());
      }
    });

    lectureMap.forEach((lecture) => {
      lecture.order = reordered.length + 1;
      reordered.push(lecture);
    });

    mod.lectures = reordered;
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lectures reordered successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Add Assignment to Course
export const addAssignment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, moduleTitle, referenceFileUrl, starterCode, dueDate, maxMarks } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Assignment title and description are required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    course.assignments.push({
      title,
      description,
      moduleTitle: moduleTitle || 'General',
      referenceFileUrl: referenceFileUrl || '',
      starterCode: starterCode || '',
      dueDate: dueDate || 'Flexible',
      maxMarks: Number(maxMarks) || 100
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Assignment added successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Assignment
export const deleteAssignment = async (req, res, next) => {
  try {
    const { courseId, assignmentId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    course.assignments = course.assignments.filter((a) => a._id.toString() !== assignmentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Assignment removed successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};
