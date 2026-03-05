import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, X, Play } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { nodesApi } from '@/app/api/nodes';
import { scriptsApi } from '@/app/api/scripts';

interface ScriptParam {
  key: string;
  value: string;
}

interface NodeItem {
  id: number;
  name: string;
  ip: string;
  environment: string;
  status: string;
}

interface ScriptExecuteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId?: number;
  scriptName?: string;
}

export function ScriptExecuteDialog({
  open,
  onOpenChange,
  scriptId,
  scriptName = '系统巡检脚本',
}: ScriptExecuteDialogProps) {
  const [environment, setEnvironment] = useState<string>('dev');
  const [params, setParams] = useState<ScriptParam[]>([
    { key: '', value: '' },
  ]);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);

  useEffect(() => {
    if (open && environment) {
      loadNodes();
    }
  }, [open, environment]);

  async function loadNodes() {
    try {
      setLoadingNodes(true);
      const res = await nodesApi.getList({ environment, size: 100 });
      const items = res?.items || [];
      setNodes(items.filter((n: NodeItem) => n.status === 'online'));
    } catch (err) {
      console.error('load nodes error:', err);
      setNodes([]);
    } finally {
      setLoadingNodes(false);
    }
  }

  const addParam = () => {
    setParams([...params, { key: '', value: '' }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...params];
    newParams[index][field] = value;
    setParams(newParams);
  };

  const toggleNode = (nodeId: number) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleEnvironmentChange = (newEnvironment: string) => {
    setEnvironment(newEnvironment);
    setSelectedNodes([]);
    setConfirmed(false);
  };

  const handleExecute = async () => {
    if (!scriptId) {
      console.error('scriptId is required');
      return;
    }
    try {
      const parameters: Record<string, string> = {};
      params.forEach((p) => {
        if (p.key && p.value) {
          parameters[p.key] = p.value;
        }
      });

      await scriptsApi.execute(scriptId, {
        node_ids: selectedNodes,
        environment,
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      });

      onOpenChange(false);
      setEnvironment('dev');
      setParams([{ key: '', value: '' }]);
      setSelectedNodes([]);
      setConfirmed(false);
    } catch (err) {
      console.error('execute error:', err);
    }
  };

  const isProdEnvironment = environment === 'prod';
  const canExecute = selectedNodes.length > 0 && (!isProdEnvironment || confirmed);

  const getEnvironmentConfig = (env: string) => {
    const configs = {
      dev: {
        label: '开发环境',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700',
      },
      test: {
        label: '测试环境',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-700',
      },
      prod: {
        label: '生产环境',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-700',
      },
    };
    return configs[env as keyof typeof configs];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">执行脚本</DialogTitle>
          <DialogDescription>
            配置执行参数并选择目标节点运行 <span className="font-medium text-gray-900">{scriptName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Environment Selection */}
          <div className="space-y-2">
            <Label htmlFor="environment" className="text-sm font-medium">
              执行环境 *
            </Label>
            <Select value={environment} onValueChange={handleEnvironmentChange}>
              <SelectTrigger id="environment">
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
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${getEnvironmentConfig(environment).color} ${getEnvironmentConfig(environment).textColor}`}>
              {getEnvironmentConfig(environment).label}
            </div>
          </div>

          {/* Node Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              执行节点 * ({selectedNodes.length} 已选择)
            </Label>
            {loadingNodes ? (
              <div className="text-sm text-gray-500 py-2">加载中...</div>
            ) : nodes.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">
                暂无在线节点，请先在节点管理中添加节点
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                      selectedNodes.includes(node.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => toggleNode(node.id)}
                  >
                    <Checkbox checked={selectedNodes.includes(node.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{node.name}</div>
                      <div className="text-xs text-gray-500">{node.ip}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parameters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">脚本参数</Label>
            <div className="space-y-2">
              {params.map((param, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="参数名"
                    value={param.key}
                    onChange={(e) => updateParam(index, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="参数值"
                    value={param.value}
                    onChange={(e) => updateParam(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  {params.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParam(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addParam}
              className="text-gray-600"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加参数
            </Button>
          </div>

          {/* Production Environment Warning */}
          {isProdEnvironment && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">生产环境执行确认</p>
                <p className="text-xs text-red-700 mt-1">
                  您正在生产环境执行脚本，这可能会对生产服务产生影响。请确认您知道此操作的风险。
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <Checkbox
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked === true)}
                  />
                  <span className="text-sm text-red-800">我已知悉风险，确认执行</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleExecute}
            disabled={!canExecute}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            执行
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
