// Automated End-to-End API and Flow Test Suite for Zenith Academy
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Zenith Academy End-to-End Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function assert(desc, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${desc} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await assert('Health Check Endpoint (/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Health check returned non-online status');
  });

  // 2. Course catalogue
  let sampleCourse = null;
  await assert('Course Catalogue Retrieval (/courses)', async () => {
    const res = await fetch(`${BASE_URL}/courses`);
    const data = await res.json();
    if (!data.success || data.courses.length < 4) throw new Error('Expected at least 4 courses');
    sampleCourse = data.courses.find(c => c.slug === 'sigma-full-stack-web-development') || data.courses[0];
  });

  // 3. Course detail by slug
  await assert('Course Details & Free Preview (/courses/:slug)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${sampleCourse.slug}`);
    const data = await res.json();
    if (!data.success || !data.course.modules) throw new Error('Failed to retrieve course syllabus');
    // Verify free preview lecture exists
    const hasPreview = data.course.modules.some(m => m.lectures.some(l => l.isFreePreview));
    if (!hasPreview) throw new Error('Course has no free preview lectures');
  });

  // 4. Student Login
  let studentToken = null;
  await assert('Student Authentication (/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@zenithlearn.io', password: 'Student@123' })
    });
    const data = await res.json();
    if (!data.success || !data.token) throw new Error('Student login failed');
    studentToken = data.token;
  });

  // 5. Admin Login
  let adminToken = null;
  await assert('Admin Authentication (/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@zenithlearn.io', password: 'Admin@123' })
    });
    const data = await res.json();
    if (!data.success || data.user.role !== 'admin') throw new Error('Admin login failed');
    adminToken = data.token;
  });

  // 6. Student Dashboard
  await assert('Student Dashboard Data (/learn/dashboard)', async () => {
    const res = await fetch(`${BASE_URL}/learn/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.stats) throw new Error('Failed to get student stats');
  });

  // 7. LMS Classroom Access
  let firstLectureId = null;
  await assert('LMS Classroom Access for Enrolled Student (/learn/classroom/:id)', async () => {
    const res = await fetch(`${BASE_URL}/learn/classroom/${sampleCourse._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.course) throw new Error('Failed to load classroom');
    firstLectureId = data.course.modules[0].lectures[0]._id;
  });

  // 8. Progress Tracking Update
  await assert('Video Playback Progress & Lecture Completion Sync (/learn/progress/:id)', async () => {
    const res = await fetch(`${BASE_URL}/learn/progress/${sampleCourse._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        lectureId: firstLectureId,
        completed: true,
        lastWatchTimeSeconds: 150
      })
    });
    const data = await res.json();
    if (!data.success || data.progress.lastWatchTimeSeconds !== 150) {
      throw new Error('Progress update did not reflect');
    }
  });

  // 9. Coupon Discount Engine
  await assert('Coupon Code Engine (/payments/apply-coupon)', async () => {
    const res = await fetch(`${BASE_URL}/payments/apply-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ code: 'ZENITH20', courseId: sampleCourse._id })
    });
    const data = await res.json();
    if (!data.success || data.discountPercentage !== 20) {
      throw new Error('Failed to apply ZENITH20 discount');
    }
  });

  // 10. Order Creation & Payment Verification
  await assert('Payment Flow & Instant Enrollment Verification (/payments/create-order & /verify)', async () => {
    // Find un-enrolled course (e.g. course 3)
    const coursesRes = await fetch(`${BASE_URL}/courses`);
    const coursesData = await coursesRes.json();
    const targetCourse = coursesData.courses.find(c => c.slug === 'delta-system-design-distributed-systems');

    // Create order
    const orderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ courseId: targetCourse._id, couponCode: 'ZENITH20' })
    });
    const orderData = await orderRes.json();
    if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

    // Verify payment
    const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        orderId: orderData.order.orderId,
        isSandboxSimulation: true
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success || !verifyData.receiptNumber) {
      throw new Error('Payment verification failed');
    }
  });

  // 11. Assignment Submission
  let submissionId = null;
  await assert('Assignment Submission Workflow (/assignments/submit)', async () => {
    const detailRes = await fetch(`${BASE_URL}/courses/${sampleCourse.slug}`);
    const detailData = await detailRes.json();
    const assignment = detailData.course.assignments?.[0];

    const res = await fetch(`${BASE_URL}/assignments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        courseId: sampleCourse._id,
        assignmentId: assignment._id,
        title: assignment.title,
        githubUrl: 'https://github.com/rohan/web-dev-assignment',
        liveUrl: 'https://rohan-project.netlify.app',
        submissionNotes: 'All responsive breakpoints and tests passing.'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Assignment submission failed');
    submissionId = data.submission._id;
  });

  // 12. Admin Analytics
  await assert('Admin Platform Analytics Console (/admin/analytics)', async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || data.analytics.totalRevenue <= 0) {
      throw new Error('Admin analytics returned invalid revenue or student count');
    }
  });

  // 13. Admin Assignment Grading
  await assert('Admin Assignment Evaluation & Feedback (/assignments/grade/:id)', async () => {
    const res = await fetch(`${BASE_URL}/assignments/grade/${submissionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        score: 98,
        feedback: 'Outstanding architecture and modular components. Approved!'
      })
    });
    const data = await res.json();
    if (!data.success || data.submission.score !== 98) {
      throw new Error('Grading failed to record');
    }
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();

