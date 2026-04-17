import React, { useContext, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { User, Edit2, Save, X, Mail, Shield, Camera, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import { toastError, toastSuccess } from "../utils/toast";

const UserProfile: React.FC = () => {
  const { user, login } = useContext(AuthContext)!;
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      const res = await client.put('/auth/profile', data);
      login(res.data.token, res.data);
      setIsEditing(false);
      toastSuccess("Profile updated");
    } catch (error) {
      console.error(error);
      toastError("Failed to update profile");
    }
  };

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const uploadAvatar = async (file: File) => {
    const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowed.has(file.type)) {
      toastError("Please upload a PNG, JPG, or WEBP image");
      return;
    }
    const maxBytes = 500 * 1024;
    if (file.size > maxBytes) {
      toastError("Image too large (max 500KB)");
      return;
    }
    try {
      const base64 = await readAsDataUrl(file);
      const res = await client.put("/auth/avatar", { base64 });
      const token = localStorage.getItem("token") || "";
      login(token, { ...(user as any), avatar: res.data.avatar });
      toastSuccess("Profile photo updated");
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to update photo");
    }
  };

  const removeAvatar = async () => {
    try {
      await client.delete("/auth/avatar");
      const token = localStorage.getItem("token") || "";
      login(token, { ...(user as any), avatar: undefined });
      toastSuccess("Profile photo removed");
    } catch (e: any) {
      toastError(e?.response?.data?.message || "Failed to remove photo");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="User profile"
        description="Update your details and manage your account."
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)} leftIcon={<Edit2 size={16} />}>
              Edit profile
            </Button>
          ) : null
        }
      />
      
      <Card className="overflow-hidden">
        {/* Header / Avatar */}
        <div className="p-8 flex flex-col items-center border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="relative">
            <div className="w-24 h-24 rounded-full shadow-lg mb-4 overflow-hidden ring-2 ring-white dark:ring-slate-900 bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user?.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="absolute bottom-4 right-0 p-1.5 bg-green-500 rounded-full border-4 border-white dark:border-slate-900" title="Active"></div>
          </div>
          <div className="flex items-center gap-2 -mt-2 mb-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Camera size={16} />}
              onClick={() => fileRef.current?.click()}
            >
              Upload photo
            </Button>
            {user?.avatar ? (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 size={16} />}
                onClick={removeAvatar}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            ) : null}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5 mt-1">
            <Shield size={14} /> {user?.role}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full name"
                  leftIcon={<User size={18} />}
                  {...register('name', { required: true })}
                />
                <Input
                  label="Email address"
                  leftIcon={<Mail size={18} />}
                  type="email"
                  {...register('email', { required: true })}
                />
                <div className="md:col-span-2">
                  <Input
                    label="New password (optional)"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    {...register('password')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  leftIcon={<X size={18} />}
                >
                  Cancel
                </Button>
                <Button type="submit" leftIcon={<Save size={18} />}>
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Name</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
                   <User size={18} className="text-slate-400" />
                   {user?.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
                   <Mail size={18} className="text-slate-400" />
                   {user?.email}
                </div>
              </div>
               <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Account Status</label>
                <div className="p-3 bg-green-50/80 dark:bg-green-950/20 rounded-xl text-green-800 dark:text-green-200 border border-green-200/60 dark:border-green-900/30 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   Active
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 capitalize">
                   {user?.role}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
