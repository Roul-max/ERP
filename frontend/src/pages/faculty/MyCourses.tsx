import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await client.get('/courses/my');
      setCourses(res.data);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your assigned courses and student batches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group flex flex-col relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 p-16 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20"></div>
            
            <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-4">
                     <span className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/50">
                        {course.code}
                     </span>
                     <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors">
                        <BookOpen size={20} />
                     </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/courses/${course._id}`)}>
                    {course.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
                    {course.department} • Semester {course.semester}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                        <Users size={16} className="text-blue-500" />
                        <span className="font-semibold">45 Students</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                        <Clock size={16} className="text-amber-500" />
                        <span className="font-semibold">{course.credits} Credits</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate(`/courses/${course._id}`)}
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
            >
                Manage Course <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
