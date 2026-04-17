import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import client, { API_ORIGIN } from '../api/client';
import { Lock, Mail, AlertCircle, ArrowRight, Moon, Sun, CheckCircle, ArrowLeft, Loader2, GraduationCap } from 'lucide-react';

// Google Logo Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext)!;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for OAuth Token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const oauthError = params.get('error');

    if (token) {
        // Fetch user data with token then log in
        client.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                login(token, res.data);
                navigate('/');
            })
            .catch(() => setError('Failed to verify Google login.'));
    } else if (oauthError) {
        setError('Google Authentication Failed');
    }
  }, [location, login, navigate]);

  const onLoginSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await client.post('/auth/login', data);
      login(res.data.token, res.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await client.post('/auth/forgot-password', data);
      setSuccess('If an account exists, a reset link has been sent to your email.');
    } catch (err: any) {
      // Security: Always show success message to prevent email enumeration
      setSuccess('If an account exists, a reset link has been sent to your email.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_ORIGIN}/api/v1/auth/google` || '/api/v1/auth/google';
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0f172a] transition-colors duration-300 font-sans">
      
      {/* Theme Toggle Button */}
      <button 
        type="button"
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-white/10 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:bg-slate-100/20 dark:hover:bg-slate-700/50 transition-all border border-slate-200/20 dark:border-slate-700/50"
        aria-label="Toggle Dark Mode"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* LEFT SIDE: Hero / Visuals - 60% Width */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}
        ></div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-slate-900/80 to-slate-900/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 xl:p-20 text-white">
          
          {/* Logo Area - Enhanced */}
          <div className="flex items-center gap-5 animate-fade-in-up">
             <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl shadow-black/20 ring-1 ring-white/10">
                <GraduationCap className="text-white drop-shadow-md" size={38} strokeWidth={1.5} />
             </div>
             <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">ACE ERP</h1>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="h-0.5 w-8 bg-blue-400 rounded-full"></span>
                    <p className="text-xs text-blue-100 font-bold tracking-[0.2em] uppercase text-shadow-sm">University Portal</p>
                </div>
             </div>
          </div>

          {/* Main Hero Text */}
          <div className="space-y-8 max-w-xl animate-fade-in-up animation-delay-100">
             <h2 className="text-5xl xl:text-6xl font-bold leading-tight">
                Building the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">Leaders of Tomorrow</span>
             </h2>
             <p className="text-lg xl:text-xl text-slate-200 leading-relaxed max-w-lg font-light border-l-4 border-blue-500/50 pl-6">
                Experience a seamless academic journey with our unified platform. Manage courses, track attendance, and access resources in real-time.
             </p>
          </div>

          {/* Footer / Copyright */}
          <div className="flex items-center gap-8 text-sm text-slate-300 font-medium animate-fade-in-up animation-delay-200">
             <span>© 2026 ACE University</span>
             <div className="h-1 w-1 rounded-full bg-slate-500"></div>
             <a href="#" className="hover:text-white transition-colors hover:underline underline-offset-4">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors hover:underline underline-offset-4">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form - 40% Width */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 xl:p-16 bg-white dark:bg-[#0f172a] overflow-y-auto relative shadow-2xl lg:shadow-none">
        <div className="w-full max-w-sm space-y-6 animate-fade-in-up">
            
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="lg:hidden flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <GraduationCap size={36} />
                </div>
            </div>

            {view === 'login' ? (
                <>
                    <div className="text-center lg:text-left space-y-2 mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please enter your credentials to access your account.</p>
                    </div>

                    <button 
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm group"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
                        <span className="group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Sign in with Google</span>
                    </button>

                    <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or sign in with email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-3.5 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-800 animate-scale-in">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        {...register('email', { required: 'Email is required' })}
                                        type="email"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setView('forgot')}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        {...register('password', { required: 'Password is required' })}
                                        type="password"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center px-1">
                            <input id="remember-me" type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 cursor-pointer" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer">Remember me for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>Sign In <ArrowRight size={18} strokeWidth={2.5} /></>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials Section */}
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Demo Credentials</h4>
                         <div className="flex items-center justify-center gap-2 text-sm">
                             <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-400 mb-1">Email</span>
                                <code className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono select-all">admin@university.com</code>
                             </div>
                             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                             <div className="flex flex-col items-center">
                                <span className="text-xs text-slate-400 mb-1">Password</span>
                                <code className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 font-mono select-all">admin123</code>
                             </div>
                         </div>
                    </div>
                </>
            ) : (
                <>
                    <button 
                        onClick={() => setView('login')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors group self-start"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                    </button>

                    <div className="mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot Password?</h2>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Enter your email and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onForgotSubmit)} className="space-y-6">
                         {success ? (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl text-sm flex items-start gap-3 border border-green-200 dark:border-green-800 animate-scale-in">
                                <CheckCircle size={20} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Check your email</p>
                                    <p className="mt-1 opacity-90">{success}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        {...register('email', { required: true })}
                                        type="email"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
                                        placeholder="name@university.com"
                                    />
                                </div>
                            </div>
                        )}

                        {!success && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>
                        )}
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Login;
