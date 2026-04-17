import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  Moon,
  Sun,
  Library,
  DollarSign,
  ClipboardList,
  FileText,
  Briefcase,
  BarChart,
  LineChart,
  MessageSquare,
  Calendar
} from 'lucide-react';

// Custom Application Logo
const AppLogo = () => (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transform transition-transform duration-300 hover:rotate-3 group-hover:scale-105">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const MainLayout: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  const { user, logout } = useContext(AuthContext)!;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
    return (
        <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 group relative overflow-hidden ${
            isActive 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-medium' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
        >
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30"></div>}
        <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'} shrink-0`} />
        <span className="text-sm">{label}</span>
        </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0 group">
          <Link to="/" className="flex items-center gap-3">
            <AppLogo />
            <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">ACE ERP</h1>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Enterprise Platform</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          
          <div className="px-6 py-2 mt-4 mb-1">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {user?.role === 'admin' ? 'Administration' : user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
            </p>
          </div>

          {/* Admin Menu */}
          {user?.role === 'admin' && (
            <>
              <NavItem to="/students" icon={Users} label="Students" />
              <NavItem to="/academics" icon={BookOpen} label="Academics" />
              <NavItem to="/scheduler" icon={Calendar} label="Scheduler" />
              <NavItem to="/exams" icon={ClipboardList} label="Exams & Results" />
              <NavItem to="/library" icon={Library} label="Library" />
              <NavItem to="/documents" icon={FileText} label="Documents" />
              <NavItem to="/communication" icon={MessageSquare} label="Communication" />
              <NavItem to="/hr" icon={Briefcase} label="HR & Payroll" />
              <NavItem to="/finance" icon={DollarSign} label="Finance" />
              <NavItem to="/reports" icon={BarChart} label="Reports" />
              <NavItem to="/analytics" icon={LineChart} label="Analytics" />
              <NavItem to="/hostel" icon={Briefcase} label="Hostel" />
              <NavItem to="/settings" icon={Settings} label="Settings" />
            </>
          )}

          {/* Faculty Menu */}
          {user?.role === 'faculty' && (
            <>
              <NavItem to="/faculty/courses" icon={BookOpen} label="My Courses" />
              <NavItem to="/scheduler" icon={Calendar} label="Class Schedule" />
              <NavItem to="/faculty/exams" icon={ClipboardList} label="Exams & Grading" />
              <NavItem to="/attendance/mark" icon={CalendarCheck} label="Mark Attendance" />
              <NavItem to="/communication" icon={MessageSquare} label="Messages" />
              <NavItem to="/settings" icon={Settings} label="Settings" />
            </>
          )}

          {/* Student Menu */}
          {user?.role === 'student' && (
             <>
               <NavItem to="/my-attendance" icon={CalendarCheck} label="My Attendance" />
               <NavItem to="/my-fees" icon={DollarSign} label="Fees & Payments" />
               <NavItem to="/my-results" icon={ClipboardList} label="Results" />
               <NavItem to="/scheduler" icon={Calendar} label="Time Table" />
               <NavItem to="/communication" icon={MessageSquare} label="Announcements" />
               <NavItem to="/settings" icon={Settings} label="Settings" />
            </>
          )}

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <Link to="/profile" className="flex items-center gap-3 mb-3 px-2 py-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform text-sm ring-2 ring-white dark:ring-slate-800">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shrink-0">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="hidden sm:block">
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">
                        {location.pathname === '/' ? 'Overview' : location.pathname.split('/')[1]?.replace('-', ' ')}
                    </h2>
                </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
                 <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  aria-label="Toggle Theme"
                 >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                 </button>
                 <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                 <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-[#0f172a]">
          <div className="max-w-7xl mx-auto animate-fade-in-up pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
