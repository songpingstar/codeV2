import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Edit2,
  Ban,
  Check,
  Crown,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
import { formatDate } from '@/app/utils/datetime';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { usersApi } from '@/app/api/users';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'disabled';
  created_at: string;
}

interface UserStats {
  total: number;
  active: number;
  disabled: number;
}

export function UserPermissionManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // User form state
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'readonly',
  });

  // Reset password form state
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const usersRes = await usersApi.getList({ page: 1, size: 100 });
      setUsers(usersRes.items || []);
      setStats({
        total: usersRes.total || 0,
        active: usersRes.items?.filter((u: User) => u.status === 'active').length || 0,
        disabled: usersRes.items?.filter((u: User) => u.status === 'disabled').length || 0,
      });
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleUserStatus(userId: number) {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      await usersApi.update(userId, { status: user.status === 'active' ? 'disabled' : 'active' });
      loadData();
    } catch (err: any) {
      console.error("toggle status error:", err);
      setError(err.response?.data?.message || '切换状态失败');
    }
  }

  async function handleSubmitAddUser() {
    try {
      await usersApi.create({
        username: userFormData.username,
        password: userFormData.password,
        email: userFormData.email,
        role: userFormData.role,
      });
      setIsAddUserDialogOpen(false);
      loadData();
    } catch (err: any) {
      console.error("create error:", err);
      setError(err.response?.data?.message || '创建失败');
    }
  }

  async function handleSubmitEditUser() {
    if (!selectedUser) return;
    try {
      await usersApi.update(selectedUser.id, {
        email: userFormData.email,
        role: userFormData.role,
      });
      setIsEditUserDialogOpen(false);
      loadData();
    } catch (err: any) {
      console.error("update error:", err);
      setError(err.response?.data?.message || '更新失败');
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm("确认删除该用户吗？")) return;
    try {
      await usersApi.delete(userId);
      loadData();
    } catch (err: any) {
      console.error("delete error:", err);
      setError(err.response?.data?.message || '删除失败');
    }
  }

  async function handleResetPassword() {
    if (!selectedUser) return;
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    try {
      await usersApi.resetPassword(selectedUser.id, resetPasswordData.password);
      setIsResetPasswordDialogOpen(false);
      setResetPasswordData({ password: '', confirmPassword: '' });
      alert('密码重置成功');
    } catch (err: any) {
      console.error("reset password error:", err);
      setError(err.response?.data?.message || '重置密码失败');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUserCount = stats?.active ?? 0;
  const disabledUserCount = stats?.disabled ?? 0;

  const getRoleBadge = (roleId: string) => {
    const roleConfig: Record<string, { text: string; className: string; icon?: React.ElementType }> = {
      admin: { text: '系统管理员', className: 'bg-red-100 text-red-700 border-red-200', icon: Crown },
      ops: { text: '运维工程师', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Shield },
      readonly: { text: '只读用户', className: 'bg-gray-100 text-gray-700 border-gray-200', icon: Eye },
    };

    const config = roleConfig[roleId] || roleConfig.readonly;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${config.className}`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1.5" />
          正常
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <Ban className="w-3 h-3 mr-1.5" />
        已禁用
      </span>
    );
  };

  const handleAddUser = () => {
    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'readonly',
    });
    setIsAddUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsEditUserDialogOpen(true);
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setIsResetPasswordDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户与权限管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统用户和权限配置</p>
        </div>
        {hasPermission("user:create") && (
        <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          新增用户
        </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总用户数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">正常用户</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{activeUserCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已禁用</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{disabledUserCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <Ban className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">角色数量</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户名、邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full lg:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="用户角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">系统管理员</SelectItem>
                  <SelectItem value="ops">运维工程师</SelectItem>
                  <SelectItem value="readonly">只读用户</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="用户状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>管理系统用户账号和状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm text-gray-500">
                      暂无用户数据
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 transition-colors ${
                        user.status === 'disabled' ? 'bg-gray-50/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              user.role === 'admin'
                                ? 'bg-red-100'
                                : user.role === 'ops'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            {user.role === 'admin' ? (
                              <Crown className="w-4 h-4 text-red-600" />
                            ) : (
                              <Users className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              user.status === 'disabled' ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-sm ${
                            user.status === 'disabled' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {user.email}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs ${
                            user.status === 'disabled' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {formatDate(user.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("user:update") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          )}
                          {hasPermission("user:password:reset") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPasswordClick(user)}
                            className="h-8 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          )}
                          {hasPermission("user:update") && user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                              className={`h-8 px-3 ${
                                user.status === 'active'
                                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {user.status === 'active' ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              新增用户
            </DialogTitle>
            <DialogDescription>添加新的系统用户</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-username">
                用户名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-username"
                placeholder="例如: ops_user_03"
                value={userFormData.username}
                onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-email"
                type="email"
                placeholder="例如: user@example.com"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">
                密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-password"
                type="password"
                placeholder="••••••••"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              />
              <p className="text-xs text-gray-500">密码长度至少 8 位，包含字母和数字</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">
                用户角色 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
              >
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-red-600" />
                      <span>系统管理员</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ops">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>运维工程师</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="readonly">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>只读用户</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitAddUser} className="bg-blue-600 hover:bg-blue-700">
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              编辑用户
            </DialogTitle>
            <DialogDescription>修改用户信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">用户名</Label>
              <Input
                id="edit-username"
                value={userFormData.username}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">用户名不可修改</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="例如: user@example.com"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">
                用户角色 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-red-600" />
                      <span>系统管理员</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ops">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>运维工程师</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="readonly">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>只读用户</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitEditUser} className="bg-blue-600 hover:bg-blue-700">
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              重置密码
            </DialogTitle>
            <DialogDescription>
              为用户 <span className="font-semibold text-gray-900">{selectedUser?.username}</span> 重置密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">
                新密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="••••••••"
                value={resetPasswordData.password}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                确认密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={resetPasswordData.confirmPassword}
                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500">密码长度至少 8 位，包含字母和数字</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleResetPassword} className="bg-purple-600 hover:bg-purple-700">
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
