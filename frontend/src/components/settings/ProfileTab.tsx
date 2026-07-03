"use client";

import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useSettings";
import { Loader2, Upload, User as UserIcon } from "lucide-react";

export default function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const [formData, setFormData] = useState({ name: "", email: "", profile_image: "" });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        profile_image: profile.profile_image || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    try {
      await updateProfile.mutateAsync(formData);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to update profile: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl"></div>;
  }

  return (
    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Public Profile</h2>
        <p className="text-sm text-slate-500 mt-1">This information will be displayed on your reports.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {formData.profile_image ? (
              <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={formData.profile_image}
                onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                placeholder="https://example.com/avatar.png"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Provide a valid image URL for your avatar.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm font-medium text-emerald-600">
            {isSuccess && "Profile saved successfully."}
          </div>
          <button 
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
