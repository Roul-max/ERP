import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { BookOpen, Users, Clock, GraduationCap, ArrowLeft, Mail, FileText, Download } from 'lucide-react';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await client.get(`/courses/${id}`);
        setCourse(courseRes.data);
        
        // Fetch students from the same department as a simple "enrollment" proxy for this MVP
        const studentsRes = await client.get('/students', { 
            params: { department: courseRes.data.department, limit: 100 } 
        });
        setStudents(studentsRes.data.students);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to Courses
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold tracking-wide">
                        {course.code}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Semester {course.semester}</span>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{course.name}</h1>
                <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-500" />
                        <span className="font-medium">{course.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-amber-500" />
                        <span className="font-medium">{course.credits} Credits</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl min-w-[300px] border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
                        {course.faculty?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{course.faculty?.name || 'Unassigned'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail size={12} /> {course.faculty?.email || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Students */}
        <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users size={24} className="text-blue-500" /> Enrolled Students
                </h2>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                    {students.length} Students
                </span>
             </div>

             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {students.map((student) => (
                                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                {student.user?.name?.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{student.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{student.rollNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>

        {/* Right Col: Materials & Stats */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-purple-500" /> Course Materials
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-gray-600 rounded-lg text-red-500 shadow-sm">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Lecture_Notes_{item}.pdf</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">1.2 MB • 2 days ago</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                                <Download size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-dashed border-blue-200 dark:border-blue-800">
                    + Upload New Material
                </button>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Semester Progress</h3>
                    <p className="text-indigo-100 text-sm mb-4">You are 65% through the semester content.</p>
                    <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                        <div className="bg-white h-2 rounded-full w-[65%] shadow-sm"></div>
                    </div>
                    <p className="text-right text-xs font-bold">Week 8 of 12</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
