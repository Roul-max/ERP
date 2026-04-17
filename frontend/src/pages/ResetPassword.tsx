import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { Lock, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ResetPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { login } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await client.put(`/auth/reset-password/${token}`, { password: data.password });
      setSuccess(true);
      // Optional: Auto login after 2 seconds
      setTimeout(() => {
        login(res.data.token, res.data);
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Card className="p-8 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4 transform rotate-3">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Set New Password</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Your new password must be different from previous used passwords.
            </p>
          </div>

          {success ? (
             <div className="text-center py-6 animate-scale-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Reset!</h3>
                <p className="text-slate-500 dark:text-slate-400">Redirecting to dashboard...</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 dark:border-red-800 animate-scale-in">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-5">
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      error={errors.password?.message as string | undefined}
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      error={errors.confirmPassword?.message as string | undefined}
                      {...register('confirmPassword', { 
                        required: 'Please confirm password',
                        validate: value => value === password || "Passwords do not match"
                      })}
                    />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  rightIcon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                >
                  {isLoading ? 'Resetting…' : 'Reset password'}
                </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
