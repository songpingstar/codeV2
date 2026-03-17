import { useState, useEffect } from 'react';
import { Plus, X, Server, Loader2 } from 'lucide-react';
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
import { scriptsApi } from '@/app/api/scripts';
import { tasksApi } from '@/app/api/tasks';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  task?: {
    id: number;
    name: string;
    script_id: number;
    cron_expression: string;
    cron_description?: string;
    environment: string;
    execution_mode: string;
    target_nodes?: number[];
  };
  onSuccess?: () => void;
}

interface ScriptOption {
  id: number;
  name: string;
}

interface NodeOption {
  id: number;
  name: string;
  ip: string;
  status: string;
  environment: string;
}

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
  onSuccess,
}: TaskDialogProps) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    scriptId: task?.script_id?.toString() || '',
    cronExpression: task?.cron_expression || '',
    cronDescription: task?.cron_description || '',
    environment: task?.environment || 'dev',
    executionMode: task?.execution_mode || 'specified',
    targetNodes: task?.target_nodes?.map(String) || [] as string[],
  });

  const [scripts, setScripts] = useState<ScriptOption[]>([]);
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usePreset, setUsePreset] = useState(true);

  useEffect(() => {
    if (open) {
      loadScripts();
    }
  }, [open]);

  useEffect(() => {
    if (formData.environment) {
      loadNodes();
    }
  }, [formData.environment]);

  useEffect(() => {
    if (task && open) {
      setFormData({
        name: task.name || '',
        scriptId: task.script_id?.toString() || '',
        cronExpression: task.cron_expression || '',
        cronDescription: task.cron_description || '',
        environment: task.environment || 'dev',
        executionMode: task.execution_mode || 'specified',
        targetNodes: task.target_nodes?.map(String) || [],
      });
    }
  }, [task, open]);

  async function loadScripts() {
    try {
      setLoadingScripts(true);
      const res = await scriptsApi.getList({ page: 1, size: 100 });
      setScripts(res.items || []);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    } finally {
      setLoadingScripts(false);
    }
  }

  async function loadNodes() {
    try {
      setLoadingNodes(true);
      const res = await tasksApi.getAvailableNodes(formData.environment);
      setNodes(res || []);
    } catch (err) {
      console.error('Failed to load nodes:', err);
    } finally {
      setLoadingNodes(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      
      const payload = {
        name: formData.name,
        script_id: parseInt(formData.scriptId),
        cron_expression: formData.cronExpression,
        cron_description: formData.cronDescription || undefined,
        environment: formData.environment,
        execution_mode: formData.executionMode,
        target_nodes: formData.targetNodes.map(Number),
      };

      if (mode === 'create') {
        await tasksApi.create(payload);
      } else if (mode === 'edit' && task?.id) {
        await tasksApi.update(task.id, payload);
      }

      onOpenChange(false);
      onSuccess?.();
      
      setFormData({
        name: '',
        scriptId: '',
        cronExpression: '',
        cronDescription: '',
        environment: 'dev',
        executionMode: 'specified',
        targetNodes: [],
      });
    } catch (err: any) {
      console.error('Failed to submit task:', err);
      alert(err.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  }

  const handlePresetChange = (value: string) => {
    setFormData({ ...formData, cronExpression: value });
  };

  const getCronDescription = (cron: string) => {
    const preset = cronPresets.find(p => p.value === cron);
    return preset?.description || '';
  };

  const handleNodeToggle = (nodeId: number) => {
    const nodeIdStr = nodeId.toString();
    setFormData(prev => {
      const currentNodes = prev.targetNodes;
      const isSelected = currentNodes.includes(nodeIdStr);
      return {
        ...prev,
        targetNodes: isSelected
          ? currentNodes.filter(id => id !== nodeIdStr)
          : [...currentNodes, nodeIdStr],
      };
    });
  };

  const environmentNodes = nodes.filter(n => n.environment === formData.environment);
  const onlineNodesInEnv = environmentNodes.filter(n => n.status === 'online');
  
  const handleEnvironmentChange = (env: string) => {
    setFormData(prev => ({
      ...prev,
      environment: env,
      targetNodes: [],
    }));
  };

  const handleSelectAll = () => {
    const allOnlineNodeIds = onlineNodesInEnv.map(n => n.id.toString());
    const allSelected = allOnlineNodeIds.every(id => formData.targetNodes.includes(id));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        targetNodes: [],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetNodes: allOnlineNodeIds,
      }));
    }
  };

  const isAllSelected = onlineNodesInEnv.length > 0 && 
                        onlineNodesInEnv.every(n => formData.targetNodes.includes(n.id.toString()));

  const getEnvironmentConfig = (env: string) => {
    const configs: Record<string, { label: string; color: string; textColor: string; dotColor: string }> = {
      dev: { label: '开发环境', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
      test: { label: '测试环境', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', dotColor: 'bg-yellow-500' },
      prod: { label: '生产环境', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', dotColor: 'bg-red-500' },
    };
    return configs[env] || configs.dev;
  };

  const isFormValid = formData.name && 
                      formData.scriptId && 
                      formData.cronExpression &&
                      formData.targetNodes.length > 0;

  const envConfig = getEnvironmentConfig(formData.environment);

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

          <div className="space-y-2">
            <Label htmlFor="script" className="text-sm font-medium">
              关联脚本 *
            </Label>
            <Select 
              value={formData.scriptId} 
              onValueChange={(value) => setFormData({ ...formData, scriptId: value })}
            >
              <SelectTrigger id="script">
                <SelectValue placeholder={loadingScripts ? "加载中..." : "选择要执行的脚本"} />
              </SelectTrigger>
              <SelectContent>
                {loadingScripts ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2 text-sm">加载中...</span>
                  </div>
                ) : scripts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    暂无可用脚本
                  </div>
                ) : (
                  scripts.map((script) => (
                    <SelectItem key={script.id} value={script.id.toString()}>
                      {script.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">执行计划 (Cron) *</Label>
            
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

          <div className="space-y-4">
            <Label className="text-sm font-medium">执行配置 *</Label>
            
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
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${envConfig.color} ${envConfig.textColor}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${envConfig.dotColor}`}></div>
                当前环境: {envConfig.label}
              </div>
            </div>

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
                {loadingNodes ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="ml-2 text-sm">加载节点...</span>
                  </div>
                ) : environmentNodes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    该环境暂无在线节点
                  </div>
                ) : (
                  environmentNodes.map((node) => (
                    <label
                      key={node.id}
                      className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                        node.status === 'online' 
                          ? 'hover:bg-gray-50' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <Checkbox
                        checked={formData.targetNodes.includes(node.id.toString())}
                        onCheckedChange={() => {
                          if (node.status === 'online') {
                            handleNodeToggle(node.id);
                          }
                        }}
                        disabled={node.status !== 'online'}
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
                    </label>
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

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              任务描述
            </Label>
            <Textarea
              id="description"
              placeholder="描述任务的用途和注意事项"
              value={formData.cronDescription}
              onChange={(e) => setFormData({ ...formData, cronDescription: e.target.value })}
              rows={3}
            />
          </div>

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
            disabled={!isFormValid || submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Plus className="w-4 h-4 mr-2" />
            {mode === 'create' ? '创建任务' : '保存修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
