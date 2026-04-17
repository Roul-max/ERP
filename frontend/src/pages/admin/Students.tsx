import React, { useEffect, useState, useCallback } from 'react';
import client from '../../api/client';
import StudentTable from '../../components/student/StudentTable';
import StudentForm from '../../components/student/StudentForm';
import ConfirmModal from '../../components/ConfirmModal';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, RefreshCcw, ArrowUpDown } from 'lucide-react';

const Students: React.FC = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [loadError, setLoadError] = useState<string>('');

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter & Pagination & Sort State
  const [filters, setFilters] = useState({
    name: '',
    department: '',
    batch: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'createdAt',
    direction: 'desc'
  });

  const fetchStudents = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = {
        page,
        limit: 10,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.direction,
        ...filters
      };
      const res = await client.get('/students', { params });
      setStudents(res.data.students);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error(error);
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Failed to load students';
      setStudents([]);
      setTotalPages(1);
      setLoadError(message);
      window.dispatchEvent(
        new CustomEvent('ui-toast', {
          detail: { type: 'error', message: message === 'Not authorized, no token' ? 'Please log in again.' : message }
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce fetch when filters or sort change
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, filters, sortConfig]);

  const confirmDelete = useCallback((id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  }, []);

  const executeDelete = async () => {
    if (deleteId) {
      try {
        await client.delete(`/students/${deleteId}`);
        fetchStudents();
      } catch (error) {
        console.error(error);
        window.dispatchEvent(
          new CustomEvent("ui-toast", {
            detail: { type: "error", message: "Failed to delete student" },
          })
        );
      }
    }
  };

  const handleEdit = useCallback((student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  }, []);

  const handleCreate = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
      setFilters({ name: '', department: '', batch: '' });
      setPage(1);
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage student records, enrollments, and profiles.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Search by Name, Email or Roll No"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <div className="relative min-w-[180px]">
                    <select 
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none"
                    >
                        <option value="">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                
                <input 
                    name="batch"
                    value={filters.batch}
                    onChange={handleFilterChange}
                    placeholder="Batch (e.g. 2026)"
                    className="w-28 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400 text-center"
                />
                
                <button 
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium border border-gray-200 dark:border-gray-600"
                    title="Reset Filters"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>
        </div>
      </div>

      <div className="relative min-h-[400px] flex flex-col">
        {loadError ? (
          <div className="mb-4 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50/70 dark:bg-red-950/20 p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-200">{loadError}</p>
            <p className="text-xs text-red-600/80 dark:text-red-300/80 mt-1">
              Tip: only <span className="font-bold">admin</span> accounts can view the student list.
            </p>
          </div>
        ) : null}
        {loading && (
             <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl transition-all">
                 <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading data...</span>
                 </div>
             </div>
        )}
        <StudentTable 
            students={students} 
            onDelete={confirmDelete} 
            onEdit={handleEdit}
            onSort={handleSort}
            sortConfig={sortConfig}
        />
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                  <ChevronLeft size={16} /> Previous
              </button>
              <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                  Next <ChevronRight size={16} />
              </button>
          </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <StudentForm 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchStudents} 
            initialData={editingStudent}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student profile? This action cannot be undone and will remove all associated records."
        confirmText="Delete Student"
        isDestructive={true}
      />
    </div>
  );
};

export default Students;
