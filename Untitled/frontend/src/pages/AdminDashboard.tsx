import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userApi } from '../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import CertificationManagement from "@/components/certifications/CertificationManagement";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  serviceCategory?: string;
  rating?: number;
  totalRatings?: number;
  profilePicture?: string;
  description?: string;
  hourlyRate?: number;
  bankName?: string;
  accountNumber?: string;
  branchName?: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalSeekers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  recentRegistrations: number;
  categoryStats: Array<{ _id: string; count: number }>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'service_provider' | 'service_seeker' | 'all_users' | 'certifications'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Replace filteredUsers with memoized version
  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users
      .filter(u => activeTab === 'all_users' || u.role === activeTab)
      .filter(u => {
        if (!term) return true;
        return [
          u.name,
          u.email,
          u.location,
          u.serviceCategory ?? ''
        ].some(field => field.toLowerCase().includes(term));
      });
  }, [users, activeTab, searchTerm]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    
    loadData();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const usersData = await userApi.getAllUsers();
      setUsers(usersData as User[]);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await userApi.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditedUser(user);
    setPreviewUrl(user.profilePicture || '');
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      let profilePictureUrl = editedUser.profilePicture;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profilePicture', selectedFile);
        // Note: This endpoint doesn't exist yet, so we'll skip file upload for now
        // profilePictureUrl = uploadResponse.data.profilePictureUrl;
      }

      const updatedUser = {
        ...editedUser,
        profilePicture: profilePictureUrl,
      };

      await userApi.adminUpdateUser(selectedUser._id, updatedUser as any);
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleToggleVerification = async (userId: string) => {
    try {
      await userApi.toggleUserVerification(userId);
      toast.success('User verification status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      {activeTab !== 'overview' && activeTab !== 'certifications' && (
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Search users…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full" onValueChange={(value: string) => setActiveTab(value as 'overview' | 'service_provider' | 'service_seeker' | 'all_users' | 'certifications')}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="service_provider">Service Providers</TabsTrigger>
          <TabsTrigger value="service_seeker">Service Seekers</TabsTrigger>
          <TabsTrigger value="all_users">All Users</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading statistics...</div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProviders}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Service Seekers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSeekers}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Verification Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Verified Users</span>
                        <Badge variant="default">{stats.verifiedUsers}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Unverified Users</span>
                        <Badge variant="secondary">{stats.unverifiedUsers}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Service Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.categoryStats.map((category) => (
                        <div key={category._id} className="flex justify-between">
                          <span>{category._id || 'Uncategorized'}</span>
                          <Badge variant="outline">{category.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">Failed to load statistics</div>
          )}
        </TabsContent>

        <TabsContent value="service_provider">
          <div className="bg-white rounded-lg shadow mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Service Category</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>{user.serviceCategory || '-'}</TableCell>
                    <TableCell>{user.rating || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="service_seeker">
          <div className="bg-white rounded-lg shadow mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all_users">
          <div className="bg-white rounded-lg shadow mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'service_provider' ? 'secondary' : 'outline'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.emailVerified || false}
                          onCheckedChange={() => handleToggleVerification(user._id)}
                        />
                        <span className="text-sm">
                          {user.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationManagement />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || editedUser.profilePicture} />
                  <AvatarFallback>{editedUser.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="profilePicture" className="cursor-pointer">
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editedUser.name || ''}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editedUser.email || ''}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editedUser.location || ''}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {editedUser.role === 'service_provider' && (
              <div className="space-y-4">
                <div>
                  <Label>Service Category</Label>
                  <Input
                    value={editedUser.serviceCategory || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        serviceCategory: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editedUser.description || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Hourly Rate</Label>
                  <Input
                    type="number"
                    value={editedUser.hourlyRate || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        hourlyRate: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={editedUser.bankName || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        bankName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={editedUser.accountNumber || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Branch Name</Label>
                  <Input
                    value={editedUser.branchName || ''}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        branchName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;