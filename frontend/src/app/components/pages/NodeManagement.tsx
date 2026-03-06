import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Server, 
  Edit2, 
  PowerOff,
  Power,
  Circle,
  Tag,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
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
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { NodeFormDialog } from '@/app/components/dialogs/NodeFormDialog';
import { nodesApi } from '@/app/api/nodes';
import { agentApi } from '@/app/api/agent';
import { nowBeijing, formatDate } from '@/app/utils/datetime';

interface Node {
  id: number;
  name: string;
  ip: string;
  environment: 'dev' | 'test' | 'prod';
  tags: string[];
  status: 'online' | 'offline';
  last_heartbeat: string;
}

interface NodeStats {
  total: number;
  online: number;
  offline: number;
  online_rate: number;
}

interface NodeFormData {
  name: string;
  ip: string;
  environment: 'dev' | 'test' | 'prod';
  tags: string;
}

interface NodeManagementProps {
  onViewNode?: (nodeId: number) => void;
}

export function NodeManagement({ onViewNode }: NodeManagementProps = {}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [stats, setStats] = useState<NodeStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState<NodeFormData>({
    name: '',
    ip: '',
    environment: 'dev',
    tags: '',
  });
  const [generatedToken, setGeneratedToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const OFFLINE_THRESHOLD_MINUTES = 3;
  
  const isNodeOffline = (heartbeat: string | null): boolean => {
    if (!heartbeat) return true;
    const heartbeatTime = new Date(heartbeat);
    const now = nowBeijing();
    const diffMinutes = (now.getTime() - heartbeatTime.getTime()) / 1000 / 60;
    return diffMinutes > OFFLINE_THRESHOLD_MINUTES;
  };
  
  const getNodeStatus = (status: string, heartbeat: string | null): 'online' | 'offline' => {
    if (status === 'offline') return 'offline';
    if (isNodeOffline(heartbeat)) return 'offline';
    return 'online';
  };

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const [nodesRes, statsRes] = await Promise.all([
        nodesApi.getList({ page: 1, size: 100 }),
        nodesApi.getStats()
      ]);
      setNodes(nodesRes.items || []);
      setStats(statsRes);
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentToken() {
    try {
      const token = await agentApi.getCurrentToken();
      if (token.token) {
        setGeneratedToken(token.token);
      }
    } catch (err: any) {
      console.error("load token error:", err);
    }
  }

  async function handleDeleteNode(id: number) {
    setDeleteConfirmId(id);
  }

  async function handleDeleteConfirm() {
    if (deleteConfirmId === null) return;
    try {
      await nodesApi.delete(deleteConfirmId);
      setDeleteConfirmId(null);
      loadData();
    } catch (err: any) {
      console.error("delete error:", err);
      setError(err.response?.data?.message || '删除失败');
    }
  }

  async function handleToggleStatus(id: number, currentStatus: 'online' | 'offline') {
    try {
      await nodesApi.update(id, { status: currentStatus === 'online' ? 'offline' : 'online' });
      loadData();
    } catch (err: any) {
      console.error("toggle status error:", err);
      setError(err.response?.data?.message || '切换状态失败');
    }
  }

  async function handleGenerateToken() {
    try {
      const token = await agentApi.generateToken();
      setGeneratedToken(token.token);
    } catch (err: any) {
      console.error("generate token error:", err);
      setError(err.response?.data?.message || '生成Token失败');
    }
  }

  async function handleSubmitAdd() {
    try {
      await nodesApi.create({
        name: formData.name,
        ip: formData.ip,
        environment: formData.environment,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setIsAddDialogOpen(false);
      loadData();
    } catch (err: any) {
      console.error("create error:", err);
      setError(err.response?.data?.message || '创建失败');
    }
  }

  async function handleSubmitEdit() {
    if (!selectedNode) return;
    try {
      await nodesApi.update(selectedNode.id, {
        name: formData.name,
        ip: formData.ip,
        environment: formData.environment,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      });
      setIsEditDialogOpen(false);
      loadData();
    } catch (err: any) {
      console.error("update error:", err);
      setError(err.response?.data?.message || '更新失败');
    }
  }

  useEffect(() => {
    loadData();
    loadCurrentToken();
    
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredNodes = nodes.filter((node) => {
    const effectiveStatus = getNodeStatus(node.status, node.last_heartbeat);
    const matchesSearch = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.ip.includes(searchTerm);
    const matchesEnvironment = environmentFilter === 'all' || node.environment === environmentFilter;
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
    return matchesSearch && matchesEnvironment && matchesStatus;
  });

  const onlineCount = stats?.online ?? 0;
  const offlineCount = stats?.offline ?? 0;

  const getEnvironmentBadge = (env: string) => {
    const envConfig = {
      dev: { text: 'DEV', className: 'bg-blue-100 text-blue-700' },
      test: { text: 'TEST', className: 'bg-yellow-100 text-yellow-700' },
      prod: { text: 'PROD', className: 'bg-red-100 text-red-700' },
    };

    const config = envConfig[env as keyof typeof envConfig];

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <Circle className="w-2 h-2 mr-1.5 fill-green-600" />
          在线
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <Circle className="w-2 h-2 mr-1.5 fill-gray-400" />
        离线
      </span>
    );
  };

  const handleAddNode = () => {
    setFormData({
      name: '',
      ip: '',
      environment: 'dev',
      tags: '',
    });
    setIsAddDialogOpen(true);
  };

  const handleEditNode = (node: Node) => {
    setSelectedNode(node);
    setFormData({
      name: node.name,
      ip: node.ip,
      environment: node.environment,
      tags: node.tags.join(','),
    });
    setIsEditDialogOpen(true);
  };
  
  const getHeartbeatStatus = (heartbeat: string, status: string) => {
    if (status === 'offline') {
      return <span className="text-gray-400 text-xs">离线</span>;
    }
    
    if (!heartbeat) {
      return <span className="text-gray-400 text-xs">无心跳</span>;
    }
    
    const heartbeatTime = new Date(heartbeat);
    const now = nowBeijing();
    const diffSeconds = Math.floor((now.getTime() - heartbeatTime.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return <span className="text-green-600 text-xs">刚刚</span>;
    } else if (diffSeconds < 3600) {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return <span className="text-green-600 text-xs">{diffMinutes}分钟前</span>;
    } else if (diffSeconds < 86400) {
      const diffHours = Math.floor(diffSeconds / 3600);
      return <span className="text-yellow-600 text-xs">{diffHours}小时前</span>;
    } else {
      const diffDays = Math.floor(diffSeconds / 86400);
      return <span className="text-red-600 text-xs">{diffDays}天前</span>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">节点管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理和监控脚本执行节点</p>
        </div>
        <Button onClick={handleAddNode} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新增节点
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总节点数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">在线</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{onlineCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">离线</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{offlineCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">在线率</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {stats?.online_rate ?? 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Circle className="w-6 h-6 text-blue-600" />
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
                placeholder="搜索节点名称、IP地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Environment Filter */}
            <div className="w-full lg:w-48">
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="所属环境" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部环境</SelectItem>
                  <SelectItem value="dev">开发环境</SelectItem>
                  <SelectItem value="test">测试环境</SelectItem>
                  <SelectItem value="prod">生产环境</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="节点状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="online">在线</SelectItem>
                  <SelectItem value="offline">离线</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nodes Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    节点名称
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 地址
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    所属环境
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    节点标签
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最近心跳
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sm text-gray-500">
                      暂无节点数据
                    </td>
                  </tr>
                ) : (
                  filteredNodes.map((node) => {
                    const effectiveStatus = getNodeStatus(node.status, node.last_heartbeat);
                    return (
                    <tr
                      key={node.id}
                      className={`border-b border-gray-100 transition-colors ${
                        effectiveStatus === 'offline' 
                          ? 'bg-gray-50/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Server className={`w-4 h-4 ${effectiveStatus === 'offline' ? 'text-gray-400' : 'text-blue-600'}`} />
                          <span className={`text-sm font-medium ${effectiveStatus === 'offline' ? 'text-gray-400' : 'text-gray-900'}`}>
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${effectiveStatus === 'offline' ? 'text-gray-300' : 'text-gray-400'}`} />
                          <code className={`text-xs font-mono ${effectiveStatus === 'offline' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {node.ip}
                          </code>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getEnvironmentBadge(node.environment)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {node.tags.length > 0 ? (
                            node.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                  effectiveStatus === 'offline'
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                          {node.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{node.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(effectiveStatus)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${effectiveStatus === 'offline' ? 'text-gray-300' : 'text-gray-400'}`} />
                          {getHeartbeatStatus(node.last_heartbeat, effectiveStatus)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNode(node)}
                            className="h-8 px-3 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(node.id, effectiveStatus)}
                            className={`h-8 px-3 ${
                              effectiveStatus === 'online'
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {effectiveStatus === 'online' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNode(node.id)}
                            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {filteredNodes.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                显示 {filteredNodes.length} 个节点，共 {nodes.length} 个
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  上一页
                </Button>
                <Button variant="outline" size="sm" disabled>
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Node Dialog */}
      <NodeFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onGenerateToken={handleGenerateToken}
        generatedToken={generatedToken}
        mode="add"
      />

      {/* Edit Node Dialog */}
      <NodeFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleSubmitEdit}
        formData={formData}
        setFormData={setFormData}
        mode="edit"
      />

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该节点吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}