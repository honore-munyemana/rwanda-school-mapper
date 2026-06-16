import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Shield,
  Lock,
  Camera,
  Trash2,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Profile() {
  const { user, token, refreshUser } = useAuth();
  const location = useLocation();

  // Read initial tab from router state if present, otherwise default to "overview"
  const initialTab = location.state?.activeTab || 'overview';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Synchronize state with router state updates
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Edit Name State
  const [name, setName] = useState<string>(user?.name || '');
  const [updatingName, setUpdatingName] = useState<boolean>(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [updatingPassword, setUpdatingPassword] = useState<boolean>(false);

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [removingPhoto, setRemovingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep Name local state in sync when context user loads
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Translate role key to human-readable presentation label
  const getRoleLabel = (role?: string) => {
    if (!role) return 'N/A';
    const map: Record<string, string> = {
      admin: 'Administrator',
      validator: 'Validator',
      mapper: 'Mapper'
    };
    return map[role.toLowerCase()] || role;
  };

  // 1. Handle name update
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim() === '') {
      toast.error('Name field cannot be empty.');
      return;
    }

    if (name.trim() === user?.name) {
      toast.info('No changes made to the profile name.');
      return;
    }

    setUpdatingName(true);
    try {
      const res = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update name.');
      }

      toast.success(data.message || 'Profile name updated successfully.');
      await refreshUser(); // Update navigation avatar and details immediately
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while updating profile name.');
    } finally {
      setUpdatingName(false);
    }
  };

  // 2. Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from your current password.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('http://localhost:5000/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password.');
      }

      toast.success(data.message || 'Password changed successfully.');
      // Clear password form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while changing password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 3. Handle file upload selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds the 2 MB limit.');
      return;
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingPhoto(true);
    try {
      const res = await fetch('http://localhost:5000/profile/photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      toast.success(data.message || 'Profile photo uploaded successfully.');
      await refreshUser(); // Update navigation avatar and details immediately
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input element
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while uploading profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 4. Handle remove photo
  const handleRemovePhoto = async () => {
    if (!user?.profile_photo) return;

    if (!confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    setRemovingPhoto(true);
    try {
      const res = await fetch('http://localhost:5000/profile/photo', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove photo.');
      }

      toast.success(data.message || 'Profile photo removed successfully.');
      await refreshUser(); // Update navigation avatar and details immediately
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred while removing profile photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        {/* Title Area */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-white">
            Personnel Profile
          </h1>
          <p className="text-sm text-[#8A9BAD] font-mono uppercase tracking-wider">
            Manage your credential identity and security configurations
          </p>
        </div>

        {/* Outer Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left profile card summary */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <Card className="bg-[#141C25]/85 border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C4622D]" />
              <CardContent className="pt-8 flex flex-col items-center text-center">
                {/* Profile Photo Display */}
                <div className="relative group mb-4">
                  <Avatar className="h-28 w-28 rounded-2xl border border-white/10 ring-4 ring-[#C4622D]/20 shadow-xl transition-all duration-300">
                    <AvatarImage
                      src={user?.profile_photo ? `http://localhost:5000/${user.profile_photo}` : undefined}
                      alt={user?.name || 'User Profile'}
                    />
                    <AvatarFallback className="bg-[#0A0F14] text-[#C4622D] font-bold text-3xl rounded-2xl border border-white/5">
                      {(user?.name || 'AD').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Photo Overlay Upload Action */}
                  <button
                    onClick={triggerFileSelect}
                    disabled={uploadingPhoto}
                    type="button"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
                    title="Upload profile photo"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[#C4622D]" />
                    ) : (
                      <Camera className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </div>

                <h2 className="text-lg font-bold text-white tracking-wide">
                  {user?.name}
                </h2>
                <p className="text-[10px] font-mono text-[#D4A847] uppercase tracking-widest mt-1 px-3 py-1 bg-[#D4A847]/10 border border-[#D4A847]/20 rounded-full">
                  {getRoleLabel(user?.role)}
                </p>
                
                <div className="w-full border-t border-white/5 my-6" />

                <div className="w-full space-y-4 text-left font-mono text-xs text-[#8A9BAD]">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#C4622D]" />
                    <span className="truncate text-white" title={user?.email}>
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-[#C4622D]" />
                    <span>Role ID: <strong className="text-white uppercase">{user?.role}</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Tabs contents */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#0A0F14] border border-white/5 rounded-xl p-1 h-12">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg text-xs font-mono uppercase tracking-widest text-[#8A9BAD] data-[state=active]:bg-[#C4622D] data-[state=active]:text-white transition-all"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="edit"
                  className="rounded-lg text-xs font-mono uppercase tracking-widest text-[#8A9BAD] data-[state=active]:bg-[#C4622D] data-[state=active]:text-white transition-all"
                >
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-lg text-xs font-mono uppercase tracking-widest text-[#8A9BAD] data-[state=active]:bg-[#C4622D] data-[state=active]:text-white transition-all"
                >
                  Security
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="mt-6">
                <Card className="bg-[#141C25]/85 border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3D7A5C]" />
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-[#3D7A5C]" />
                      <CardTitle>Overview Identity</CardTitle>
                    </div>
                    <CardDescription>View your active profile metadata records.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                      
                      <div className="space-y-2 p-4 rounded-xl bg-black/10 border border-white/5">
                        <span className="text-[#8A9BAD] uppercase text-[10px] tracking-wider font-bold">Full Name</span>
                        <p className="text-sm text-white font-sans font-semibold mt-1">{user?.name}</p>
                      </div>

                      <div className="space-y-2 p-4 rounded-xl bg-black/10 border border-white/5">
                        <span className="text-[#8A9BAD] uppercase text-[10px] tracking-wider font-bold">Primary Email</span>
                        <p className="text-sm text-white font-sans font-semibold mt-1">{user?.email}</p>
                      </div>

                      <div className="space-y-2 p-4 rounded-xl bg-black/10 border border-white/5">
                        <span className="text-[#8A9BAD] uppercase text-[10px] tracking-wider font-bold">Authorized Role</span>
                        <p className="text-sm text-white font-sans font-semibold mt-1">{getRoleLabel(user?.role)}</p>
                      </div>

                      <div className="space-y-2 p-4 rounded-xl bg-black/10 border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[#8A9BAD] uppercase text-[10px] tracking-wider font-bold">Status Badge</span>
                          <div className="flex items-center gap-1.5 text-xs text-[#3D7A5C] font-semibold mt-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Active / Verified</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* EDIT PROFILE TAB */}
              <TabsContent value="edit" className="mt-6">
                <Card className="bg-[#141C25]/85 border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C4622D]" />
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-[#C4622D]" />
                      <CardTitle>Modify Profile Details</CardTitle>
                    </div>
                    <CardDescription>Update your display name and photo parameters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Display Photo Upload/Remove Section */}
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">Profile Image</Label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-black/10 border border-white/5">
                        <Avatar className="h-16 w-16 rounded-xl border border-white/10 ring-2 ring-[#C4622D]/10">
                          <AvatarImage
                            src={user?.profile_photo ? `http://localhost:5000/${user.profile_photo}` : undefined}
                            alt={user?.name}
                          />
                          <AvatarFallback className="bg-[#0A0F14] text-[#C4622D] font-bold rounded-xl border border-white/5">
                            {(user?.name || 'AD').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={triggerFileSelect}
                            disabled={uploadingPhoto}
                            className="border-white/10 hover:bg-white/5 text-xs text-white hover:text-white rounded-xl"
                          >
                            {uploadingPhoto ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            ) : (
                              <Camera className="h-3.5 w-3.5 mr-2" />
                            )}
                            Change Photo
                          </Button>

                          {user?.profile_photo && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={handleRemovePhoto}
                              disabled={removingPhoto}
                              className="bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-200 text-xs rounded-xl"
                            >
                              {removingPhoto ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                              )}
                              Remove Photo
                            </Button>
                          )}
                        </div>

                        <div className="hidden sm:block text-[10px] text-[#8A9BAD] font-mono leading-normal max-w-xs ml-auto">
                          Accepts JPG, PNG or WebP. Max file size is 2 MB.
                        </div>
                      </div>
                    </div>

                    {/* Name Change Form */}
                    <form onSubmit={handleUpdateName} className="space-y-4 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">Display Name</Label>
                        <Input
                          id="profile-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-black/25 border-white/5 focus-visible:ring-1 focus-visible:ring-[#C4622D]/50 rounded-xl font-mono text-xs text-[#EEE8DC]"
                          placeholder="Your display name"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={updatingName}
                          className="bg-[#C4622D] hover:bg-[#C4622D]/90 text-white rounded-xl text-xs font-mono uppercase tracking-widest"
                        >
                          {updatingName && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* SECURITY TAB */}
              <TabsContent value="security" className="mt-6">
                <Card className="bg-[#141C25]/85 border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4A847]" />
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-[#D4A847]" />
                      <CardTitle>Change Password</CardTitle>
                    </div>
                    <CardDescription>Update your authorization entry credentials.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      
                      <div className="space-y-2">
                        <Label htmlFor="current-pass" className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">Current Password</Label>
                        <Input
                          id="current-pass"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-black/25 border-white/5 focus-visible:ring-1 focus-visible:ring-[#D4A847]/50 rounded-xl font-mono text-xs text-[#EEE8DC]"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-pass" className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">New Password</Label>
                        <Input
                          id="new-pass"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-black/25 border-white/5 focus-visible:ring-1 focus-visible:ring-[#D4A847]/50 rounded-xl font-mono text-xs text-[#EEE8DC]"
                          placeholder="••••••••"
                        />
                        {newPassword && newPassword.length >= 6 && newPassword.length < 8 && (
                          <p className="text-[10px] text-[#D4A847] flex items-center gap-1.5 font-mono">
                            <AlertCircle className="h-3 w-3" />
                            <span>Recommended: at least 8 characters for stronger security.</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-pass" className="text-xs uppercase tracking-widest text-[#8A9BAD] font-bold">Confirm New Password</Label>
                        <Input
                          id="confirm-new-pass"
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="bg-black/25 border-white/5 focus-visible:ring-1 focus-visible:ring-[#D4A847]/50 rounded-xl font-mono text-xs text-[#EEE8DC]"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          disabled={updatingPassword}
                          className="bg-[#D4A847] hover:bg-[#D4A847]/90 text-black font-bold rounded-xl text-xs font-mono uppercase tracking-widest"
                        >
                          {updatingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2 text-black" />}
                          Update Password
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
