# Mathematics Academy — Production EdTech Platform & Admin CMS

A production-grade, content-managed mathematics education platform and Learning Management System (LMS) with a dedicated **Admin CMS Dashboard**. 

Engineered with **zero fabricated data**: no dummy statistics, no fake testimonials, no artificial ratings, and no hardcoded logos. All platform content, courses, modules, lectures, announcements, FAQs, and visitor inquiries are managed in real time through the Admin CMS and stored in MongoDB.

---

## 🌟 Key Architecture & Capabilities

### 1. Dedicated Admin CMS Panel (`/admin/*`)
A secured, fully isolated administration interface with role-based access control (`role === 'admin'`).
- **Dashboard Overview (`/admin`)**: Real-time database analytics displaying actual counts of published courses, registered students, uploaded media files, contact inquiries, and a live audit trail of recent platform activity.
- **Course Management (`/admin/courses`)**:
  - Full CRUD: Create, edit, and delete mathematics courses.
  - 1-Click Publish / Draft toggle (draft courses are hidden from the public catalogue).
  - Thumbnail upload or custom image URL, pricing, batch duration, and category management (Algebra, Calculus, Geometry, Trigonometry, Statistics, etc.).
- **Course Content & Curriculum Builder (`/admin/courses/:id/content`)**:
  - **Modules & Chapters**: Create, reorder, and structure modular course syllabi.
  - **Lectures**: Add video lessons with clear distinction between **uploaded local video files** (`.mp4`, `.webm`) and **external video URLs** (YouTube, Vimeo, CDN).
  - **Lecture Notes**: Attach either **uploaded PDF documents** or inline formatted text notes with key formulas.
  - **Assignments**: Create problem sets and assignments with deadlines, problem statements, and reference materials.
- **Website CMS (`/admin/cms`)**:
  - **Brand & Hero Section**: Edit brand name, headline, subheadline, badge, CTA buttons, and hero banner image.
  - **About Us**: Manage educational philosophy, mission, vision, and core pedagogical pillars.
  - **Contact & Inquiries Inbox**: Live inbox of messages submitted through the public Contact form with read/replied status management.
  - **Section Visibility Controls**: Toggle display of course categories, FAQs, and announcements on the public homepage.
  - **FAQ Manager**: Add, edit, and remove frequently asked questions.
  - **Announcements**: Broadcast urgent notices and batch updates.
  - **Footer Customizer**: Edit copyright text and contact coordinates.
- **Media Library (`/admin/media`)**:
  - Direct file upload with `multer` supporting Images (JPG, PNG, WebP), Documents (PDF), and Videos (MP4, WebM) up to 100MB.
  - Filter by media type, 1-click copy URL to clipboard, and physical disk deletion.
- **Student Management (`/admin/students`)**:
  - View registered students (real database records).
  - Inspect individual student profiles and real-time lecture completion progress.
  - Manual 1-click course enrollment toggle.
- **Assignment Grading Portal (`/admin/assignments`)**:
  - Review student submissions (solution links, reference URLs, and student notes).
  - Submit scores (0–100) and instructor feedback.

---

## 2. Public Platform (`/`)
- **Homepage (`/`)**: 100% CMS-driven. Renders hero, active announcements, published course cards, categories, FAQs, and clean empty states whenever a section has no uploaded content.
- **About Us (`/about`)**: Dynamic academic overview powered by the CMS.
- **Courses Catalogue (`/courses`)**: Instant client/server filtering across published courses with category pills, keyword search, and price sorting.
- **Course Detail (`/courses/:slug`)**: Full syllabus inspection, module breakdowns, free preview lectures, instructor credentials, and direct enrollment.
- **Contact Us (`/contact`)**: Interactive inquiry form that directly saves visitor messages into the Admin Inquiries Inbox.

---

## 3. Student LMS & Learning Experience (`/learn/*`)
- **Student Dashboard (`/dashboard`)**: Enrolled courses, lecture watch progress bars, and recent activity.
- **Classroom Player (`/learn/classroom/:courseId`)**:
  - Custom HTML5 Video Player with playback speeds (`0.75x`, `1x`, `1.25x`, `1.5x`, `2x`), 10-second skip, and fullscreen mode.
  - Automated progress synchronization to backend every 8 seconds.
  - Notes viewer, downloadable resources, and assignment submission modal.
  - Verifiable certificate generation upon 100% course completion.

---

## 4. Security & Authentication
- **Role-Based Access Control**: Strict separation between `student` and `admin`.
- **Public Registration Lock**: Public registration endpoint (`/api/auth/register`) strictly forces `role = 'student'`. Administrative accounts can never be created via the public registration form.
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **JWT Authentication**: Secure Bearer tokens with 7-day expiration.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Tailwind CSS 4, React Router 7, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express 5, Mongoose 9, Multer, JWT, BcryptJS, Morgan, Dotenv |
| **Database** | MongoDB with Mongoose (Automatic fallback to embedded `mongodb-memory-server` for zero-dependency execution) |
| **Storage** | Local disk storage (`server/uploads/`) with static serving |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Installation
Install root, server, and client dependencies:
```bash
npm run install:all
```
*(Or run `npm install` inside `server/` and `client/` respectively)*

### 2. Environment Configuration
The platform runs immediately out of the box with embedded MongoDB. To specify a custom database or ports, configure `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=                     # Leave blank to use portable in-memory MongoDB
JWT_SECRET=math_academy_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Running the Application
Start both the Express backend and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mathacademy.in` | `Admin@123` | Full Admin CMS, Courses CRUD, Content Builder, Media Library, Student Grading |
| **Student** | `student@mathacademy.in` | `Student@123` | Student Dashboard, Enrolled Courses, LMS Classroom, Assignment Submissions |

*(Tip: On the `/login` screen, use the "Admin Demo" or "Student Demo" quick-fill buttons for immediate access).*

---

## 🧪 Verification & Automated Testing

A dedicated end-to-end verification script covers 18 test points across health checks, CMS settings, contact inquiries, course authoring, module/lecture creation, 1-click publishing, and media management:

```bash
node server/test-platform.js
```

### Test Results Summary:
```
🚀 Running Mathematics Academy Platform & CMS Verification Suite...

  ✅ PASS: System Health Check (/api/health)
  ✅ PASS: Public CMS Settings Retrieval (/api/cms/settings)
  ✅ PASS: Public Course Catalogue (/api/courses)
  ✅ PASS: Public Course Details (/api/courses/:slug)
  ✅ PASS: Public Visitor Contact Inquiry (/api/cms/contact)
  ✅ PASS: Student Registration & Role Enforcement (/api/auth/register)
  ✅ PASS: Admin Authentication (/api/auth/login)
  ✅ PASS: Admin Inquiries Inbox Retrieval (/api/cms/messages)
  ✅ PASS: Admin Real Platform Metrics (/api/admin/analytics)
  ✅ PASS: Admin Student Management Directory (/api/admin/students)
  ✅ PASS: Admin Create Course (/api/courses)
  ✅ PASS: Admin Add Module to Course (/api/courses/:id/modules)
  ✅ PASS: Admin Add Lecture with Video Source (/api/courses/:id/lectures)
  ✅ PASS: Admin Add Assignment to Course (/api/courses/:id/assignments)
  ✅ PASS: Admin 1-Click Publish Toggle (/api/courses/:id/toggle-publish)
  ✅ PASS: Public Catalogue Reflects Newly Published Course
  ✅ PASS: Admin CMS Settings Customization (/api/cms/settings)
  ✅ PASS: Admin Media Library Directory (/api/media)

================================================
Mathematics Academy Verification: 18 Passed, 0 Failed
================================================
```

---

## 📁 Repository Structure

```
aman sir/
├── client/                     # Frontend React + Vite
│   ├── src/
│   │   ├── api/                # API client with JWT header injection
│   │   ├── components/         # Navbar, Footer, CourseCard, VideoPlayer, Modals
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Public Pages, LMS, Dashboard
│   │   │   └── admin/          # AdminLayout, AdminOverview, AdminCourses, AdminCourseContent,
│   │   │                       # AdminCms, AdminMedia, AdminStudents, AdminAssignments
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx
│   └── package.json
│
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── config/             # DB connector & environment configuration
│   │   ├── controllers/        # Auth, Admin, Course, CMS, Media, Learning, Payment
│   │   ├── middleware/         # Auth guard, Role RBAC, Multer upload, Error handler
│   │   ├── models/             # User, Course, SiteSettings, Media, ContactMessage, Progress
│   │   ├── routes/             # Modular Express routers
│   │   ├── seeders/            # Initializer with authentic starter course & CMS settings
│   │   └── server.js           # Express application mount
│   ├── uploads/                # Local physical storage for images, PDFs, and MP4 videos
│   ├── test-platform.js        # Comprehensive automated verification suite
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md                   # Platform documentation
```
