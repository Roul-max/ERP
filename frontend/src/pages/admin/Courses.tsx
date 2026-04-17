import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import client from '../../api/client';
import { Trash2, BookOpen, Edit2, Plus, X, Search, Filter, ArrowRight, User } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  const navigate = useNavigate();
  const { register, handleSubmit, reset, setValue } = useForm();
  
  const fetchCourses = async () => {
    try {
      const res = await client.get('/courses');
      setCourses(res.data);
      setFilteredCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = courses;
    if (search) {
      result = result.filter((c: any) => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.code.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (deptFilter) {
      result = result.filter((c: any) => c.department === deptFilter);
    }
    if (semesterFilter) {
      result = result.filter((c: any) => c.semester.toString() === semesterFilter);
    }
    setFilteredCourses(result);
  }, [search, deptFilter, semesterFilter, courses]);

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setValue('name', course.name);
    setValue('code', course.code);
    setValue('department', course.department);
    setValue('credits', course.credits);
    setValue('semester', course.semester);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    reset();
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingCourse) {
        await client.put(`/courses/${editingCourse._id}`, data);
      } else {
        await client.post('/courses', data);
      }
      setIsModalOpen(false);
      reset();
      fetchCourses();
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent("ui-toast", {
          detail: { type: "error", message: "Operation failed" },
        })
      );
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (deleteId) {
      try {
        await client.delete(`/courses/${deleteId}`);
        fetchCourses();
      } catch (error) {
        window.dispatchEvent(
          new CustomEvent("ui-toast", {
            detail: { type: "error", message: "Failed to delete course" },
          })
        );
      }
    }
  };

  const departments = Array.from(new Set(courses.map((c: any) => c.department)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage academic courses, credits, and assignments.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} /> Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Course Name or Code"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            >
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course: any) => (
          <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={24} />
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => handleEdit(course)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => confirmDelete(course._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold font-mono mb-2 border border-gray-200 dark:border-gray-600">
                    {course.code}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/courses/${course._id}`)}>
                    {course.name}
                </h3>
              </div>

              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                 <div className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="font-medium text-gray-900 dark:text-white">{course.department}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span>Credits</span>
                    <span className="font-medium text-gray-900 dark:text-white">{course.credits}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span>Semester</span>
                    <span className="font-medium text-gray-900 dark:text-white">{course.semester}</span>
                 </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-xl flex items-center justify-between">
                 <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <User size={14} />
                    {course.faculty?.name || 'Unassigned'}
                 </div>
                 <button 
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
                 >
                    Details <ArrowRight size={16} />
                 </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
                    <input {...register('name', { required: true })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="Introduction to Computer Science" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                        <input {...register('code', { required: true })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="CS-101" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                        <input type="number" {...register('credits', { required: true })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="3" />
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select {...register('department', { required: true })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                    <input type="number" {...register('semester', { required: true })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="1" />
                  </div>
                  <div className="pt-2">
                     <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                        {editingCourse ? 'Save Changes' : 'Create Course'}
                     </button>
                  </div>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This will remove all associated materials and exam schedules."
        confirmText="Delete Course"
        isDestructive={true}
      />
    </div>
  );
};

export default Courses;
