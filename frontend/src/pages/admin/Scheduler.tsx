import React, { useState, useEffect, useContext } from "react";
import { Plus, Clock, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import client from "../../api/client";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import { toastError, toastSuccess } from "../../utils/toast";

const Scheduler: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 11:15',
    '11:15 - 12:15',
    '12:15 - 01:15',
    '01:15 - 02:15',
    '02:15 - 03:15'
  ];
  const classes = ['CS-2026', 'EE-2026', 'BA-2026', 'ME-2026'];

  const [timetable, setTimetable] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classOrBatch, setClassOrBatch] = useState(classes[0]);
  const { register, handleSubmit, reset } = useForm();

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await client.get('/timetable', { params: { classOrBatch } });
      // Transform flat list to grid object
      // Structure: { 'Monday': { '09:00 - 10:00': { ...entry } } }
      const grid: any = {};
      res.data.forEach((entry: any) => {
        if (!grid[entry.day]) grid[entry.day] = {};
        grid[entry.day][`${entry.startTime} - ${entry.endTime}`] = entry;
      });
      setTimetable(grid);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [classOrBatch]);

  const onSubmit = async (data: any) => {
    const [startTime, endTime] = data.period.split(' - ');
    const payload = {
        day: data.day,
        startTime,
        endTime,
        subject: data.subject,
        teacher: data.teacher,
        classOrBatch
    };

    try {
        await client.post('/timetable', payload);
        reset();
        setIsModalOpen(false);
        fetchTimetable();
        toastSuccess("Schedule added");
    } catch (error) {
        toastError("Failed to add schedule entry");
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm('Remove this class from the schedule?')) {
          try {
              await client.delete(`/timetable/${id}`);
              fetchTimetable();
          } catch (error) {
              console.error(error);
          }
      }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduler"
        description="Manage the weekly timetable for each class or batch."
        actions={
          <div className="flex items-center gap-2">
            <Select
              aria-label="Select class"
              value={classOrBatch}
              onChange={(e) => setClassOrBatch(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            {isAdmin ? (
              <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={18} />}>
                Add
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
           <thead className="bg-gray-50 dark:bg-gray-700">
             <tr>
               <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">Time / Day</th>
               {days.map(day => (
                 <th key={day} className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">{day}</th>
               ))}
             </tr>
           </thead>
           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
             {periods.map((period, idx) => {
                const isBreak = period.includes('11:00 - 11:15') || period.includes('12:15 - 01:15'); // Basic logic for breaks
                
                return (
                    <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 border-r dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            {period}
                        </div>
                        </td>
                        {days.map(day => {
                            const session = timetable[day]?.[period];
                            
                            if (isBreak) {
                                return <td key={day} className="bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">{period.includes('12') ? 'Lunch Break' : 'Short Break'}</td>;
                            }

                            return (
                                <td key={day} className="px-2 py-2 text-center border-l dark:border-gray-700 align-top h-24">
                                    {session ? (
                                        <div className="relative group bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30 h-full flex flex-col justify-center">
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleDelete(session._id)}
                                                    className="absolute top-1 right-1 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <p className="font-bold text-blue-700 dark:text-blue-300 text-sm line-clamp-2">{session.subject}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{session.teacher}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase">{session.classOrBatch}</p>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <span className="text-gray-200 dark:text-gray-700 text-xl font-light">+</span>
                                        </div>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                );
             })}
           </tbody>
        </table>
      </Card>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Class Schedule</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Day" {...register("day", { required: true })}>
                          {days.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </Select>
                        <Select label="Period" {...register("period", { required: true })}>
                          {periods
                            .filter((p) => !p.includes("Break") && !p.includes("Lunch"))
                            .map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                        </Select>
                    </div>
                    <Input
                      label="Subject"
                      placeholder="e.g. CS101 - Intro to CS"
                      {...register("subject", { required: true })}
                    />
                    <Input
                      label="Teacher"
                      placeholder="e.g. Dr. Alan Grant"
                      {...register("teacher", { required: true })}
                    />
                    <Input label="Batch / Class" value={classOrBatch} disabled />
                    
                    <Button className="w-full" type="submit">
                      Add to schedule
                    </Button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
