import mongoose from 'mongoose';
import { extractYouTubeId, isValidYouTubeUrl, getYouTubeEmbedUrl } from '../utils/youtube.js';
import { storageService } from '../services/storageService.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING MATHEMATICS ACADEMY LMS TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: YouTube ID Extraction & Validation
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: YouTube Parsing & Validation ---');
    
    const validWatchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const validShareUrl = 'https://youtu.be/dQw4w9WgXcQ';
    const validShortsUrl = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
    const validEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const validNocookieUrl = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
    const validDirectId = 'dQw4w9WgXcQ';
    const invalidUrl1 = 'https://notyoutube.com/watch?v=123';
    const invalidUrl2 = 'not a url at all';
    const invalidUrl3 = 'https://www.youtube.com/watch?v=too_short';

    assert(extractYouTubeId(validWatchUrl) === 'dQw4w9WgXcQ', 'Extract from youtube.com/watch?v=');
    assert(extractYouTubeId(validShareUrl) === 'dQw4w9WgXcQ', 'Extract from youtu.be/');
    assert(extractYouTubeId(validShortsUrl) === 'dQw4w9WgXcQ', 'Extract from youtube.com/shorts/');
    assert(extractYouTubeId(validEmbedUrl) === 'dQw4w9WgXcQ', 'Extract from youtube.com/embed/');
    assert(extractYouTubeId(validNocookieUrl) === 'dQw4w9WgXcQ', 'Extract from youtube-nocookie.com/embed/');
    assert(extractYouTubeId(validDirectId) === 'dQw4w9WgXcQ', 'Extract direct 11-char ID');
    assert(extractYouTubeId(invalidUrl1) === null, 'Reject non-YouTube domain');
    assert(extractYouTubeId(invalidUrl2) === null, 'Reject arbitrary non-URL text');
    assert(extractYouTubeId(invalidUrl3) === null, 'Reject invalid ID length');

    const embedResult = getYouTubeEmbedUrl(validWatchUrl);
    assert(
      embedResult === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&enablejsapi=1',
      'Generate privacy-enhanced youtube-nocookie.com embed URL'
    );

    // ----------------------------------------------------
    // TEST GROUP 2: Storage Service & R2 Handling
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Storage Service & R2 Presigned URLs ---');

    const storageInfo = storageService.getStorageInfo();
    assert(storageInfo !== null && typeof storageInfo === 'object', 'storageService.getStorageInfo() returns valid object');
    assert(typeof storageInfo.driver === 'string', `Storage driver reported: ${storageInfo.driver}`);

    // Test presigned upload error handling when unconfigured
    const presignUnconfigured = await storageService.getPresignedUploadUrl({
      fileName: 'test-lecture.mp4',
      fileType: 'video/mp4'
    });
    // If running without R2 keys, it should gracefully return success: false with informative message
    if (!storageInfo.r2Configured) {
      assert(
        presignUnconfigured.success === false && presignUnconfigured.configured === false,
        'Presigned upload reports unconfigured status gracefully without crashing'
      );
    } else {
      assert(
        presignUnconfigured.success === true && typeof presignUnconfigured.uploadUrl === 'string',
        'Presigned upload generates valid S3/R2 PUT URL when keys configured'
      );
    }

    // Test getPlaybackUrl fallback
    const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const playbackYt = await storageService.getPlaybackUrl(ytUrl);
    assert(playbackYt === ytUrl, 'getPlaybackUrl preserves external/YouTube stream URLs directly');

    // ----------------------------------------------------
    // TEST GROUP 3: Database & Course / Lecture Integration
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Database, Courses, Lectures & Classroom Security ---');

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    assert(mongoose.connection.readyState === 1, 'In-memory test MongoDB connected');

    // Create test course
    const testCourse = await Course.create({
      title: 'Advanced Calculus & Real Analysis',
      slug: 'advanced-calculus-real-analysis',
      tagline: 'Rigorous mathematics from fundamentals to mastery',
      description: 'Comprehensive analysis, limits, derivatives and integral theorems.',
      price: 2499,
      discountPrice: 1999,
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
      isPublished: true,
      modules: [
        {
          title: 'Module 1: Real Numbers & Limits',
          description: 'Axioms, sequences and convergence',
          order: 1,
          lectures: []
        }
      ]
    });
    assert(testCourse._id !== undefined, 'Created test course in database');

    // Test adding YouTube lecture
    const moduleId = testCourse.modules[0]._id;
    const yId = extractYouTubeId(validWatchUrl);
    testCourse.modules[0].lectures.push({
      title: '1. Introduction to Limits & Epsilon-Delta Definition',
      description: 'Concept-first rigorous proof of limits.',
      chapterTitle: 'Limits & Continuity',
      videoSource: 'youtube',
      videoUrl: validWatchUrl,
      youtubeVideoId: yId,
      duration: '18:45',
      durationSeconds: 1125,
      isFreePreview: true,
      isPublished: true,
      order: 1
    });
    await testCourse.save();

    const updatedCourse = await Course.findById(testCourse._id);
    const lecture = updatedCourse.modules[0].lectures[0];
    assert(lecture.title.includes('Epsilon-Delta'), 'YouTube lecture saved in module');
    assert(lecture.videoSource === 'youtube', 'Lecture videoSource saved as "youtube"');
    assert(lecture.youtubeVideoId === 'dQw4w9WgXcQ', 'Lecture youtubeVideoId stored accurately');
    assert(lecture.isFreePreview === true, 'Free preview flag persisted');

    // Test creating students: enrolled vs unauthorized
    const enrolledUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.student@test.com',
      password: 'Password123!',
      role: 'student',
      enrolledCourses: [
        {
          course: testCourse._id,
          enrolledAt: new Date(),
          progressPercentage: 0
        }
      ]
    });

    const unauthorizedUser = await User.create({
      name: 'Unauthorized Student',
      email: 'unauth@test.com',
      password: 'Password123!',
      role: 'student',
      enrolledCourses: []
    });

    // Check enrollment verification logic
    const isEnrolledCheck = enrolledUser.enrolledCourses.some(
      (c) => c.course.toString() === testCourse._id.toString()
    );
    const isUnauthorizedCheck = unauthorizedUser.enrolledCourses.some(
      (c) => c.course.toString() === testCourse._id.toString()
    );

    assert(isEnrolledCheck === true, 'Enrolled student identified correctly');
    assert(isUnauthorizedCheck === false, 'Unauthorized student identified and blocked');

    // Test student progress tracking
    const progress = await Progress.create({
      user: enrolledUser._id,
      course: testCourse._id,
      completedLectures: [lecture._id],
      currentLectureId: lecture._id,
      lastWatchTimeSeconds: 420,
      percentage: 100,
      isCompleted: true
    });

    assert(progress.percentage === 100, 'Student progress recorded at 100%');
    assert(progress.completedLectures.length === 1, 'Completed lecture tracked in database');
    assert(progress.lastWatchTimeSeconds === 420, 'Last watch time (resume playback position) persisted');

    // Test lecture deletion and module cleanup
    testCourse.modules[0].lectures = testCourse.modules[0].lectures.filter(
      (l) => l._id.toString() !== lecture._id.toString()
    );
    await testCourse.save();

    const afterDelete = await Course.findById(testCourse._id);
    assert(afterDelete.modules[0].lectures.length === 0, 'Lecture deleted safely from module');

  } catch (error) {
    console.error('Test Suite Error:', error);
    failed++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
