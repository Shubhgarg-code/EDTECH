import React, { useState, useEffect } from 'react';
import { api } from '../api/apiClient';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Award,
  Video,
  FileText,
  Loader2
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('courses'); // courses | students | assignments | financial
  const [loading, setLoading] = useState(true);

  // New Course Modal State
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Web Development',
    level: 'All Levels',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    price: 6999,
    discountPrice: 3499,
    batchName: 'Cohort 2026',
    schedule: 'Mon, Wed, Fri 8:00 PM IST'
  });
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  // Add Module & Lecture Modal State
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [selectedCourseForLecture, setSelectedCourseForLecture] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDuration, setLectureDuration] = useState('20:00');
  const [lectureVideoUrl, setLectureVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [isFreePreview, setIsFreePreview] = useState(false);

  // Grade Assignment State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState(90);
  const [gradeFeedback, setGradeFeedback] = useState('Great clean implementation!');

  const fetchData = async () => {
    try {
      const [analyticsRes, studentsRes, submissionsRes, coursesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/students'),
        api.get('/assignments/all'),
        api.get('/courses')
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (studentsRes.success) setStudents(studentsRes.users);
      if (submissionsRes.success) setSubmissions(submissionsRes.submissions);
      if (coursesRes.success) setCourses(coursesRes.courses);
    } catch (err) {
      showToast(err.message || 'Failed to fetch admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setIsCreatingCourse(true);
    try {
      const res = await api.post('/courses', newCourse);
      if (res.success) {
        showToast('New batch created successfully!', 'success');
        setShowCreateCourseModal(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create course.', 'error');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourseForModule || !moduleTitle) return;
    try {
      const res = await api.post(`/courses/${selectedCourseForModule._id}/modules`, {
        title: moduleTitle
      });
      if (res.success) {
        showToast('Module added successfully!', 'success');
        setSelectedCourseForModule(null);
        setModuleTitle('');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add module.', 'error');
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!selectedCourseForLecture || !selectedModuleId || !lectureTitle) return;
    try {
      const res = await api.post(
        `/courses/${selectedCourseForLecture._id}/modules/${selectedModuleId}/lectures`,
        {
          title: lectureTitle,
          duration: lectureDuration,
          videoUrl: lectureVideoUrl,
          isFreePreview
        }
      );
      if (res.success) {
        showToast('Lecture added to module successfully!', 'success');
        setSelectedCourseForLecture(null);
        setLectureTitle('');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add lecture.', 'error');
    }
  };

  const handleToggleEnrollment = async (userId, courseId, action) => {
    try {
      const res = await api.post('/admin/enrollment', { userId, courseId, action });
      if (res.success) {
        showToast(res.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Enrollment toggle failed.', 'error');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      const res = await api.put(`/assignments/grade/${selectedSubmission._id}`, {
        score: gradeScore,
        feedback: gradeFeedback,
        status: 'reviewed'
      });
      if (res.success) {
        showToast('Grade and feedback saved!', 'success');
        setSelectedSubmission(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Grading failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-4">Loading Admin Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Administration & Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Console
          </h1>
        </div>

        <button
          onClick={() => setShowCreateCourseModal(true)}
          className="self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 font-medium">Total Platform Revenue</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{analytics?.totalStudents || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Registered Students</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{analytics?.totalCourses || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Active Batches</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{analytics?.totalOrdersCount || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Paid Enrollments</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'courses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Course Management ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Enrollments ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Assignment Evaluations ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('financial')}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === 'financial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Recent Transactions
        </button>
      </div>

      {/* TAB 1: Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {course.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500">{course.batchName}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <span>Fee: ₹{course.discountPrice}</span>
                    <span>Enrolled: {course.totalEnrolled}</span>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedCourseForModule(course)}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                  >
                    + Add Module
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseForLecture(course);
                      if (course.modules?.length > 0) {
                        setSelectedModuleId(course.modules[0]._id);
                      }
                    }}
                    className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition"
                  >
                    + Add Lecture
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Students & Manual Enrollment */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Enrolled Batches</th>
                  <th className="p-4 text-right">Quick Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-50/60">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={std.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80'}
                        alt={std.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-900">{std.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{std.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          std.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {std.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {std.enrolledCourses?.map((e) => (
                          <span
                            key={e._id || e.course?._id}
                            className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium"
                          >
                            {e.course?.title ? e.course.title.slice(0, 20) + '...' : 'Course'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      {courses.slice(0, 1).map((c) => {
                        const isEnrolled = std.enrolledCourses?.some(
                          (ec) => ec.course?._id === c._id || ec.course === c._id
                        );
                        return isEnrolled ? (
                          <button
                            key={c._id}
                            onClick={() => handleToggleEnrollment(std._id, c._id, 'revoke')}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-semibold text-[11px] hover:bg-rose-100 transition"
                          >
                            Revoke Sigma
                          </button>
                        ) : (
                          <button
                            key={c._id}
                            onClick={() => handleToggleEnrollment(std._id, c._id, 'grant')}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px] hover:bg-emerald-100 transition"
                          >
                            Grant Sigma
                          </button>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Assignment Evaluations */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No student submissions submitted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{sub.title}</h4>
                      <p className="text-xs text-slate-500">
                        By {sub.user?.name} ({sub.user?.email})
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sub.status === 'reviewed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'reviewed' ? `Graded: ${sub.score}/100` : 'Pending Review'}
                    </span>
                  </div>

                  <div className="flex gap-4 text-xs text-blue-600 pt-1">
                    {sub.githubUrl && (
                      <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Repository
                      </a>
                    )}
                    {sub.liveUrl && (
                      <a href={sub.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Live URL
                      </a>
                    )}
                  </div>

                  {sub.submissionNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{sub.submissionNotes}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setGradeScore(sub.score || 95);
                        setGradeFeedback(sub.feedback || 'Great clean structure and execution!');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      {sub.status === 'reviewed' ? 'Update Grade & Feedback' : 'Grade Assignment'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Financial Transactions */}
      {activeTab === 'financial' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {analytics?.recentOrders?.map((ord) => (
                  <tr key={ord._id}>
                    <td className="p-4 font-mono font-bold text-slate-900">{ord.receiptNumber || ord.orderId}</td>
                    <td className="p-4">{ord.user?.name}</td>
                    <td className="p-4 font-medium text-blue-600">{ord.course?.title}</td>
                    <td className="p-4 font-bold text-slate-900">₹{ord.amount}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        PAID
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create Course */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-slate-900">Create New Course Batch</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Title</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g. Next.js 15 Full Stack Architecture"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={newCourse.tagline}
                  onChange={(e) => setNewCourse({ ...newCourse, tagline: e.target.value })}
                  placeholder="High impact subtitle"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option>Web Development</option>
                    <option>Data Structures & Algorithms</option>
                    <option>System Design</option>
                    <option>AI & Machine Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option>All Levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={newCourse.discountPrice}
                    onChange={(e) => setNewCourse({ ...newCourse, discountPrice: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed course description..."
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCourseModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCourse}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl"
                >
                  {isCreatingCourse ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Module */}
      {selectedCourseForModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              Add Module to {selectedCourseForModule.title}
            </h3>
            <form onSubmit={handleAddModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Module Title</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 4: Authentication & JWT Security"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForModule(null)}
                  className="px-3 py-1.5 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Lecture */}
      {selectedCourseForLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              Add Lecture to {selectedCourseForLecture.title}
            </h3>
            <form onSubmit={handleAddLecture} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Module</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {selectedCourseForLecture.modules?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lecture Title</label>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="e.g. 1. Refresh Tokens & HTTP-Only Cookies"
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={lectureDuration}
                    onChange={(e) => setLectureDuration(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Free Preview?</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      className="rounded"
                    />
                    <span>Allow Free Preview</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Video Stream URL</label>
                <input
                  type="url"
                  value={lectureVideoUrl}
                  onChange={(e) => setLectureVideoUrl(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForLecture(null)}
                  className="px-3 py-1.5 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
                  Save Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Grade Submission */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              Grade Submission: {selectedSubmission.title}
            </h3>
            <form onSubmit={handleGradeSubmission} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Score (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Feedback to Student</label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3 py-1.5 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-xl">
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

