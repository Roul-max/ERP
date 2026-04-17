import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { Award, TrendingUp, Search, BookOpen, GraduationCap } from 'lucide-react';

const Results: React.FC = () => {
  const [results, setResults] = useState([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterExam, setFilterExam] = useState('');

  useEffect(() => {
    client.get('/exams/my-results').then(res => setResults(res.data)).catch(console.error);
  }, []);

  const calculateGPA = () => {
    if (!results.length) return '0.00';
    
    const pointsMap: Record<string, number> = { 
        'A+': 4.0, 'A': 4.0, 'A-': 3.7, 
        'B+': 3.3, 'B': 3.0, 'B-': 2.7, 
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0 
    };

    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach((res: any) => {
        const credits = res.exam?.course?.credits || 0;
        const grade = res.grade || 'F';
        const point = pointsMap[grade] || 0;
        
        if (credits > 0) {
            totalPoints += point * credits;
            totalCredits += credits;
        }
    });

    if (totalCredits === 0) return '0.00';
    return (totalPoints / totalCredits).toFixed(2);
  };

  const filteredResults = results.filter((res: any) => {
      const courseName = res.exam?.course?.name || '';
      const examName = res.exam?.name || '';
      
      const courseMatch = courseName.toLowerCase().includes(filterCourse.toLowerCase());
      const examMatch = examName.toLowerCase().includes(filterExam.toLowerCase());
      
      return courseMatch && examMatch;
  });

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
    if (['B+', 'B', 'B-'].includes(grade)) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (['C+', 'C', 'C-'].includes(grade)) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Academic Performance</h1>
                <p className="text-blue-100 text-lg opacity-90">Track your grades and monitor your progress across all semesters.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="p-3 bg-white/20 rounded-xl">
                    <TrendingUp size={32} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Weighted GPA</p>
                    <p className="text-4xl font-bold text-white tracking-tight">{calculateGPA()}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                placeholder="Search by Course Name..." 
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
        </div>
        <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                placeholder="Search by Exam Name..." 
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((res: any) => {
            const maxMarks = res.exam?.totalMarks || 100;
            const percentage = Math.min((res.marksObtained / maxMarks) * 100, 100);
            
            return (
            <div key={res._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                         <div className="flex items-start gap-3">
                             <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                 <BookOpen size={20} />
                             </div>
                             <div>
                                 <span className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase">{res.exam?.course?.code || 'N/A'}</span>
                                 <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1">{res.exam?.course?.name || 'Unknown Course'}</h3>
                             </div>
                         </div>
                         <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 text-xl font-bold ${getGradeColor(res.grade)}`}>
                             {res.grade}
                         </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <GraduationCap size={16} />
                            <span>{res.exam?.name || 'Exam'}</span>
                            <span className="mx-1">•</span>
                            <span>{res.exam?.course?.credits || 0} Credits</span>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <span className="text-gray-600 dark:text-gray-300 font-medium">Score</span>
                                <span className="text-gray-900 dark:text-white font-bold">{res.marksObtained} <span className="text-gray-400 font-normal">/ {maxMarks}</span></span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        percentage >= 80 ? 'bg-green-500' : 
                                        percentage >= 60 ? 'bg-blue-500' : 
                                        percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )})}
      </div>
      
      {filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Award className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Results Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center mt-1">We couldn't find any results matching your search criteria. Try adjusting your filters.</p>
          </div>
      )}
    </div>
  );
};

export default Results;