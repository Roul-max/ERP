import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { CalendarCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const StudentAttendance: React.FC = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    client.get('/attendance/my').then(res => setRecords(res.data));
  }, []);

  const getIcon = (status: string) => {
    if (status === 'Present') return <CheckCircle className="text-green-500" size={20} />;
    if (status === 'Absent') return <XCircle className="text-red-500" size={20} />;
    return <Clock className="text-yellow-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.map((record: any, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {record.course?.name} <span className="text-gray-400">({record.course?.code})</span>
                </td>
                <td className="px-6 py-4 flex items-center gap-2 text-sm font-medium">
                  {getIcon(record.status)}
                  <span className={
                    record.status === 'Present' ? 'text-green-600' :
                    record.status === 'Absent' ? 'text-red-600' : 'text-yellow-600'
                  }>{record.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;