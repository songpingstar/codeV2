import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Server, 
  MapPin, 
  Tag,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Circle,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { nodesApi } from '@/app/api/nodes';

interface NodeDetailProps {
  nodeId: number;
  onBack: () => void;
}

interface NodeData {
  id: number;
  name: string;
  ip: string;
  environment: 'dev' | 'test' | 'prod';
  tags: string[];
  status: 'online' | 'offline';
  last_heartbeat: string;
  agent_version: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  uptime?: string;
  os_info?: string;
  cpu_cores?: number;
  total_memory?: string;
  total_disk?: string;
}

export function NodeDetail({ nodeId, onBack }: NodeDetailProps) {
  const [node, setNode] = useState<NodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const data = await nodesApi.getDetail(nodeId);
      setNode(data);
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载节点详情失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    if (!node) return;
    try {
      const newStatus = node.status === 'online' ? 'offline' : 'online';
      await nodesApi.update(node.id, { status: newStatus });
      loadData();
    } catch (err: any) {
      console.error("toggle status error:", err);
      setError(err.response?.data?.message || '切换状态失败');
    }
  }

  async function handleDelete() {
    if (!node) return;
    try {
      await nodesApi.delete(node.id);
      onBack();
    } catch (err: any) {
      console.error("delete error:", err);
      setError(err.response?.data?.message || '删除失败');
    }
  }

  useEffect(() => {
    loadData();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回节点列表
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              加载中...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回节点列表
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回节点列表
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              节点不存在
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEnvironmentBadge = (env: string) => {
    const envConfig = {
      dev: { text: 'DEV', className: 'bg-blue-100 text-blue-700' },
      test: { text: 'TEST', className: 'bg-yellow-100 text-yellow-700' },
      prod: { text: 'PROD', className: 'bg-red-100 text-red-700' },
    };

    const config = envConfig[env as keyof typeof envConfig];

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
            <Wifi className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700">在线</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
          <WifiOff className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-600">离线</span>
        </div>
      </div>
    );
  };

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    handleDelete();
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="h-10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="h-8 w-px bg-gray-200"></div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{node.name}</h1>
              {getStatusBadge(node.status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">节点详细信息</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {hasPermission("node:delete") && (
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            删除节点
          </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                基础信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">节点名称</p>
                  <p className="text-sm font-medium text-gray-900">{node.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">IP 地址</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <code className="text-sm font-mono text-gray-900">{node.ip}</code>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">所属环境</p>
                  <div>{getEnvironmentBadge(node.environment)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Agent 版本</p>
                  <code className="text-sm font-mono text-gray-900">{node.agent_version || '-'}</code>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500">节点标签</p>
                  <div className="flex flex-wrap gap-2">
                    {node.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                系统信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">操作系统</p>
                  <p className="text-sm font-medium text-gray-900">{node.os_info || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">运行时长</p>
                  <p className="text-sm font-medium text-gray-900">{node.uptime || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">CPU 核心数</p>
                  <p className="text-sm font-medium text-gray-900">{node.cpu_cores || '-'} 核</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">总内存</p>
                  <p className="text-sm font-medium text-gray-900">{node.total_memory || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">总磁盘空间</p>
                  <p className="text-sm font-medium text-gray-900">{node.total_disk || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">网络吞吐</p>
                  <p className="text-sm font-medium text-gray-900">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          {node.status === 'online' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  资源使用情况
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* CPU */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">CPU 使用率</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {node.cpu_usage != null ? `${node.cpu_usage.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                        style={{ width: node.cpu_usage != null ? `${node.cpu_usage}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">内存使用率</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {node.memory_usage != null ? `${node.memory_usage.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                        style={{ width: node.memory_usage != null ? `${node.memory_usage}%` : '0%' }}
                      />
                    </div>
                  </div>

                  {/* Disk */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-700">磁盘使用率</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {node.disk_usage != null ? `${node.disk_usage.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all"
                        style={{ width: node.disk_usage != null ? `${node.disk_usage}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                状态信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-gray-500">当前状态</p>
                {node.status === 'online' ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">运行正常</p>
                      <p className="text-xs text-green-600">节点在线并正常工作</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900">节点离线</p>
                      <p className="text-xs text-red-600">无法连接到节点</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">最近心跳时间</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {node.last_heartbeat}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {node.status === 'online' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">快速统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-xs text-blue-700">CPU</span>
                  <span className="text-sm font-bold text-blue-900">
                    {node.cpu_usage != null ? `${node.cpu_usage.toFixed(1)}%` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-xs text-green-700">内存</span>
                  <span className="text-sm font-bold text-green-900">
                    {node.memory_usage != null ? `${node.memory_usage.toFixed(1)}%` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-xs text-yellow-700">磁盘</span>
                  <span className="text-sm font-bold text-yellow-900">
                    {node.disk_usage != null ? `${node.disk_usage.toFixed(1)}%` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-xs text-purple-700">网络</span>
                  <span className="text-sm font-bold text-purple-900">-</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning Card for Offline */}
          {node.status === 'offline' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">节点离线警告</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      该节点当前处于离线状态，无法获取实时监控数据。请检查节点连接或 Agent 服务状态。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              删除节点
            </DialogTitle>
            <DialogDescription>
              确认要删除节点 <span className="font-semibold text-gray-900">{node.name}</span> 吗？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">高风险操作警告</p>
                <ul className="text-xs text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>删除操作不可恢复</li>
                  <li>与该节点相关的所有配置将被清除</li>
                  <li>正在执行的任务将被强制终止</li>
                  <li>历史执行记录将被保留但无法再关联到此节点</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              请确认您了解删除的后果。如果只是临时不使用，建议使用"禁用"功能。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}