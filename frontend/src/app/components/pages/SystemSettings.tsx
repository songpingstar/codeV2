import { useState, useEffect } from 'react';
import {
  Users,
  Settings,
  Bell,
  Shield,
  Server,
  User,
  Mail,
  Lock,
  Globe,
  Clock,
  AlertTriangle,
  Check,
  Save,
  RotateCcw,
  KeyRound,
  Database,
  FileText,
  Zap,
  MessageSquare,
  Webhook,
  ChevronRight,
  FolderTree,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { UserPermissionManagement } from '@/app/components/pages/UserPermissionManagement';
import { EnvironmentConfiguration } from '@/app/components/pages/EnvironmentConfiguration';
import { NotificationConfiguration } from '@/app/components/pages/NotificationConfiguration';
import { SecurityConfiguration } from '@/app/components/pages/SecurityConfiguration';
import { SystemParameterConfiguration } from '@/app/components/pages/SystemParameterConfiguration';
import { scriptCategoriesApi } from '@/app/api/script-categories';

interface SettingMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  script_count: number;
}

const settingMenus: SettingMenuItem[] = [
  { id: 'users', label: '用户与权限', icon: Users },
  { id: 'categories', label: '脚本分类管理', icon: FolderTree },
  { id: 'environment', label: '执行环境配置', icon: Server },
  { id: 'notification', label: '通知配置', icon: Bell },
  { id: 'security', label: '安全设置', icon: Shield },
  { id: 'system', label: '系统参数', icon: Settings },
];

export function SystemSettings() {
  const [activeSection, setActiveSection] = useState('users');
  const [hasChanges, setHasChanges] = useState(false);

  // Script categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: number | 'new'; name: string; description: string; color: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ id: number; name: string } | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');
      const data = await scriptCategoriesApi.getList();
      setCategories(data || []);
    } catch (err: any) {
      console.error("load categories error:", err);
      setError(err.response?.data?.message || '加载分类失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCategory() {
    if (!editingCategory) return;
    try {
      if (editingCategory.id === 'new') {
        await scriptCategoriesApi.create({
          name: editingCategory.name,
          description: editingCategory.description,
          color: editingCategory.color,
        });
      } else {
        await scriptCategoriesApi.update(editingCategory.id, {
          name: editingCategory.name,
          description: editingCategory.description,
          color: editingCategory.color,
        });
      }
      setEditingCategory(null);
      loadCategories();
    } catch (err: any) {
      console.error("save category error:", err);
      setError(err.response?.data?.message || '保存分类失败');
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return;
    try {
      await scriptCategoriesApi.delete(deletingCategory.id);
      setDeletingCategory(null);
      loadCategories();
    } catch (err: any) {
      console.error("delete category error:", err);
      setError(err.response?.data?.message || '删除分类失败');
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = () => {
    console.log('Saving settings...');
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  const markChanged = () => {
    setHasChanges(true);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderCategoriesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">脚本分类管理</h2>
          <p className="text-sm text-gray-500 mt-1">管理脚本的分类标签，便于组织和查找脚本</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setEditingCategory({ id: 'new', name: '', description: '', color: 'blue' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建分类
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              暂无分类数据
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const colorClasses = getColorClasses(category.color);
                return (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
                        <FolderTree className={`w-5 h-5 ${colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}>
                            {category.script_count} 个脚本
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{category.description || '暂无描述'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory({ id: category.id, name: category.name, description: category.description, color: category.color })}
                        className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingCategory({ id: category.id, name: category.name })}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={category.script_count > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingCategory?.id === 'new' ? (
                <>
                  <Plus className="w-5 h-5 text-blue-600" />
                  新建分类
                </>
              ) : (
                <>
                  <Edit className="w-5 h-5 text-blue-600" />
                  编辑分类
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingCategory?.id === 'new' ? '创建新的脚本分类' : '修改分类信息'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                分类名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                value={editingCategory?.name || ''}
                onChange={(e) => setEditingCategory(editingCategory ? { ...editingCategory, name: e.target.value } : null)}
                placeholder="例如: 监控告警"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-desc">分类描述</Label>
              <textarea
                id="category-desc"
                value={editingCategory?.description || ''}
                onChange={(e) => setEditingCategory(editingCategory ? { ...editingCategory, description: e.target.value } : null)}
                placeholder="描述该分类的用途"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">分类颜色</Label>
              <Select
                value={editingCategory?.color || 'blue'}
                onValueChange={(value) => setEditingCategory(editingCategory ? { ...editingCategory, color: value } : null)}
              >
                <SelectTrigger id="category-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <span>蓝色</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="green">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span>绿色</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="purple">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500"></div>
                      <span>紫色</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="orange">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-orange-500"></div>
                      <span>橙色</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="red">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500"></div>
                      <span>红色</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="indigo">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-indigo-500"></div>
                      <span>靛青</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory} className="bg-blue-600 hover:bg-blue-700">
              {editingCategory?.id === 'new' ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Alert Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              确认删除分类
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类 <span className="font-semibold text-gray-900">{deletingCategory?.name}</span> 吗？
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'categories':
        return renderCategoriesSection();
      case 'environment':
        return <EnvironmentConfiguration />;
      case 'notification':
        return <NotificationConfiguration />;
      case 'security':
        return <SecurityConfiguration />;
      case 'system':
        return <SystemParameterConfiguration />;
      default:
        return <UserPermissionManagement />;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Settings Menu */}
      <div className="w-56 flex-shrink-0">
        <Card className="sticky top-6">
          <CardContent className="pt-6">
            <nav className="space-y-1">
              {settingMenus.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeSection === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => setActiveSection(menu.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  );
}
