import React from 'react';
import { Trash2, Edit2, Mail, Hash, Layers, Calendar, CheckCircle, XCircle, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';

interface StudentTableProps {
  students: any[];
  onDelete: (id: string) => void;
  onEdit: (student: any) => void;
  onSort: (field: string) => void;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
}

const StudentTable: React.FC<StudentTableProps> = React.memo(({ students, onDelete, onEdit, onSort, sortConfig }) => {
  
  const SortIcon = ({ field }: { field: string }) => {
    if (sortConfig.field !== field) return <div className="w-4 h-4" />; // Placeholder for alignment
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (students.length === 0) {
      return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-600">
                  <Layers className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Students Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">We couldn't find any students matching your current filters. Try adjusting your search criteria.</p>
          </div>
      )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 z-10 w-[35%]">
                <div className="flex items-center gap-2">Student Profile</div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 z-10 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => onSort('department')}
              >
                <div className="flex items-center gap-2">
                  Department
                  <span className="text-gray-300 group-hover:text-blue-500 transition-colors"><SortIcon field="department" /></span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 z-10 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => onSort('batch')}
              >
                <div className="flex items-center gap-2">
                  Batch
                  <span className="text-gray-300 group-hover:text-blue-500 transition-colors"><SortIcon field="batch" /></span>
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 z-10 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => onSort('createdAt')}
              >
                 <div className="flex items-center gap-2">
                  Status
                  <span className="text-gray-300 group-hover:text-blue-500 transition-colors"><SortIcon field="createdAt" /></span>
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 z-10">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-11 w-11 relative">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-lg shadow-inner border border-blue-200/50 dark:border-blue-700/30">
                            {student.user?.name?.charAt(0) || 'S'}
                        </div>
                        {student.user?.isActive && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {student.user?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                             <Mail size={12} /> {student.user?.email}
                          </div>
                          <span className="text-gray-300 dark:text-gray-600">|</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                             <Hash size={11} /> {student.rollNumber}
                          </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{student.batch}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {student.user?.isActive ? (
                     <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md w-fit border border-green-100 dark:border-green-900/30">
                        <CheckCircle size={14} />
                        <span className="text-xs font-semibold">Active</span>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-md w-fit border border-red-100 dark:border-red-900/30">
                        <XCircle size={14} />
                        <span className="text-xs font-semibold">Inactive</span>
                     </div>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={() => onEdit(student)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Edit Student"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(student._id)} 
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Student"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg lg:hidden">
                        <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default StudentTable;