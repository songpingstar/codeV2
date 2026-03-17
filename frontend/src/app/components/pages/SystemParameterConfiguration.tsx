import { useState } from 'react';
import {
  Settings,
  Clock,
  Zap,
  FileText,
  Activity,
  Server,
  Database,
  Globe,
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  HardDrive,
  Network,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
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

interface SystemParameter {
  key: string;
  name: string;
  description: string;
  value: string;
  unit?: string;
  type: 'number' | 'text' | 'select';
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  category: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export function SystemParameterConfiguration() {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [parameters, setParameters] = useState<SystemParameter[]>([
    {
      key: 'script_timeout',
      name: '默认执行超时时间',
      description: '脚本执行的默认超时时间，超时后将自动终止',
      value: '3600',
      unit: '秒',
      type: 'number',
      icon: Clock,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      category: 'execution',
      min: 60,
      max: 86400,
    },
    {
      key: 'max_concurrent_tasks',
      name: '最大并发任务数',
      description: '系统同时执行的最大任务数量，超过此数量的任务将进入队列等待',
      value: '10',
      unit: '个',
      type: 'number',
      icon: Zap,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
      category: 'execution',
      min: 1,
      max: 100,
    },
    {
      key: 'log_retention_days',
      name: '日志保留天数',
      description: '执行日志和审计日志的保留时长，过期日志将自动清理',
      value: '90',
      unit: '天',
      type: 'number',
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      category: 'storage',
      min: 7,
      max: 365,
    },
    {
      key: 'agent_heartbeat_interval',
      name: 'Agent 心跳间隔',
      description: 'Agent 向服务端发送心跳的时间间隔，用于检测节点在线状态',
      value: '30',
      unit: '秒',
      type: 'number',
      icon: Activity,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      category: 'agent',
      min: 10,
      max: 300,
    },
    {
      key: 'agent_offline_threshold',
      name: 'Agent 离线判定时间',
      description: '超过此时间未收到心跳，则判定 Agent 离线',
      value: '120',
      unit: '秒',
      type: 'number',
      icon: Server,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
      category: 'agent',
      min: 30,
      max: 600,
    },
    {
      key: 'max_log_size',
      name: '单个日志文件大小上限',
      description: '单个执行日志文件的最大大小，超过后将自动切割',
      value: '100',
      unit: 'MB',
      type: 'number',
      icon: HardDrive,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      category: 'storage',
      min: 10,
      max: 1000,
    },
    {
      key: 'session_timeout',
      name: '会话超时时间',
      description: '用户无操作后自动退出登录的时间',
      value: '30',
      unit: '分钟',
      type: 'number',
      icon: Clock,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
      category: 'security',
      min: 5,
      max: 480,
    },
    {
      key: 'system_timezone',
      name: '系统时区',
      description: '系统使用的默认时区，影响所有时间显示',
      value: 'Asia/Shanghai',
      type: 'select',
      icon: Globe,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
      category: 'system',
      options: [
        { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
        { value: 'UTC', label: 'UTC (UTC+0)' },
        { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
        { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
      ],
    },
    {
      key: 'api_rate_limit',
      name: 'API 调用频率限制',
      description: '每个用户每分钟可调用 API 的最大次数',
      value: '100',
      unit: '次/分钟',
      type: 'number',
      icon: Network,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-50',
      category: 'security',
      min: 10,
      max: 1000,
    },
    {
      key: 'backup_retention_count',
      name: '备份保留数量',
      description: '系统自动备份的保留份数，超过后将删除最旧的备份',
      value: '7',
      unit: '份',
      type: 'number',
      icon: Database,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      category: 'storage',
      min: 1,
      max: 30,
    },
  ]);

  const [originalParameters] = useState<SystemParameter[]>(JSON.parse(JSON.stringify(parameters)));

  const handleParameterChange = (key: string, value: string) => {
    setParameters(
      parameters.map((param) =>
        param.key === key ? { ...param, value } : param
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setIsSaveDialogOpen(false);
      setHasChanges(false);
    }, 1500);
  };

  const handleReset = () => {
    setParameters(JSON.parse(JSON.stringify(originalParameters)));
    setHasChanges(false);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'execution':
        return '任务执行';
      case 'agent':
        return 'Agent 管理';
      case 'storage':
        return '存储管理';
      case 'security':
        return '安全配置';
      case 'system':
        return '系统配置';
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'execution':
        return Zap;
      case 'agent':
        return Activity;
      case 'storage':
        return Database;
      case 'security':
        return AlertTriangle;
      case 'system':
        return Settings;
      default:
        return Settings;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'execution':
        return 'text-blue-600';
      case 'agent':
        return 'text-green-600';
      case 'storage':
        return 'text-purple-600';
      case 'security':
        return 'text-orange-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const groupedParameters = parameters.reduce((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, SystemParameter[]>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统参数配置</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统运行的核心参数和默认值</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">参数配置说明</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>修改系统参数后需要点击"保存配置"按钮才会生效</li>
                <li>部分参数修改后需要重启相关服务才能完全生效</li>
                <li>建议在业务低峰期修改关键参数，避免影响正在运行的任务</li>
                <li>所有参数修改都会记录到审计日志中</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(groupedParameters).map((category) => {
          const Icon = getCategoryIcon(category);
          const color = getCategoryColor(category);
          return (
            <Card key={category}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{getCategoryName(category)}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {groupedParameters[category].length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Parameters by Category */}
      {Object.keys(groupedParameters).map((category) => {
        const CategoryIcon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className={`w-5 h-5 ${categoryColor}`} />
                {getCategoryName(category)}
              </CardTitle>
              <CardDescription>
                {category === 'execution' && '配置脚本执行相关的默认参数'}
                {category === 'agent' && '配置 Agent 节点的心跳和状态检测参数'}
                {category === 'storage' && '配置日志和备份的存储策略'}
                {category === 'security' && '配置安全相关的限制参数'}
                {category === 'system' && '配置系统全局参数'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupedParameters[category].map((param) => {
                  const Icon = param.icon;
                  return (
                    <div
                      key={param.key}
                      className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                    >
                      {/* Icon */}
                      <div className={`w-12 h-12 ${param.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${param.iconColor}`} />
                      </div>

                      {/* Info & Input */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {param.name}
                            </h3>
                            <p className="text-sm text-gray-600">{param.description}</p>
                          </div>
                        </div>

                        {/* Input Field */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-xs">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={param.key} className="text-xs text-gray-500 min-w-[80px]">
                                参数键名：
                              </Label>
                              <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {param.key}
                              </code>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              {param.type === 'select' ? (
                                <Select
                                  value={param.value}
                                  onValueChange={(value) => handleParameterChange(param.key, value)}
                                >
                                  <SelectTrigger id={param.key} className="h-10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {param.options?.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <>
                                  <Input
                                    id={param.key}
                                    type={param.type}
                                    value={param.value}
                                    onChange={(e) => handleParameterChange(param.key, e.target.value)}
                                    className="h-10 text-base font-semibold"
                                    min={param.min}
                                    max={param.max}
                                  />
                                  {param.unit && (
                                    <span className="text-sm text-gray-500 min-w-[60px]">
                                      {param.unit}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            {param.type === 'number' && param.min !== undefined && param.max !== undefined && (
                              <p className="text-xs text-gray-500 mt-2">
                                范围: {param.min} - {param.max} {param.unit}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">参数修改注意事项</p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>默认执行超时时间</strong>：设置过小可能导致长时间运行的脚本被意外终止
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>最大并发任务数</strong>：设置过大可能占用过多系统资源，建议根据服务器配置调整
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>Agent 心跳间隔</strong>：设置过小会增加网络开销，设置过大可能延迟发现节点故障
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>
                    <strong>日志保留天数</strong>：设置过长会占用更多磁盘空间，建议根据审计需求和存储容量设置
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 left-[280px] max-w-[calc(1440px-280px-48px)] mx-auto z-50">
          <Card className="border-2 border-blue-300 bg-blue-50 shadow-xl">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">您有未保存的参数修改</p>
                    <p className="text-xs text-blue-700">
                      修改了 {parameters.filter((p, i) => p.value !== originalParameters[i].value).length} 个参数，请保存或取消
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset} className="border-blue-300">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    取消修改
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    保存配置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-blue-600" />
              确认保存配置
            </DialogTitle>
            <DialogDescription>
              以下参数将被更新，请确认修改内容
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Changed Parameters */}
            <div className="space-y-3 mb-4">
              <p className="text-sm font-medium text-gray-900">将要修改的参数：</p>
              {parameters
                .filter((p, i) => p.value !== originalParameters[i].value)
                .map((param, index) => {
                  const originalParam = originalParameters.find((op) => op.key === param.key);
                  return (
                    <div
                      key={param.key}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {param.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <div>
                              <span className="text-gray-500">原值: </span>
                              <span className="font-mono text-red-600 line-through">
                                {originalParam?.value} {originalParam?.unit}
                              </span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div>
                              <span className="text-gray-500">新值: </span>
                              <span className="font-mono text-green-600 font-semibold">
                                {param.value} {param.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">重要提示</p>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                    <li>• 参数修改将立即生效，可能影响正在运行的任务</li>
                    <li>• 建议在业务低峰期进行参数调整</li>
                    <li>• 所有修改操作将记录到审计日志</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  确认保存
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
