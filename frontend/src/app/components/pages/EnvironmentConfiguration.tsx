import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Server,
  AlertTriangle,
  Check,
  X,
  Shield,
  TestTube,
  Code,
  Layers,
  ChevronRight,
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

interface Environment {
  id: string;
  name: string;
  type: 'dev' | 'test' | 'prod';
  description: string;
  defaultNode: string;
  nodeCount: number;
  scriptCount: number;
  isSystem: boolean;
  createdAt: string;
}

const mockEnvironments: Environment[] = [
  {
    id: 'prod',
    name: '生产环境',
    type: 'prod',
    description: '正式生产环境，运行关键业务系统，所有变更需经过严格审批',
    defaultNode: 'prod-node-01',
    nodeCount: 12,
    scriptCount: 45,
    isSystem: true,
    createdAt: '2025-01-01 00:00:00',
  },
  {
    id: 'test',
    name: '测试环境',
    type: 'test',
    description: '用于功能测试和集成测试，模拟生产环境配置',
    defaultNode: 'test-node-01',
    nodeCount: 5,
    scriptCount: 38,
    isSystem: true,
    createdAt: '2025-01-01 00:00:00',
  },
  {
    id: 'dev',
    name: '开发环境',
    type: 'dev',
    description: '开发人员日常开发测试使用，可随时重置',
    defaultNode: 'dev-node-01',
    nodeCount: 8,
    scriptCount: 52,
    isSystem: true,
    createdAt: '2025-01-01 00:00:00',
  },
];

const mockNodes = [
  { id: 'prod-node-01', name: 'prod-node-01', ip: '192.168.1.10' },
  { id: 'prod-node-02', name: 'prod-node-02', ip: '192.168.1.11' },
  { id: 'test-node-01', name: 'test-node-01', ip: '192.168.2.10' },
  { id: 'test-node-02', name: 'test-node-02', ip: '192.168.2.11' },
  { id: 'dev-node-01', name: 'dev-node-01', ip: '192.168.3.10' },
  { id: 'dev-node-02', name: 'dev-node-02', ip: '192.168.3.11' },
];

export function EnvironmentConfiguration() {
  const [environments, setEnvironments] = useState<Environment[]>(mockEnvironments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'dev' as 'dev' | 'test' | 'prod',
    description: '',
    defaultNode: '',
  });

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'prod':
        return Shield;
      case 'test':
        return TestTube;
      case 'dev':
        return Code;
      default:
        return Layers;
    }
  };

  const getEnvironmentColor = (type: string) => {
    switch (type) {
      case 'prod':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700 border-red-200',
        };
      case 'test':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
      case 'dev':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  };

  const getEnvironmentTypeName = (type: string) => {
    switch (type) {
      case 'prod':
        return '生产环境 (PROD)';
      case 'test':
        return '测试环境 (TEST)';
      case 'dev':
        return '开发环境 (DEV)';
      default:
        return type;
    }
  };

  const handleAddEnvironment = () => {
    setFormData({
      name: '',
      type: 'dev',
      description: '',
      defaultNode: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditEnvironment = (env: Environment) => {
    setSelectedEnvironment(env);
    setFormData({
      name: env.name,
      type: env.type,
      description: env.description,
      defaultNode: env.defaultNode,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteEnvironment = (env: Environment) => {
    setSelectedEnvironment(env);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = () => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: formData.name,
      type: formData.type,
      description: formData.description,
      defaultNode: formData.defaultNode,
      nodeCount: 0,
      scriptCount: 0,
      isSystem: false,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    setEnvironments([...environments, newEnv]);
    setIsAddDialogOpen(false);
  };

  const handleSubmitEdit = () => {
    if (!selectedEnvironment) return;
    setEnvironments(
      environments.map((env) =>
        env.id === selectedEnvironment.id
          ? {
              ...env,
              name: formData.name,
              description: formData.description,
              defaultNode: formData.defaultNode,
            }
          : env
      )
    );
    setIsEditDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedEnvironment) return;
    setEnvironments(environments.filter((env) => env.id !== selectedEnvironment.id));
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行环境配置</h1>
          <p className="text-sm text-gray-500 mt-1">管理脚本执行环境和默认节点配置</p>
        </div>
        <Button onClick={handleAddEnvironment} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新增环境
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">环境总数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{environments.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">生产环境</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {environments.filter((e) => e.type === 'prod').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">测试环境</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {environments.filter((e) => e.type === 'test').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">开发环境</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {environments.filter((e) => e.type === 'dev').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment List */}
      <div className="space-y-4">
        {environments.map((env) => {
          const Icon = getEnvironmentIcon(env.type);
          const colors = getEnvironmentColor(env.type);

          return (
            <Card
              key={env.id}
              className={`border-2 ${colors.border} hover:shadow-md transition-shadow`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section - Environment Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${colors.icon}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                          <span className={`px-3 py-1 rounded-md text-xs font-medium border ${colors.badge}`}>
                            {getEnvironmentTypeName(env.type)}
                          </span>
                          {env.isSystem && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              系统环境
                            </span>
                          )}
                          {env.type === 'prod' && (
                            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-medium flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              严格管控
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{env.description}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">默认节点</p>
                              <p className="text-sm font-medium text-gray-900">{env.defaultNode}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">节点数量</p>
                              <p className="text-sm font-medium text-gray-900">{env.nodeCount} 个</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">关联脚本</p>
                              <p className="text-sm font-medium text-gray-900">{env.scriptCount} 个</p>
                            </div>
                          </div>
                        </div>

                        {/* Warning for Production */}
                        {env.type === 'prod' && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-red-900">生产环境操作提示</p>
                              <p className="text-xs text-red-700 mt-0.5">
                                此为生产环境，所有脚本执行和配置变更需要特别谨慎，建议先在测试环境验证
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEnvironment(env)}
                      className="h-9"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                    {!env.isSystem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEnvironment(env)}
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">环境配置说明</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>每个环境可以配置默认执行节点，脚本执行时将优先使用该节点</li>
                <li>系统预设环境（开发、测试、生产）不可删除，但可以修改其配置</li>
                <li>生产环境具有最高安全级别，建议启用额外的审批流程</li>
                <li>删除环境前请确保没有正在运行的任务，否则可能导致任务失败</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Environment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              新增执行环境
            </DialogTitle>
            <DialogDescription>添加新的脚本执行环境</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-env-name">
                环境名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-env-name"
                placeholder="例如: 预发布环境"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-env-type">
                环境类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'dev' | 'test' | 'prod') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="add-env-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span>开发环境 (DEV)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="test">
                    <div className="flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-yellow-600" />
                      <span>测试环境 (TEST)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="prod">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>生产环境 (PROD)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-env-desc">环境描述</Label>
              <textarea
                id="add-env-desc"
                placeholder="描述该环境的用途和特点"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-env-node">
                默认执行节点 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.defaultNode}
                onValueChange={(value) => setFormData({ ...formData, defaultNode: value })}
              >
                <SelectTrigger id="add-env-node">
                  <SelectValue placeholder="选择默认节点" />
                </SelectTrigger>
                <SelectContent>
                  {mockNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-400" />
                        <span>{node.name}</span>
                        <span className="text-xs text-gray-500">({node.ip})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'prod' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-900">生产环境提醒</p>
                    <p className="text-xs text-red-700 mt-1">
                      您正在创建生产环境，请确保已做好相关安全配置和审批流程
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitAdd} className="bg-blue-600 hover:bg-blue-700">
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Environment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              编辑执行环境
            </DialogTitle>
            <DialogDescription>修改环境配置信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-env-name">环境名称</Label>
              <Input
                id="edit-env-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-env-type">环境类型</Label>
              <Select value={formData.type} disabled>
                <SelectTrigger id="edit-env-type" className="bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">开发环境 (DEV)</SelectItem>
                  <SelectItem value="test">测试环境 (TEST)</SelectItem>
                  <SelectItem value="prod">生产环境 (PROD)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">环境类型创建后不可修改</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-env-desc">环境描述</Label>
              <textarea
                id="edit-env-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-env-node">默认执行节点</Label>
              <Select
                value={formData.defaultNode}
                onValueChange={(value) => setFormData({ ...formData, defaultNode: value })}
              >
                <SelectTrigger id="edit-env-node">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockNodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-400" />
                        <span>{node.name}</span>
                        <span className="text-xs text-gray-500">({node.ip})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEnvironment?.type === 'prod' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-900">生产环境提醒</p>
                    <p className="text-xs text-red-700 mt-1">
                      您正在修改生产环境配置，变更可能影响正在运行的任务
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitEdit} className="bg-blue-600 hover:bg-blue-700">
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              删除执行环境
            </DialogTitle>
            <DialogDescription>此操作不可撤销，请仔细确认</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">危险操作警告</p>
                  <ul className="text-xs text-red-700 mt-2 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>删除环境后，所有关联的配置将被清除</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>正在运行的任务可能会失败</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>相关脚本的环境配置需要重新设置</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>此操作无法恢复</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {selectedEnvironment && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">即将删除的环境：</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${
                      getEnvironmentColor(selectedEnvironment.type).bg
                    } rounded-lg flex items-center justify-center`}
                  >
                    {(() => {
                      const Icon = getEnvironmentIcon(selectedEnvironment.type);
                      return (
                        <Icon className={`w-5 h-5 ${getEnvironmentColor(selectedEnvironment.type).icon}`} />
                      );
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedEnvironment.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedEnvironment.scriptCount} 个关联脚本 · {selectedEnvironment.nodeCount} 个节点
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              确定要删除环境 <span className="font-medium text-gray-900">"{selectedEnvironment?.name}"</span> 吗？
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
