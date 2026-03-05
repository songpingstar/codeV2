import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Server, 
  Edit2, 
  Eye, 
  PowerOff,
  Power,
  Circle,
  Tag,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle,
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
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { NodeFormDialog } from '@/app/components/dialogs/NodeFormDialog';
import { nodesApi } from '@/app/api/nodes';

interface Node {
  id: number;
  name: string;
  ip: string;
  environment: 'dev' | 'test' | 'prod';
  tags: string[];
  status: 'online' | 'offline';
  last_heartbeat: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState<NodeFormData>({
    name: '',
    ip: '',
    environment: 'dev',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  async function handleDeleteNode(id: number) {
    if (!confirm("确认删除该节点吗？")) return;
    try {
      await nodesApi.delete(id);
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
  }, []);

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.ip.includes(searchTerm);
    const matchesEnvironment = environmentFilter === 'all' || node.environment === environmentFilter;
    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
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

  const handleViewNode = (node: Node) => {
    setSelectedNode(node);
    setIsViewDialogOpen(true);
    if (onViewNode) {
      onViewNode(node.id);
    }
  };

  const getHeartbeatStatus = (heartbeat: string, status: string) => {
    if (status === 'offline') {
      return <span className="text-gray-400 text-xs">离线</span>;
    }
    
    const heartbeatTime = new Date(heartbeat);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - heartbeatTime.getTime()) / 1000 / 60);
    
    if (diffMinutes < 1) {
      return <span className="text-green-600 text-xs">刚刚</span>;
    } else if (diffMinutes < 60) {
      return <span className="text-green-600 text-xs">{diffMinutes}分钟前</span>;
    } else {
      return <span className="text-yellow-600 text-xs">{Math.floor(diffMinutes / 60)}小时前</span>;
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
                  filteredNodes.map((node) => (
                    <tr
                      key={node.id}
                      className={`border-b border-gray-100 transition-colors ${
                        node.status === 'offline' 
                          ? 'bg-gray-50/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Server className={`w-4 h-4 ${node.status === 'offline' ? 'text-gray-400' : 'text-blue-600'}`} />
                          <span className={`text-sm font-medium ${node.status === 'offline' ? 'text-gray-400' : 'text-gray-900'}`}>
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${node.status === 'offline' ? 'text-gray-300' : 'text-gray-400'}`} />
                          <code className={`text-xs font-mono ${node.status === 'offline' ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                  node.status === 'offline'
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
                        {getStatusBadge(node.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${node.status === 'offline' ? 'text-gray-300' : 'text-gray-400'}`} />
                          <div className="flex flex-col">
                            <span className={`text-xs ${node.status === 'offline' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {node.last_heartbeat}
                            </span>
                            {getHeartbeatStatus(node.last_heartbeat, node.status)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewNode(node)}
                            className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
                            onClick={() => handleToggleStatus(node.id, node.status)}
                            className={`h-8 px-3 ${
                              node.status === 'online'
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {node.status === 'online' ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        onSubmit={handleSubmitAdd}
        formData={formData}
        setFormData={setFormData}
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

      {/* View Node Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              {selectedNode?.name}
            </DialogTitle>
            <DialogDescription>
              节点详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">IP 地址</p>
                  <code className="text-sm font-mono text-gray-900">{selectedNode.ip}</code>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">所属环境</p>
                  <div>{getEnvironmentBadge(selectedNode.environment)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">当前状态</p>
                  <div>{getStatusBadge(selectedNode.status)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">最近心跳</p>
                  <p className="text-sm text-gray-900">{selectedNode.lastHeartbeat}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-2">节点标签</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.tags.length > 0 ? (
                    selectedNode.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">暂无标签</span>
                  )}
                </div>
              </div>

              {selectedNode.status === 'online' && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-3">系统资源</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">CPU 使用率</span>
                        <span className="font-medium text-gray-900">{selectedNode.cpu}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: selectedNode.cpu }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">内存使用率</span>
                        <span className="font-medium text-gray-900">{selectedNode.memory}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: selectedNode.memory }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">磁盘使用率</span>
                        <span className="font-medium text-gray-900">{selectedNode.disk}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: selectedNode.disk }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}