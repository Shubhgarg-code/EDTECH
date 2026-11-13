import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  Eye,
  CheckCircle2,
  XCircle,
  Plus,
  ShieldCheck,
  Clock,
  X
} from 'lucide-react';

export const AdminStudentsPage = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Student Modal for detailed view & manual enrollment
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get(`/admin/students?search=${search}`),
        api.get('/courses/admin/all')
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (coursesRes.success) setCourses(coursesRes.courses);
    } catch (err) {
      showToast(err.message || 'Error fetching student data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenStudentModal = async (student) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/students/${student._id}`);
      if (res.success) {
        setStudentDetails(res);
      }
    } catch (err) {
      showToast('Could not load student detailed progress.', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleEnrollment = async (courseId, action) => {
    if (!selectedStudent) return;
    try {
      const res = await api.post('/admin/enrollment', {
        userId: selectedStudent._id,
        courseId,
        action
      });
      if (res.success) {
        showToast(res.message, 'success');
        // Refresh details
        const refreshed = await api.get(`/admin/students/${selectedStudent._id}`);
        if (refreshed.success) setStudentDetails(refreshed);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update enrollment.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-500">
            Real registered student accounts, actual learning progress, and manual course enrollment control.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No registered students found</h3>
          <p className="text-xs text-slate-500">
            Students who register on the public portal will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Enrolled Courses</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((std) => (
                  <tr key={std._id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {std.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{std.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{std.email}</td>
                    <td className="p-4 text-slate-500">{std.phone || '—'}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                        {std.enrolledCourses?.length || 0} Courses
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(std.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStudentModal(std)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Inspect Progress
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS & ENROLLMENT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading student record...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Real Learning Progress */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Current Course Progress (Database Records)
                  </h4>
                  {studentDetails?.progress?.length === 0 ? (
                    <p className="text-slate-400 italic">No progress recorded yet.</p>
                  ) : (
                    studentDetails?.progress?.map((p) => (
                      <div
                        key={p._id}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{p.course?.title || 'Course'}</span>
                          <span className="text-blue-600">{p.percentage}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${p.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Completed Lectures: {p.completedLectures?.length || 0}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Course Enrollment Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Manual Course Access Controls
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {courses.map((course) => {
                      const isEnrolled = studentDetails?.student?.enrolledCourses?.some(
                        (ec) => ec.course?._id === course._id || ec.course === course._id
                      );

                      return (
                        <div
                          key={course._id}
                          className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{course.title}</span>
                            <span className="text-slate-400 text-[11px] block">{course.batchName}</span>
                          </div>

                          {isEnrolled ? (
                            <button
                              onClick={() => handleToggleEnrollment(course._id, 'revoke')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold text-[11px] transition"
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleEnrollment(course._id, 'grant')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-[11px] transition"
                            >
                              Grant Access
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
