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
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { executionsApi } from '@/app/api/executions';

interface ScriptExecuteDialogProps {
  scriptId?: number;
  scriptName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScriptExecuteDialog({
  scriptId: initialScriptId,
  scriptName: initialScriptName,
  open,
  onOpenChange,
}: ScriptExecuteDialogProps) {
  const [scriptId, setScriptId] = useState<number | undefined>(initialScriptId);
  const [scriptName, setScriptName] = useState(initialScriptName || '');
  const [nodes, setNodes] = useState<{ id: number; name: string }[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [parameters, setParameters] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setScriptId(initialScriptId);
      setScriptName(initialScriptName || '');
      setSelectedNodes([]);
      setParameters('');
      setError('');
      setSuccess('');
      loadNodes();
    }
  }, [open, initialScriptId, initialScriptName]);

  async function loadNodes() {
    try {
      setLoading(true);
      const res = await executionsApi.getNodes();
      setNodes(res.items || []);
    } catch (err: any) {
      console.error('load nodes error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (!scriptId) {
      setError('请选择脚本');
      return;
    }
    if (selectedNodes.length === 0) {
      setError('请选择至少一个执行节点');
      return;
    }

    try {
      setExecuting(true);
      setError('');
      setSuccess('');
      await executionsApi.execute({
        script_id: scriptId,
        node_ids: selectedNodes,
        parameters: parameters.trim() || undefined,
      });
      setSuccess('脚本执行已启动');
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err: any) {
      console.error('execute error:', err);
      setError(err.response?.data?.message || err.message || '执行失败');
    } finally {
      setExecuting(false);
    }
  }

  function toggleNode(nodeId: number) {
    setSelectedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>执行脚本</DialogTitle>
          <DialogDescription>
            选择脚本和执行节点来运行脚本
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="script">脚本</Label>
            <Input
              id="script"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="搜索脚本..."
              disabled={!!initialScriptId}
            />
            {!initialScriptId && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                {loading ? (
                  <div className="p-2 text-sm text-gray-500">加载中...</div>
                ) : (
                  nodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setScriptId(node.id);
                        setScriptName((node as any).name || `脚本 ${node.id}`);
                      }}
                    >
                      {node.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>执行节点</Label>
            <div className="flex flex-wrap gap-2">
              {nodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => toggleNode(node.id)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedNodes.includes(node.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {node.name}
                </button>
              ))}
            </div>
            {selectedNodes.length > 0 && (
              <p className="text-xs text-gray-500">
                已选择 {selectedNodes.length} 个节点
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parameters">参数 (可选)</Label>
            <Input
              id="parameters"
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              placeholder="输入脚本参数，多个参数用空格分隔"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Play className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">成功</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleExecute} disabled={executing}>
            {executing ? '执行中...' : '执行'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
