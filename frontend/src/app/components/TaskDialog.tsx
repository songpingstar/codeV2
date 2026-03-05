import { useState } from 'react';
import { Plus, X, Server } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  task?: {
    id: string;
    name: string;
    scriptId: string;
    cronExpression: string;
    description?: string;
    environment?: string;
    executionMode?: 'specified' | 'all';
    targetNodes?: string[];
  };
}

const mockScripts = [
  { id: '1', name: '系统巡检脚本' },
  { id: '2', name: '日志清理任务' },
  { id: '3', name: '数据库备份' },
  { id: '4', name: '应用部署脚本' },
  { id: '5', name: '监控数据采集' },
  { id: '7', name: '磁盘空间检查' },
];

const mockNodes = [
  // 开发环境节点
  { id: 'dev-1', name: 'dev-web-01', ip: '192.168.10.10', status: 'online', environment: 'dev' },
  { id: 'dev-2', name: 'dev-web-02', ip: '192.168.10.11', status: 'online', environment: 'dev' },
  { id: 'dev-3', name: 'dev-db-01', ip: '192.168.10.20', status: 'online', environment: 'dev' },
  
  // 测试环境节点
  { id: 'test-1', name: 'test-web-01', ip: '192.168.20.10', status: 'online', environment: 'test' },
  { id: 'test-2', name: 'test-web-02', ip: '192.168.20.11', status: 'online', environment: 'test' },
  { id: 'test-3', name: 'test-db-01', ip: '192.168.20.20', status: 'offline', environment: 'test' },
  { id: 'test-4', name: 'test-cache-01', ip: '192.168.20.30', status: 'online', environment: 'test' },
  
  // 生产环境节点
  { id: 'prod-1', name: 'prod-web-01', ip: '192.168.1.10', status: 'online', environment: 'prod' },
  { id: 'prod-2', name: 'prod-web-02', ip: '192.168.1.11', status: 'online', environment: 'prod' },
  { id: 'prod-3', name: 'prod-db-01', ip: '192.168.1.20', status: 'online', environment: 'prod' },
  { id: 'prod-4', name: 'prod-db-02', ip: '192.168.1.21', status: 'online', environment: 'prod' },
  { id: 'prod-5', name: 'prod-cache-01', ip: '192.168.1.30', status: 'online', environment: 'prod' },
  { id: 'prod-6', name: 'prod-app-01', ip: '192.168.1.40', status: 'offline', environment: 'prod' },
];

const cronPresets = [
  { label: '每小时', value: '0 * * * *', description: '每小时的第 0 分钟执行' },
  { label: '每天凌晨 2 点', value: '0 2 * * *', description: '每天 02:00 执行' },
  { label: '每天上午 9 点', value: '0 9 * * *', description: '每天 09:00 执行' },
  { label: '每周一上午 9 点', value: '0 9 * * 1', description: '每周一 09:00 执行' },
  { label: '每月 1 号凌晨 2 点', value: '0 2 1 * *', description: '每月 1 号 02:00 执行' },
  { label: '工作日下午 6 点', value: '0 18 * * 1-5', description: '周一至周五 18:00 执行' },
  { label: '每 5 分钟', value: '*/5 * * * *', description: '每 5 分钟执行一次' },
  { label: '每 30 分钟', value: '*/30 * * * *', description: '每 30 分钟执行一次' },
];

export function TaskDialog({
  open,
  onOpenChange,
  mode = 'create',
  task,
}: TaskDialogProps) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    scriptId: task?.scriptId || '',
    cronExpression: task?.cronExpression || '',
    description: task?.description || '',
    environment: task?.environment || 'dev',
    executionMode: task?.executionMode || 'specified' as 'specified' | 'all',
    targetNodes: task?.targetNodes || [] as string[],
  });

  const [usePreset, setUsePreset] = useState(true);

  const handleSubmit = () => {
    console.log('Task data:', formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      scriptId: '',
      cronExpression: '',
      description: '',
      environment: 'dev',
      executionMode: 'specified',
      targetNodes: [],
    });
  };

  const handlePresetChange = (value: string) => {
    setFormData({ ...formData, cronExpression: value });
  };

  const getCronDescription = (cron: string) => {
    const preset = cronPresets.find(p => p.value === cron);
    return preset?.description || '';
  };

  const toggleNode = (nodeId: string) => {
    setFormData(prev => ({
      ...prev,
      targetNodes: prev.targetNodes.includes(nodeId)
        ? prev.targetNodes.filter(id => id !== nodeId)
        : [...prev.targetNodes, nodeId],
    }));
  };

  // Filter nodes by selected environment
  const environmentNodes = mockNodes.filter(n => n.environment === formData.environment);
  const onlineNodesInEnv = environmentNodes.filter(n => n.status === 'online');
  
  // Handle environment change - clear selected nodes when environment changes
  const handleEnvironmentChange = (env: 'dev' | 'test' | 'prod') => {
    setFormData(prev => ({
      ...prev,
      environment: env,
      targetNodes: [], // Clear node selection when environment changes
    }));
  };

  // Handle select all / deselect all
  const handleSelectAll = () => {
    const allOnlineNodeIds = onlineNodesInEnv.map(n => n.id);
    const allSelected = allOnlineNodeIds.every(id => formData.targetNodes.includes(id));
    
    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        targetNodes: [],
      }));
    } else {
      // Select all online nodes
      setFormData(prev => ({
        ...prev,
        targetNodes: allOnlineNodeIds,
      }));
    }
  };

  const isAllSelected = onlineNodesInEnv.length > 0 && 
                        onlineNodesInEnv.every(n => formData.targetNodes.includes(n.id));

  const getEnvironmentConfig = (env: string) => {
    const configs = {
      dev: {
        label: '开发环境',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-500',
      },
      test: {
        label: '测试环境',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
        dotColor: 'bg-yellow-500',
      },
      prod: {
        label: '生产环境',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
      },
    };
    return configs[env as keyof typeof configs];
  };

  const isFormValid = formData.name && 
                      formData.scriptId && 
                      formData.cronExpression &&
                      formData.targetNodes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === 'create' ? '新建定时任务' : '编辑定时任务'}
          </DialogTitle>
          <DialogDescription>
            配置任务的基本信息、执行计划和目标节点
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              任务名称 *
            </Label>
            <Input
              id="taskName"
              placeholder="例如：每日系统巡检"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Script Selection */}
          <div className="space-y-2">
            <Label htmlFor="script" className="text-sm font-medium">
              关联脚本 *
            </Label>
            <Select 
              value={formData.scriptId} 
              onValueChange={(value) => setFormData({ ...formData, scriptId: value })}
            >
              <SelectTrigger id="script">
                <SelectValue placeholder="选择要执行的脚本" />
              </SelectTrigger>
              <SelectContent>
                {mockScripts.map((script) => (
                  <SelectItem key={script.id} value={script.id}>
                    {script.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cron Expression */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">执行计划 (Cron) *</Label>
            
            {/* Preset/Custom Toggle */}
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant={usePreset ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsePreset(true)}
                className={usePreset ? '' : 'text-gray-600'}
              >
                使用预设
              </Button>
              <Button
                type="button"
                variant={!usePreset ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUsePreset(false)}
                className={!usePreset ? '' : 'text-gray-600'}
              >
                自定义表达式
              </Button>
            </div>

            {usePreset ? (
              <div className="space-y-2">
                <Select 
                  value={formData.cronExpression} 
                  onValueChange={handlePresetChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择执行频率" />
                  </SelectTrigger>
                  <SelectContent>
                    {cronPresets.map((preset, index) => (
                      <SelectItem key={index} value={preset.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{preset.label}</span>
                          <span className="text-xs text-gray-500">{preset.value}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.cronExpression && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex-1">
                      <code className="text-xs font-mono text-blue-700">
                        {formData.cronExpression}
                      </code>
                      <p className="text-xs text-blue-600 mt-1">
                        {getCronDescription(formData.cronExpression)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="例如：0 9 * * * (每天 9 点)"
                  value={formData.cronExpression}
                  onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Cron 表达式格式：分 时 日 月 周</p>
                  <p className="font-mono">* * * * * → 每分钟执行</p>
                  <p className="font-mono">0 9 * * * → 每天 9:00 执行</p>
                </div>
              </div>
            )}
          </div>

          {/* Execution Environment & Target Nodes */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">执行配置 *</Label>
            
            {/* Environment Selection */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">执行环境</div>
              <Select value={formData.environment} onValueChange={handleEnvironmentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      开发环境 (dev)
                    </div>
                  </SelectItem>
                  <SelectItem value="test">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      测试环境 (test)
                    </div>
                  </SelectItem>
                  <SelectItem value="prod">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      生产环境 (prod)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Environment Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${getEnvironmentConfig(formData.environment).color} ${getEnvironmentConfig(formData.environment).textColor}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${getEnvironmentConfig(formData.environment).dotColor}`}></div>
                当前环境: {getEnvironmentConfig(formData.environment).label}
              </div>
            </div>

            {/* Target Nodes Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-700">
                  执行节点（共 {environmentNodes.length} 个节点，{onlineNodesInEnv.length} 个在线）
                </div>
                {onlineNodesInEnv.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-7 text-xs"
                  >
                    {isAllSelected ? '取消全选' : '全选'}
                  </Button>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {environmentNodes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    该环境暂无节点
                  </div>
                ) : (
                  environmentNodes.map((node) => (
                    <div
                      key={node.id}
                      className={`flex items-center gap-3 p-3 transition-colors ${
                        node.status === 'online' 
                          ? 'hover:bg-gray-50 cursor-pointer' 
                          : 'bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => node.status === 'online' && toggleNode(node.id)}
                    >
                      <Checkbox
                        checked={formData.targetNodes.includes(node.id)}
                        onCheckedChange={() => node.status === 'online' && toggleNode(node.id)}
                        disabled={node.status === 'offline'}
                      />
                      <Server className={`w-4 h-4 ${
                        node.status === 'online' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {node.name}
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            node.status === 'online'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {node.status === 'online' ? '在线' : '离线'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{node.ip}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {formData.targetNodes.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  已选择 <span className="font-medium text-blue-600">{formData.targetNodes.length}</span> 个节点
                  {isAllSelected && <span className="text-blue-600">（全部在线节点）</span>}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              任务描述
            </Label>
            <Textarea
              id="description"
              placeholder="描述任务的用途和注意事项"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">注意事项</h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>任务创建后默认为启用状态，将按照 Cron 表达式自动执行</li>
              <li>确保关联的脚本已经过测试且配置正确</li>
              <li>选择执行环境后，可以单独选择或批量选择该环境下的节点</li>
              <li>使用"全选"功能可快速选择当前环境的所有在线节点</li>
              <li>可以在任务列表中随时暂停或编辑任务</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {mode === 'create' ? '创建任务' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}