import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Plus, Eye, X, BookOpen, CheckCircle, BarChart3, Users, Edit } from 'lucide-react';

const Exams: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalResults, setModalResults] = useState<any[]>([]);
  const [currentExamName, setCurrentExamName] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register: registerExam, handleSubmit: submitExam, reset: resetExam } = useForm();
  const { register: registerResult, handleSubmit: submitResult, reset: resetResult } = useForm();

  const fetchData = async () => {
    try {
      const examsRes = await client.get('/exams/faculty');
      setExams(examsRes.data);
      
      // Admin should see all courses to schedule exams for anyone
      // Faculty should only see their own courses
      const courseEndpoint = user?.role === 'admin' ? '/courses' : '/courses/my';
      const coursesRes = await client.get(courseEndpoint);
      setCourses(coursesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    client.get('/students').then(res => setStudents(res.data.students)).catch(console.error);
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const onExamSubmit = async (data: any) => {
    try {
      await client.post('/exams', data);
      resetExam();
      fetchData();
      showSuccess('Exam scheduled successfully!');
    } catch (e) {
      // Error handled by global interceptor
    }
  };

  const onResultSubmit = async (data: any) => {
    try {
      await client.post('/exams/results', data);
      resetResult();
      fetchData(); // Refresh to update counts
      showSuccess('Student result recorded successfully!');
    } catch (e) {
      // Error handled by global interceptor
    }
  };

  const viewResults = async (exam: any) => {
    setLoadingModal(true);
    setCurrentExamName(exam.name);
    setIsModalOpen(true);
    try {
      const res = await client.get(`/exams/${exam._id}/results`);
      setModalResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModal(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute validation (Local Time)
  const dt = new Date();
  const today = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-8 relative max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Schedule exams and manage student results efficiently.</p>
         </div>
         <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30">
            <BarChart3 size={20} />
            <span className="font-medium">Total Exams: {exams.length}</span>
         </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Schedule Exam Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Calendar size={24} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule New Exam</h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Create a new assessment for your course</p>
                </div>
             </div>
          </div>
          <div className="p-6">
            <form onSubmit={submitExam(onExamSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                        <select {...registerExam('course', { required: true })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white">
                        <option value="">Select Course</option>
                        {courses.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Title</label>
                        <input {...registerExam('name', { required: true })} placeholder="e.g. Mid-term 2026" className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <input 
                            {...registerExam('date', { required: true })} 
                            type="date" 
                            min={today}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Marks</label>
                        <input {...registerExam('totalMarks', { required: true })} type="number" placeholder="100" className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
                    </div>
                </div>
                <button className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    <Plus size={20} /> Schedule Exam
                </button>
            </form>
          </div>
        </div>

        {/* Record Result Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <Edit size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Results</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Enter marks for individual students</p>
                </div>
             </div>
          </div>
          <div className="p-6">
             <form onSubmit={submitResult(onResultSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Exam</label>
                    <select 
                        {...registerResult('exam', { required: true })} 
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white"
                        onChange={(e) => setSelectedExamId(e.target.value)}
                    >
                    <option value="">Select an upcoming or past exam</option>
                    {exams.map((e: any) => <option key={e._id} value={e._id}>{e.name} — {e.course?.code}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
                        <select {...registerResult('student', { required: true })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white">
                        <option value="">Search by name or roll no</option>
                        {students.map((s: any) => <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marks</label>
                        <input {...registerResult('marksObtained', { required: true })} type="number" placeholder="0.00" className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all dark:text-white" />
                    </div>
                </div>
                <button className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                    <CheckCircle size={20} /> Save Result
                </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Scheduled Exams Overview */}
      <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} className="text-gray-400" />
            Scheduled Exams Overview
         </h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No exams scheduled yet.</p>
                </div>
            ) : (
                exams.map((exam: any) => (
                    <div key={exam._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                                    {exam.course?.code || 'N/A'}
                                </span>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors">{exam.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exam.course?.name}</p>
                            </div>
                            <div className="text-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg min-w-[60px]">
                                <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</span>
                                <span className="block text-lg font-bold text-gray-900 dark:text-white">{exam.totalMarks}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <Calendar size={16} />
                            <span>{new Date(exam.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                             <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Users size={16} />
                                <span>{exam.resultCount || 0} Results</span>
                             </div>
                             <button 
                                onClick={() => viewResults(exam)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                                <Eye size={18} /> View Results
                            </button>
                        </div>
                    </div>
                ))
            )}
         </div>
      </div>

      {/* View Results Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-gray-900/5">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exam Results</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{currentExamName}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-0 flex-1">
                    {loadingModal ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : modalResults.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Results Found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">No results have been recorded for this exam yet.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student Name</th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll Number</th>
                                    <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks Obtained</th>
                                    <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {modalResults.map((res: any) => (
                                    <tr key={res._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-bold mr-3">
                                                    {res.student?.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{res.student?.user?.name || 'Unknown'}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{res.student?.rollNumber || 'N/A'}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-medium">{res.marksObtained}</td>
                                        <td className="px-8 py-4 whitespace-nowrap text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                ${['A+', 'A', 'A-'].includes(res.grade) ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                                                  ['B+', 'B', 'B-'].includes(res.grade) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                  ['C+', 'C', 'C-'].includes(res.grade) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                {res.grade}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-right">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
