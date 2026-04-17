import React, { useState, useEffect } from "react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import { toastError, toastSuccess } from "../../utils/toast";

const MarkAttendance: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    client.get('/courses/my').then(res => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // For prototype, fetching all students. Ideally filter by course enrollment
      client.get('/students').then(res => {
         // Initialize attendance status to 'Present' for all
         const initialAttendance: Record<string, string> = {};
         res.data.students.forEach((s: any) => initialAttendance[s._id] = 'Present');
         setStudents(res.data.students);
         setAttendance(initialAttendance);
      });
    }
  }, [selectedCourse]);

  const handleSubmit = async () => {
    if (!selectedCourse) return;
    
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      status
    }));

    try {
      await client.post('/attendance', {
        courseId: selectedCourse,
        date,
        records
      });
      toastSuccess("Attendance saved");
    } catch (error) {
      toastError("Failed to save attendance");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Mark attendance"
        description="Record attendance for a class session."
      />
      
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <Select
            label="Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select course</option>
            {courses.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {selectedCourse && (
          <>
            <div className="mt-6 border-t pt-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Student List</h3>
              {students.map(student => (
                <div key={student._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded border-b dark:border-gray-700">
                  <span className="font-medium dark:text-white">{student.user?.name} <span className="text-gray-400 text-sm">({student.rollNumber})</span></span>
                  <div className="flex gap-2">
                    {['Present', 'Absent', 'Late'].map(status => (
                      <button
                        key={status}
                        onClick={() => setAttendance(prev => ({ ...prev, [student._id]: status }))}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          attendance[student._id] === status 
                            ? status === 'Present' ? 'bg-green-100 text-green-700' : status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Save attendance
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default MarkAttendance;
