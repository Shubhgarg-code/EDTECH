// Comprehensive Platform & CMS Test Suite for Mathematics Academy
const BASE_URL = 'http://localhost:5000/api';

async function runPlatformTests() {
  console.log('🚀 Running Mathematics Academy Platform & CMS Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(desc, fn) {
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
  await test('System Health Check (/api/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'online') throw new Error('Health check returned non-online');
  });

  // 2. Public CMS Settings
  let cmsSettings = null;
  await test('Public CMS Settings Retrieval (/api/cms/settings)', async () => {
    const res = await fetch(`${BASE_URL}/cms/settings`);
    const data = await res.json();
    if (!data.success || !data.settings || !data.settings.hero) {
      throw new Error('Failed to load public CMS settings');
    }
    cmsSettings = data.settings;
  });

  // 3. Public Course Catalogue
  let starterCourse = null;
  await test('Public Course Catalogue (/api/courses)', async () => {
    const res = await fetch(`${BASE_URL}/courses`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.courses) || data.courses.length < 1) {
      throw new Error('No published courses returned');
    }
    starterCourse = data.courses[0];
  });

  // 4. Public Course Details
  await test('Public Course Details (/api/courses/:slug)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${starterCourse.slug}`);
    const data = await res.json();
    if (!data.success || !data.course || !data.course.modules) {
      throw new Error('Course syllabus could not be retrieved');
    }
  });

  // 5. Visitor Contact Inquiry
  const testInquiryEmail = `tester_${Date.now()}@example.com`;
  await test('Public Visitor Contact Inquiry (/api/cms/contact)', async () => {
    const res = await fetch(`${BASE_URL}/cms/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Dr. Jane Doe',
        email: testInquiryEmail,
        phone: '+91 9876543210',
        subject: 'Enterprise Batch Inquiry',
        message: 'We are inquiring about bulk training for our engineering teams.'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Contact message submission failed');
  });

  // 6. Public Student Registration (verifying forced student role)
  let testStudentEmail = `student_${Date.now()}@mathacademy.in`;
  let studentToken = null;
  await test('Student Registration & Role Enforcement (/api/auth/register)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Candidate',
        email: testStudentEmail,
        password: 'Password@123',
        role: 'admin' // Attempt privilege escalation, should be overridden to 'student'
      })
    });
    const data = await res.json();
    if (!data.success || data.user.role !== 'student') {
      throw new Error('Role was not strictly enforced to student');
    }
    studentToken = data.token;
  });

  // 7. Admin Login
  let adminToken = null;
  await test('Admin Authentication (/api/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@mathacademy.in',
        password: 'Admin@123'
      })
    });
    const data = await res.json();
    if (!data.success || data.user.role !== 'admin') {
      throw new Error('Admin login failed or role mismatch');
    }
    adminToken = data.token;
  });

  // 8. Admin Inquiries Inbox
  await test('Admin Inquiries Inbox Retrieval (/api/cms/messages)', async () => {
    const res = await fetch(`${BASE_URL}/cms/messages`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.messages)) {
      throw new Error('Failed to retrieve inquiries list');
    }
    const found = data.messages.some(m => m.email === testInquiryEmail);
    if (!found) throw new Error('Submitted contact inquiry not found in admin inbox');
  });

  // 9. Admin Platform Metrics
  await test('Admin Real Platform Metrics (/api/admin/analytics)', async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !data.analytics) {
      throw new Error('Failed to fetch admin analytics');
    }
    if (typeof data.analytics.totalStudents !== 'number' || data.analytics.totalStudents < 1) {
      throw new Error('Admin analytics returned invalid student count');
    }
    if (typeof data.analytics.totalCourses !== 'number' || data.analytics.totalCourses < 1) {
      throw new Error('Admin analytics returned invalid course count');
    }
  });

  // 10. Admin Students List
  await test('Admin Student Management Directory (/api/admin/students)', async () => {
    const res = await fetch(`${BASE_URL}/admin/students`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.students) || data.students.length < 1) {
      throw new Error('Students list failed to load');
    }
  });

  // 11. Admin Create New Course
  let newCourse = null;
  await test('Admin Create Course (/api/courses)', async () => {
    const res = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Backend Systems Engineering in Node.js',
        description: 'Comprehensive guide to building high-scale backends, microservices, and databases.',
        category: 'Backend Development',
        duration: '10 Weeks',
        instructor: 'Dr. Sarah Jenkins',
        price: 3499,
        originalPrice: 7999,
        isPublished: false
      })
    });
    const data = await res.json();
    if (!data.success || !data.course._id) {
      throw new Error(data.message || 'Course creation failed');
    }
    newCourse = data.course;
  });

  // 12. Admin Add Module
  let newModule = null;
  await test('Admin Add Module to Course (/api/courses/:id/modules)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${newCourse._id}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Module 1: High Performance HTTP & Event Loop',
        description: 'Deep dive into libuv, thread pool, and non-blocking I/O.'
      })
    });
    const data = await res.json();
    if (!data.success || !data.course.modules || data.course.modules.length === 0) {
      throw new Error('Failed to append module');
    }
    newModule = data.course.modules[data.course.modules.length - 1];
  });

  // 13. Admin Add Lecture (Upload vs External URL distinction)
  await test('Admin Add Lecture with Video Source (/api/courses/:id/lectures)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${newCourse._id}/lectures`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        moduleId: newModule._id,
        title: 'Understanding libuv & Event Loop Internals',
        durationMinutes: 28,
        videoSource: 'external',
        videoUrl: 'https://www.youtube-nocookie.com/embed/PNa9OM64900',
        isFreePreview: true,
        notesSource: 'text',
        notesText: 'libuv handles the asynchronous event-driven I/O in Node.js.'
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error('Failed to append lecture');
    }
  });

  // 14. Admin Add Assignment
  await test('Admin Add Assignment to Course (/api/courses/:id/assignments)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${newCourse._id}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Build a Custom In-Memory LRU Cache',
        description: 'Implement a doubly linked list + hash map LRU cache with TTL in Node.js.',
        deadlineDays: 14
      })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error('Failed to append assignment');
    }
  });

  // 15. Admin Toggle Publish Status
  await test('Admin 1-Click Publish Toggle (/api/courses/:id/toggle-publish)', async () => {
    const res = await fetch(`${BASE_URL}/courses/${newCourse._id}/toggle-publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || data.isPublished !== true) {
      throw new Error('Toggle publish did not activate course');
    }
  });

  // 16. Verify Newly Published Course in Public Catalogue
  await test('Public Catalogue Reflects Newly Published Course', async () => {
    const res = await fetch(`${BASE_URL}/courses`);
    const data = await res.json();
    const found = data.courses.some(c => c._id === newCourse._id);
    if (!found) {
      throw new Error('Newly published course is missing from public catalogue');
    }
  });

  // 17. Admin Update CMS Settings
  await test('Admin CMS Settings Customization (/api/cms/settings)', async () => {
    const updatedTagline = `Elevate Your Engineering Career • Updated ${new Date().getFullYear()}`;
    const res = await fetch(`${BASE_URL}/cms/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        hero: {
          ...cmsSettings.hero,
          badge: updatedTagline
        }
      })
    });
    const data = await res.json();
    if (!data.success || data.settings.hero.badge !== updatedTagline) {
      throw new Error('CMS settings update did not persist');
    }

    // Verify public endpoint gets updated data
    const publicRes = await fetch(`${BASE_URL}/cms/settings`);
    const publicData = await publicRes.json();
    if (publicData.settings.hero.badge !== updatedTagline) {
      throw new Error('Public endpoint did not reflect updated CMS badge');
    }
  });

  // 18. Admin Media Library
  await test('Admin Media Library Directory (/api/media)', async () => {
    const res = await fetch(`${BASE_URL}/media`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (!data.success || !Array.isArray(data.media)) {
      throw new Error('Failed to load media library');
    }
  });

  console.log(`\n========================================`);
  console.log(`Mathematics Academy Verification: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runPlatformTests();
