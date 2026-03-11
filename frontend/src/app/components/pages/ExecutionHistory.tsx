import { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { executionsApi } from '@/app/api/executions';
import { formatDate } from '@/app/utils/datetime';

interface ExecutionRecord {
  id: string;
  execution_id: string;
  execution_time: string;
  script_name: string;
  script_id: number;
  executor: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'cancelled';
  duration: number;
  environment: 'dev' | 'test' | 'prod';
  node_count: number;
}

interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  success_rate: number;
}

interface ExecutionHistoryProps {
  onViewLog?: (record: ExecutionRecord) => void;
}

export function ExecutionHistory({ onViewLog }: ExecutionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      
      const recordsRes = await executionsApi.getList({ 
        page, 
        size: 8,
        keyword: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        environment: environmentFilter !== 'all' ? environmentFilter : undefined
      });
      
      const statsRes = await executionsApi.getStats();
      
      const items = (recordsRes.items || []).map((item: any) => ({
        ...item,
        id: item.execution_id,
        execution_time: item.started_at
      }));
      setRecords(items);
      setStats(statsRes);
      setTotal(recordsRes.total || 0);
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page, searchTerm, statusFilter, environmentFilter]);

  useEffect(() => {
    const hasRunningTasks = records.some(r => r.status === 'running');
    
    if (hasRunningTasks) {
      const interval = setInterval(() => {
        loadData();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [records]);

  const filteredRecords = records;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: {
        icon: CheckCircle,
        text: '成功',
        className: 'bg-green-50 text-green-700 border-green-200',
      },
      failed: {
        icon: XCircle,
        text: '失败',
        className: 'bg-red-50 text-red-700 border-red-200',
      },
      running: {
        icon: Clock,
        text: '运行中',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        animated: true,
      },
      pending: {
        icon: Clock,
        text: '运行中',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        animated: true,
      },
      cancelled: {
        icon: XCircle,
        text: '已取消',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      icon: Clock,
      text: status || '未知',
      className: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    const Icon = config.icon;
    const isAnimated = (config as any).animated;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${config.className} ${isAnimated ? 'animate-pulse' : ''}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {config.text}
      </span>
    );
  };

  const getEnvironmentBadge = (env: string) => {
    const envConfig = {
      dev: { text: 'DEV', className: 'bg-blue-100 text-blue-700' },
      test: { text: 'TEST', className: 'bg-yellow-100 text-yellow-700' },
      prod: { text: 'PROD', className: 'bg-red-100 text-red-700' },
    };

    const config = envConfig[env as keyof typeof envConfig] || {
      text: env?.toUpperCase() || 'UNKNOWN',
      className: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds < 60) {
      return `${seconds || 0}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">加载中...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {/* Statistics */}
      {!loading && !error && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行记录</h1>
          <p className="text-sm text-gray-500 mt-1">查看和分析脚本执行历史记录</p>
        </div>
      )}
      
      {/* Statistics */}
      {!loading && !error && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总执行次数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">成功</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats?.success ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">失败</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats?.failed ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">成功率</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.success_rate ?? 0}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filters */}
      {!loading && !error && (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索脚本名称、执行人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="执行状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                  <SelectItem value="running">执行中</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Environment Filter */}
            <div className="w-full lg:w-48">
              <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="执行环境" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部环境</SelectItem>
                  <SelectItem value="dev">开发环境</SelectItem>
                  <SelectItem value="test">测试环境</SelectItem>
                  <SelectItem value="prod">生产环境</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Records Table */}
      {!loading && !error && (
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    执行时间
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    脚本名称
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    执行人
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    环境
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    耗时
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sm text-gray-500">
                      暂无执行记录
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr 
                      key={record.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDate(record.execution_time)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {record.script_name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            执行节点: {record.node_count} 个
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{record.executor}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getEnvironmentBadge(record.environment)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDuration(record.duration)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewLog?.(record)}
                          >
                            查看日志
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 8 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                共 {total} 条记录，第 {page} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 8 >= total}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}
