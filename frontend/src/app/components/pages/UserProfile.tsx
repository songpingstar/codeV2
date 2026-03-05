import { User, Mail, Edit2, Save, X, Key, Lock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authApi } from '@/app/api/auth';
import { usersApi } from '@/app/api/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState({
    email: false,
  });

  const [editValues, setEditValues] = useState({ email: '' });

  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const res = await authApi.getMe();
      setUserData(res);
      setEditValues({ email: res.email });
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载用户信息失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEmail() {
    if (!userData) return;
    try {
      await usersApi.update(userData.id, { email: editValues.email });
      setUserData({ ...userData, email: editValues.email });
      setIsEditing({ email: false });
    } catch (err: any) {
      console.error("update email error:", err);
      setError(err.response?.data?.message || '更新邮箱失败');
    }
  }

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    try {
      await usersApi.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setIsChangePasswordDialogOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('密码修改成功');
    } catch (err: any) {
      console.error("change password error:", err);
      setError(err.response?.data?.message || '修改密码失败');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleEditEmail = () => {
    setEditValues({ email: userData?.email || '' });
    setIsEditing({ email: true });
  };

  const handleCancelEmail = () => {
    setEditValues({ email: userData?.email || '' });
    setIsEditing({ email: false });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { text: string; className: string }> = {
      admin: { text: '系统管理员', className: 'bg-red-100 text-red-700 border-red-200' },
      ops: { text: '运维工程师', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      readonly: { text: '只读用户', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const config = roleConfig[role] || roleConfig.readonly;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          正常
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        已禁用
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">个人资料</h1>
        <p className="mt-1 text-sm text-gray-500">
          查看和管理您的个人信息
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header Section with Avatar */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ) : userData ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-semibold text-gray-900 text-lg">{userData.username}</h2>
                    {getRoleBadge(userData.role)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(userData.status)}
                    <span className="text-sm text-gray-500">ID: {userData.id}</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="px-8 py-6">
          <div className="space-y-5">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1.5">用户名</p>
                <p className="text-sm text-gray-900 font-medium">{userData?.username || '-'}</p>
                <p className="text-xs text-gray-400 mt-1">用户名不可修改</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1.5">邮箱地址</p>
                {isEditing.email ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={editValues.email}
                      onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSaveEmail}
                      className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="保存"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEmail}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      title="取消"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 break-all">{userData?.email || '-'}</p>
                    <button
                      onClick={handleEditEmail}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑邮箱"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1.5">登录密码</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900">••••••••</p>
                  <button
                    onClick={() => setIsChangePasswordDialogOpen(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="修改密码"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="font-medium text-gray-900 mb-6">使用统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-5 border border-blue-100">
            <p className="text-sm text-blue-700 font-medium mb-2">创建脚本</p>
            <p className="text-3xl font-semibold text-blue-900">24</p>
            <p className="text-xs text-blue-600 mt-1">个</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-5 border border-green-100">
            <p className="text-sm text-green-700 font-medium mb-2">执行任务</p>
            <p className="text-3xl font-semibold text-green-900">156</p>
            <p className="text-xs text-green-600 mt-1">次</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-5 border border-orange-100">
            <p className="text-sm text-orange-700 font-medium mb-2">登录天数</p>
            <p className="text-3xl font-semibold text-orange-900">385</p>
            <p className="text-xs text-orange-600 mt-1">天</p>
          </div>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              修改密码
            </DialogTitle>
            <DialogDescription>修改您的登录密码</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">
                当前密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="old-password"
                type="password"
                placeholder="••••••••"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">
                新密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                确认新密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500">密码长度至少 8 位，包含字母和数字</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleChangePassword} className="bg-orange-600 hover:bg-orange-700">
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
