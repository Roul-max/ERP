import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, BookOpen, Calendar, ArrowUpRight, GraduationCap, Clock, MoreHorizontal, IndianRupee, Activity, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { formatCurrency } from '../utils/format';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import MetricCard from '../components/ui/MetricCard';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-500 shadow-blue-500/20 text-blue-50',
        emerald: 'bg-emerald-500 shadow-emerald-500/20 text-emerald-50',
        violet: 'bg-violet-500 shadow-violet-500/20 text-violet-50',
        amber: 'bg-amber-500 shadow-amber-500/20 text-amber-50',
        rose: 'bg-rose-500 shadow-rose-500/20 text-rose-50',
    };

    const textColors: any = {
        blue: 'text-blue-600 dark:text-blue-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        violet: 'text-violet-600 dark:text-violet-400',
        amber: 'text-amber-600 dark:text-amber-400',
        rose: 'text-rose-600 dark:text-rose-400',
    };

    return (
        <Card className="p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">{value}</h3>
                    </div>
                    <div className={`p-3.5 rounded-2xl ${colorClasses[color]} transform group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon size={22} className="text-white" />
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-semibold">
                        <span className={`flex items-center gap-0.5 ${textColors[color]} bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-md`}>
                            <ArrowUpRight size={14} /> {trend}
                        </span>
                        <span className="text-slate-400 ml-1">vs last month</span>
                    </div>
                )}
            </div>
            {/* Decorative background element */}
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-5 ${colorClasses[color].split(' ')[0]}`}></div>
        </Card>
    );
};

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  
  const today = new Date();
  const hours = today.getHours();
  let greeting = 'Good Morning';
  if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
  else if (hours >= 17) greeting = 'Good Evening';

  useEffect(() => {
    if (user?.role === 'faculty') {
        client.get('/courses/my').then(res => setFacultyCourses(res.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    let active = true;
    setOverviewLoading(true);
    client
      .get('/analytics/overview?rangeDays=30', { ui: { silent: true } } as any)
      .then((res) => {
        if (!active) return;
        setOverview(res.data);
      })
      .catch(() => {
        if (!active) return;
        setOverview(null);
      })
      .finally(() => {
        if (!active) return;
        setOverviewLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.role]);

  const adminKpis = useMemo(() => {
    const paid = overview?.fees?.byStatus?.Paid?.amount ?? 0;
    const pending = overview?.fees?.byStatus?.Pending?.amount ?? 0;
    return [
      {
        label: 'Students',
        value: overview ? overview.totals.students.toLocaleString() : '',
        icon: Users,
        accent: 'from-blue-600 to-indigo-700',
      },
      {
        label: 'Courses',
        value: overview ? overview.totals.courses.toLocaleString() : '',
        icon: BookOpen,
        accent: 'from-emerald-600 to-teal-700',
      },
      {
        label: 'Paid (30d)',
        value: overview ? formatCurrency(paid) : '',
        icon: IndianRupee,
        accent: 'from-amber-600 to-orange-700',
      },
      {
        label: 'Pending fees',
        value: overview ? formatCurrency(pending) : '',
        icon: Activity,
        accent: 'from-rose-600 to-red-700',
      },
      {
        label: 'Unread alerts',
        value: overview ? overview.totals.unreadNotifications.toLocaleString() : '',
        icon: Bell,
        accent: 'from-violet-600 to-fuchsia-700',
      },
    ];
  }, [overview]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`${greeting}, ${user?.name.split(' ')[0] || 'there'} 👋`}
          description="Here’s what’s happening in your campus today."
        />
        <Card className="px-5 py-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {today.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Grid - Role Based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {user?.role === 'admin' && (
          <>
            {adminKpis.map((k) => (
              <MetricCard
                key={k.label}
                label={k.label}
                value={k.value}
                icon={k.icon as any}
                accent={k.accent}
                loading={overviewLoading && !overview}
              />
            ))}
          </>
        )}
        {user?.role === 'faculty' && (
             <>
                <StatCard title="My Courses" value={facultyCourses.length} icon={BookOpen} color="blue" />
                <StatCard title="Total Students" value="142" icon={Users} color="emerald" />
                <StatCard title="Upcoming Exams" value="3" icon={Calendar} color="violet" />
                <StatCard title="Hours Logged" value="128" icon={Clock} color="amber" />
            </>
        )}
        {user?.role === 'student' && (
             <>
                <StatCard title="Attendance" value="85%" icon={Clock} color="blue" trend="+2%" />
                <StatCard title="CGPA" value="3.8" icon={GraduationCap} color="emerald" />
                <StatCard title="Assignments" value="4" icon={BookOpen} color="violet" />
                <StatCard title="Fees Due" value={formatCurrency(0)} icon={IndianRupee} color="amber" />
            </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Faculty Specific: My Courses Summary */}
            {user?.role === 'faculty' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="text-blue-500" size={24} /> My Active Courses
                        </h2>
                        <button onClick={() => navigate('/faculty/courses')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">View All</button>
                    </div>
                    {facultyCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {facultyCourses.slice(0, 4).map((course: any) => (
                                <div key={course._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700">
                                            {course.code}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">{course.credits} Credits</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{course.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.department}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">No courses assigned yet.</div>
                    )}
                </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest updates from across the platform.</p>
                </div>
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
            
            <div className="space-y-8">
                {[
                    { title: 'New Student Registration', desc: 'Sarah Johnson enrolled in Computer Science', time: '2 hours ago', icon: Users, color: 'bg-blue-100 text-blue-600', border: 'border-l-4 border-blue-500' },
                    { title: 'Fee Payment Received', desc: 'Tuition fees processed for Batch 2026', time: '4 hours ago', icon: IndianRupee, color: 'bg-emerald-100 text-emerald-600', border: 'border-l-4 border-emerald-500' },
                    { title: 'New Course Added', desc: 'Advanced AI Ethics added to curriculum', time: 'Yesterday', icon: BookOpen, color: 'bg-purple-100 text-purple-600', border: 'border-l-4 border-purple-500' }
                ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 group">
                    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color} dark:bg-opacity-20 shadow-sm`}>
                    <item.icon size={20} />
                    </div>
                    <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{item.title}</p>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md flex items-center gap-1">
                            <Clock size={12}/> {item.time}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none border border-gray-100 dark:border-gray-700 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => navigate('/students')}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-700/50 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-600 text-left"
                    >
                    <div className="p-2.5 bg-blue-50 dark:bg-gray-600 text-blue-600 dark:text-gray-300 group-hover:bg-white/20 group-hover:text-white rounded-lg transition-colors">
                        <Users size={20} />
                    </div>
                    <div>
                        <span className="block font-bold text-gray-800 dark:text-white group-hover:text-white text-sm">Add Student</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-100">Enroll new admission</span>
                    </div>
                    </button>
                )}
                
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button 
                        onClick={() => navigate('/faculty/exams')}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-700/50 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-emerald-600 dark:hover:border-emerald-600 text-left"
                    >
                        <div className="p-2.5 bg-emerald-50 dark:bg-gray-600 text-emerald-600 dark:text-gray-300 group-hover:bg-white/20 group-hover:text-white rounded-lg transition-colors">
                            <GraduationCap size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-gray-800 dark:text-white group-hover:text-white text-sm">Schedule Exam</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-emerald-100">Create new assessment</span>
                        </div>
                    </button>
                )}
                
                <button 
                    onClick={() => navigate('/attendance/mark')}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-700/50 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-violet-600 dark:hover:border-violet-600 text-left"
                >
                <div className="p-2.5 bg-violet-50 dark:bg-gray-600 text-violet-600 dark:text-gray-300 group-hover:bg-white/20 group-hover:text-white rounded-lg transition-colors">
                    <Calendar size={20} />
                </div>
                <div>
                    <span className="block font-bold text-gray-800 dark:text-white group-hover:text-white text-sm">Attendance</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-violet-100">Mark daily records</span>
                </div>
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
