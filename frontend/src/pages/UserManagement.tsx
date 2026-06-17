import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Trash2, Shield, User, Loader2, Key, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const roleStyles: Record<string, string> = {
  admin: 'bg-red-500/10 text-red-400 border-red-500/20',
  validator: 'bg-[#3D7A5C]/20 text-[#3D7A5C] border-[#3D7A5C]/30',
  mapper: 'bg-[#D4A847]/10 text-[#D4A847] border-[#D4A847]/20',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  validator: 'Validator',
  mapper: 'Mapper',
};

export default function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const location = useLocation();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => {
    return location.state && typeof location.state === 'object' && 'searchTerm' in location.state
      ? (location.state as any).searchTerm
      : '';
  });
  const [roleFilter, setRoleFilter] = useState('all');

  // Add User Form State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('mapper');
  const [isAdding, setIsAdding] = useState(false);

  // Edit User Form State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('mapper');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete User State
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to retrieve users.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to the server.');
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsAdding(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          role: addRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User invited successfully.');
        setAddName('');
        setAddEmail('');
        setAddRole('mapper');
        setIsAddOpen(false);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to create user.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (user: UserRecord) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
    setEditRole(user.role);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingUser) return;

    if (editPassword && editPassword.trim() !== '' && editPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          password: editPassword || undefined,
          role: editRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User updated successfully.');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!token || !deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User deleted successfully.');
        setDeletingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-l-4 border-[#C4622D] pl-6 py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#D4A847]" />
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A847]/60">
                Governance Command Center
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white uppercase italic">
              User <span className="text-[#D4A847]">Authority</span>
            </h1>
            <p className="font-mono text-xs text-[#D4A847]/90 uppercase tracking-widest">
              Manage operators, map editors, and verifiers
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-11 bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-[10px] uppercase tracking-widest gap-2 rounded-none self-start xl:self-auto"
          >
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Search & Filters */}
        <Card className="bg-[#141C25]/60 backdrop-blur-xl border-white/5 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#8A9BAD]/60" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/20 border-white/10 border-b-2 border-b-transparent focus:border-b-[#C4622D] rounded-none h-11 text-[#EEE8DC] focus-visible:ring-0 pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                  <SelectTrigger className="bg-black/20 border-white/10 h-11 text-[#EEE8DC] rounded-none">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F1923] border-white/10 text-[#EEE8DC]">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="validator">Validator</SelectItem>
                    <SelectItem value="mapper">Mapper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card className="bg-[#141C25]/85 border-white/5 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="font-display text-lg font-bold text-white uppercase italic">
              User Directories
            </CardTitle>
            <CardDescription className="font-mono text-[10px] text-[#D4A847]/90 uppercase tracking-widest">
              Live database records of registered system authorities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-[#D4A847] font-mono text-xs uppercase tracking-widest gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Querying database...
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center text-[#8A9BAD]/60 font-mono text-xs uppercase tracking-widest">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90 pl-6">Full Name</TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Email</TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Role</TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90">Date Created</TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest text-[#D4A847]/90 pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-medium text-[#EEE8DC] pl-6">{u.name}</TableCell>
                        <TableCell className="font-mono text-xs text-[#D4A847]/90">{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider ${roleStyles[u.role] || 'bg-white/5'}`}
                          >
                            {roleLabels[u.role] || u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#8A9BAD]/60">{formatDate(u.created_at)}</TableCell>
                        <TableCell className="pr-6 text-right space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(u)}
                            className="h-8 w-8 text-[#D4A847] hover:text-white hover:bg-white/5 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={currentUser?.id === u.id}
                            onClick={() => setDeletingUser(u)}
                            className={`h-8 w-8 rounded-lg ${
                              currentUser?.id === u.id
                                ? 'text-[#8A9BAD]/20 cursor-not-allowed'
                                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !isAdding && setIsAddOpen(open)}>
        <DialogContent className="bg-[#0F1923] border border-white/10 text-[#EEE8DC] shadow-2xl p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-white uppercase italic">
              Create New <span className="text-[#D4A847]">User</span>
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] text-[#D4A847]/60 uppercase tracking-wider">
              Define credential nodes and permission scopes
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">Full Name</Label>
              <div className="relative">
                <Input
                  required
                  disabled={isAdding}
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Jean Pierre"
                  className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] pl-10 rounded-none focus-visible:ring-0"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-[#8A9BAD]/40" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">Email Address</Label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  disabled={isAdding}
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="name@ssevms.com"
                  className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] pl-10 rounded-none focus-visible:ring-0"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8A9BAD]/40" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">User Role</Label>
              <Select value={addRole} onValueChange={(val) => setAddRole(val)} disabled={isAdding}>
                <SelectTrigger className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] rounded-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1923] border-white/10 text-[#EEE8DC]">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="validator">Validator</SelectItem>
                  <SelectItem value="mapper">Mapper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isAdding}
                onClick={() => setIsAddOpen(false)}
                className="border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-[10px] uppercase tracking-widest rounded-none h-10 gap-2 min-w-[100px]"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !isUpdating && !open && setEditingUser(null)}>
        <DialogContent className="bg-[#0F1923] border border-white/10 text-[#EEE8DC] shadow-2xl p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-white uppercase italic">
              Edit <span className="text-[#D4A847]">User</span>
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] text-[#D4A847]/60 uppercase tracking-wider">
              Modify configuration variables of user node
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">Full Name</Label>
              <div className="relative">
                <Input
                  required
                  disabled={isUpdating}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] pl-10 rounded-none focus-visible:ring-0"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-[#8A9BAD]/40" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">Email Address</Label>
              <div className="relative">
                <Input
                  required
                  type="email"
                  disabled={isUpdating}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] pl-10 rounded-none focus-visible:ring-0"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-[#8A9BAD]/40" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">
                New Password (leave blank to keep current)
              </Label>
              <div className="relative">
                <Input
                  type="password"
                  disabled={isUpdating}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] pl-10 rounded-none focus-visible:ring-0"
                />
                <Key className="absolute left-3 top-3 h-4 w-4 text-[#8A9BAD]/40" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono text-[9px] uppercase tracking-wider text-[#8A9BAD]">User Role</Label>
              <Select value={editRole} onValueChange={(val) => setEditRole(val)} disabled={isUpdating}>
                <SelectTrigger className="bg-black/40 border-white/10 h-10 text-[#EEE8DC] rounded-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F1923] border-white/10 text-[#EEE8DC]">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="validator">Validator</SelectItem>
                  <SelectItem value="mapper">Mapper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                onClick={() => setEditingUser(null)}
                className="border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest rounded-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-[#C4622D] hover:bg-[#A85225] text-white font-mono text-[10px] uppercase tracking-widest rounded-none h-10 gap-2 min-w-[100px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !isDeleting && !open && setDeletingUser(null)}>
        <DialogContent className="bg-[#0F1923] border border-red-500/30 text-[#EEE8DC] shadow-2xl p-6 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-red-500 uppercase italic">
              Confirm <span className="text-white">Deletion</span>
            </DialogTitle>
            <DialogDescription className="font-mono text-[10px] text-red-400/80 uppercase tracking-wider">
              Warning: Deleting user nodes is permanent!
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <p className="text-sm text-[#EEE8DC]">
              Are you sure you want to permanently delete the user account for{' '}
              <strong className="text-white">{deletingUser?.name}</strong> ({deletingUser?.email})?
            </p>
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest leading-relaxed">
              This will revoke all access scopes and cannot be undone.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingUser(null)}
              className="border-white/10 hover:bg-white/5 text-[#EEE8DC] font-mono text-[10px] uppercase tracking-widest rounded-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteSubmit}
              className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-widest rounded-none h-10 gap-2 min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

