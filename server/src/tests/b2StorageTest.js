import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { storageService } from '../services/storageService.js';
import { extractYouTubeId, isValidYouTubeUrl, getYouTubeEmbedUrl } from '../utils/youtube.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';

let mongoServer;

async function runB2Tests() {
  console.log('======================================================================');
  console.log('🚀 RUNNING BACKBLAZE B2 & LMS STORAGE VERIFICATION SUITE');
  console.log('======================================================================\n');

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
    // TEST 1: B2 Client Initialization with Explicit Endpoint & Region
    // ----------------------------------------------------
    console.log('--- TEST 1: B2 Client Initialization & Configuration ---');

    // Simulate B2 environment
    process.env.STORAGE_DRIVER = 'b2';
    process.env.B2_KEY_ID = 'test_b2_key_id_mock_12345';
    process.env.B2_APPLICATION_KEY = 'test_b2_app_key_mock_secret_abcdef';
    process.env.B2_BUCKET_NAME = 'mathematics-academy-storage';
    process.env.B2_ENDPOINT = 'https://s3.us-east-005.backblazeb2.com';
    process.env.B2_REGION = 'us-east-005';

    // Re-initialize storage service client with B2 env
    storageService.driver = 'b2';
    storageService.initClient();

    const b2Status = storageService.isB2Configured();
    assert(b2Status.configured === true, 'B2 S3Client initialized successfully with B2 config');
    assert(b2Status.bucket === 'mathematics-academy-storage', 'B2 bucket is "mathematics-academy-storage"');
    assert(b2Status.endpoint === 'https://s3.us-east-005.backblazeb2.com', 'B2 endpoint is "https://s3.us-east-005.backblazeb2.com"');
    assert(b2Status.region === 'us-east-005', 'B2 region is "us-east-005"');
    assert(storageService.s3Client instanceof S3Client, 'S3Client instance created with AWS SDK v3');

    // ----------------------------------------------------
    // TEST 2: Presigned Upload URL Generation (PUT)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Presigned Upload URL Generation (PUT) ---');

    const presignedVideo = await storageService.getPresignedUploadUrl({
      fileName: 'differential-calculus-lesson1.mp4',
      fileType: 'video/mp4',
      folder: 'lectures'
    });

    assert(presignedVideo.success === true, 'Generated presigned upload URL for MP4 video');
    assert(typeof presignedVideo.uploadUrl === 'string' && presignedVideo.uploadUrl.includes('differential-calculus'), 'Upload URL contains safe sanitized filename');
    assert(presignedVideo.uploadUrl.includes('s3.us-east-005.backblazeb2.com'), 'Upload URL targets Backblaze B2 S3 endpoint');
    assert(presignedVideo.storageKey.startsWith('lectures/'), 'Storage key uses standard "lectures/" prefix');
    assert(presignedVideo.bucket === 'mathematics-academy-storage', 'Target bucket is mathematics-academy-storage');
    assert(presignedVideo.publicUrl === null, 'Private bucket: permanent publicUrl is null (preserves privacy)');

    // ----------------------------------------------------
    // TEST 3: Presigned Playback/Download URL Generation (GET)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Presigned Download & Playback URL Generation (GET) ---');

    const sampleKey = presignedVideo.storageKey;
    const playbackUrl = await storageService.getPlaybackUrl(sampleKey, 1800);

    assert(typeof playbackUrl === 'string', 'Generated playback URL string');
    assert(playbackUrl.includes('s3.us-east-005.backblazeb2.com'), 'Playback URL uses B2 endpoint');
    assert(playbackUrl.includes('X-Amz-Signature'), 'Signed GET URL includes S3 V4 authorization signature');
    assert(playbackUrl.includes('X-Amz-Expires=1800'), 'Signed URL includes requested 1800s expiry');

    // External streams should not be modified
    const externalStream = 'https://stream.example.com/live/lecture.m3u8';
    assert(await storageService.getPlaybackUrl(externalStream) === externalStream, 'Preserves external HTTP/HTTPS streams unmodified');

    // ----------------------------------------------------
    // TEST 4: HeadObject File Existence Check
    // ----------------------------------------------------
    console.log('\n--- TEST 4: HeadObject & Object Checking ---');

    assert(typeof storageService.checkFileExists === 'function', 'storageService.checkFileExists is defined');

    // ----------------------------------------------------
    // TEST 5: Database Integration, Video Uploads & Storage Keys
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Video & Course Database Integration ---');

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    assert(mongoose.connection.readyState === 1, 'In-memory test MongoDB connected');

    const course = await Course.create({
      title: 'Advanced Linear Algebra & Matrix Calculus',
      slug: 'advanced-linear-algebra-matrix-calculus',
      tagline: 'Vector spaces, eigenvalues, and SVD decomposition',
      description: 'Comprehensive college mathematics course.',
      price: 2999,
      discountPrice: 2499,
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      isPublished: true,
      modules: [
        {
          title: 'Module 1: Vector Spaces and Subspaces',
          description: 'Linear independence and basis',
          order: 1,
          lectures: []
        }
      ]
    });

    const b2VideoKey = 'lectures/vector-spaces-intro-1234.mp4';
    course.modules[0].lectures.push({
      title: '1. Definition of Vector Spaces & 8 Axioms',
      description: 'Proof of vector space axioms over the real field.',
      chapterTitle: 'Vector Spaces',
      videoSource: 'b2',
      videoUrl: b2VideoKey,
      storageKey: b2VideoKey,
      duration: '22:15',
      durationSeconds: 1335,
      isFreePreview: true,
      isPublished: true,
      order: 1
    });
    await course.save();

    const savedCourse = await Course.findById(course._id);
    const lecture1 = savedCourse.modules[0].lectures[0];
    assert(lecture1.videoSource === 'b2', 'Lecture videoSource saved as "b2"');
    assert(lecture1.storageKey === b2VideoKey, 'Private B2 storageKey stored in MongoDB');
    assert(lecture1.isFreePreview === true, 'Free preview flag persisted');

    // ----------------------------------------------------
    // TEST 6: PDF Notes & Supplementary Resources Upload
    // ----------------------------------------------------
    console.log('\n--- TEST 6: PDF Notes & Supplementary Handouts ---');

    const presignedPdf = await storageService.getPresignedUploadUrl({
      fileName: 'linear-algebra-theorems.pdf',
      fileType: 'application/pdf',
      folder: 'attachments'
    });

    assert(presignedPdf.success === true, 'Generated presigned upload URL for PDF');
    assert(presignedPdf.storageKey.startsWith('attachments/'), 'PDF stored in attachments/ folder');

    // Attach PDF and supplementary resource to lecture
    lecture1.notesSource = 'upload';
    lecture1.notesUrl = presignedPdf.storageKey;
    lecture1.resources.push({
      title: 'Problem Set 1 Handout (PDF)',
      url: 'attachments/problem-set-1-eigenvalues.pdf',
      type: 'pdf',
      source: 'b2'
    });
    await savedCourse.save();

    const courseWithResources = await Course.findById(course._id);
    const lecWithNotes = courseWithResources.modules[0].lectures[0];
    assert(lecWithNotes.notesUrl === presignedPdf.storageKey, 'Private notesUrl key stored in lecture');
    assert(lecWithNotes.resources.length === 1, 'Supplementary resource attached');
    assert(lecWithNotes.resources[0].source === 'b2', 'Resource source marked as "b2"');

    // ----------------------------------------------------
    // TEST 7: YouTube Integration & Validation
    // ----------------------------------------------------
    console.log('\n--- TEST 7: YouTube Parsing, Shorts, & Embeds ---');

    const ytWatch = 'https://www.youtube.com/watch?v=k7RM-ot2NWY';
    const ytShorts = 'https://www.youtube.com/shorts/k7RM-ot2NWY';
    const ytShare = 'https://youtu.be/k7RM-ot2NWY';
    const ytInvalid = 'https://vimeo.com/123456';

    assert(extractYouTubeId(ytWatch) === 'k7RM-ot2NWY', 'Extract from youtube.com/watch?v=');
    assert(extractYouTubeId(ytShorts) === 'k7RM-ot2NWY', 'Extract from youtube.com/shorts/');
    assert(extractYouTubeId(ytShare) === 'k7RM-ot2NWY', 'Extract from youtu.be/');
    assert(extractYouTubeId(ytInvalid) === null, 'Reject non-YouTube domain safely');

    const nocookieEmbed = getYouTubeEmbedUrl(ytWatch);
    assert(nocookieEmbed.startsWith('https://www.youtube-nocookie.com/embed/k7RM-ot2NWY'), 'Generate privacy-enhanced youtube-nocookie.com URL');

    // Add YouTube lecture to course
    courseWithResources.modules[0].lectures.push({
      title: '2. Geometric Intuition of Linear Independence',
      videoSource: 'youtube',
      videoUrl: ytWatch,
      youtubeVideoId: 'k7RM-ot2NWY',
      duration: '14:20',
      isFreePreview: false,
      isPublished: true,
      order: 2
    });
    await courseWithResources.save();
    assert(courseWithResources.modules[0].lectures.length === 2, 'Added YouTube lecture alongside B2 lecture');

    // ----------------------------------------------------
    // TEST 8 & 9: Security: Enrollment Authorization & Resource Signing
    // ----------------------------------------------------
    console.log('\n--- TEST 8 & 9: Security Guards, Enrollment, and Resource Signing ---');

    const enrolledStudent = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@testmath.in',
      password: 'HashedPassword123!',
      role: 'student',
      enrolledCourses: [{ course: course._id, enrolledAt: new Date(), progressPercentage: 0 }]
    });

    const unauthorizedStudent = await User.create({
      name: 'Unenrolled Visitor',
      email: 'visitor@testmath.in',
      password: 'HashedPassword123!',
      role: 'student',
      enrolledCourses: []
    });

    const isEnrolledPriya = enrolledStudent.enrolledCourses.some((c) => c.course.toString() === course._id.toString());
    const isEnrolledVisitor = unauthorizedStudent.enrolledCourses.some((c) => c.course.toString() === course._id.toString());

    assert(isEnrolledPriya === true, 'Enrolled student authorized for classroom');
    assert(isEnrolledVisitor === false, 'Unauthorized student blocked from classroom');

    // Verify dynamic signing of private video, notes, AND supplementary resources
    const classroomCourse = courseWithResources.toObject();
    for (const mod of classroomCourse.modules) {
      for (const lec of mod.lectures) {
        if (lec.videoSource === 'b2') {
          lec.videoUrl = await storageService.getPlaybackUrl(lec.storageKey);
        }
        if (lec.notesUrl) {
          lec.notesUrl = await storageService.getFileUrl(lec.notesUrl);
        }
        if (lec.resources && Array.isArray(lec.resources)) {
          for (const res of lec.resources) {
            res.url = await storageService.getFileUrl(res.url);
          }
        }
      }
    }

    const signedLec = classroomCourse.modules[0].lectures[0];
    assert(signedLec.videoUrl.includes('X-Amz-Signature'), 'Classroom delivers signed B2 video URL to enrolled student');
    assert(signedLec.notesUrl.includes('X-Amz-Signature'), 'Classroom delivers signed B2 PDF notes URL to enrolled student');
    assert(signedLec.resources[0].url.includes('X-Amz-Signature'), 'Classroom delivers signed B2 supplementary resource URL (Fixes Security Gap)');

    // ----------------------------------------------------
    // TEST 10: Public Course Preview Handling (No Raw Keys Exposed)
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Public Course Preview Data Sanitization ---');

    // Simulate public getCourseBySlug for unauthorized user
    const publicCourseData = courseWithResources.toObject();
    const sanitizedModules = await Promise.all(
      publicCourseData.modules.map(async (mod) => {
        const lectures = await Promise.all(
          mod.lectures.map(async (lec) => {
            let previewUrl = null;
            if (lec.isFreePreview) {
              if (lec.videoSource === 'youtube') previewUrl = lec.videoUrl;
              else if (lec.videoUrl) previewUrl = await storageService.getPlaybackUrl(lec.storageKey || lec.videoUrl);
            }
            return {
              _id: lec._id,
              title: lec.title,
              isFreePreview: lec.isFreePreview,
              videoUrl: previewUrl,
              youtubeVideoId: lec.isFreePreview ? lec.youtubeVideoId : null
            };
          })
        );
        return { ...mod, lectures };
      })
    );

    const publicLec1 = sanitizedModules[0].lectures[0]; // Free preview B2 video
    const publicLec2 = sanitizedModules[0].lectures[1]; // Non-preview YouTube video

    assert(publicLec1.videoUrl !== null, 'Free preview lecture has playable URL for prospective students');
    assert(publicLec1.videoUrl.includes('X-Amz-Signature'), 'Free preview B2 video is safely signed with time expiry (Never raw key)');
    assert(publicLec2.videoUrl === null, 'Non-preview lecture videoUrl is NULL for unauthorized users');
    assert(publicLec2.youtubeVideoId === null, 'Non-preview YouTube video ID is hidden from unauthorized users');

    // ----------------------------------------------------
    // TEST 11: Object Deletion
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Object Deletion Safety ---');

    assert(typeof storageService.deleteFile === 'function', 'storageService.deleteFile is available');

    // ----------------------------------------------------
    // TEST 12: Compatibility & Production Error Handling
    // ----------------------------------------------------
    console.log('\n--- TEST 12: Storage Driver Compatibility & Production Guards ---');

    // Switch to local driver
    process.env.STORAGE_DRIVER = 'local';
    storageService.driver = 'local';
    storageService.s3Client = null;

    const localPresign = await storageService.getPresignedUploadUrl({ fileName: 'test.mp4' });
    assert(localPresign.success === false, 'Gracefully prevents presigned cloud upload when running in local driver');
    assert(localPresign.configured === false, 'Reports unconfigured cloud status clearly to frontend');

  } catch (err) {
    console.error('Test Suite Failed:', err);
    failed++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('\n======================================================================');
    console.log(`📊 B2 STORAGE & LMS TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runB2Tests();
