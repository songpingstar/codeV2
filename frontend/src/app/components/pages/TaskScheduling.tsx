import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, Calendar, Play, Pause, Server, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { hasPermission } from '@/app/utils/permissions';
import { Switch } from '@/app/components/ui/switch';
import { formatDate } from '@/app/utils/datetime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
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
import { TaskDialog } from '@/app/components/dialogs/TaskDialog';
import { tasksApi, Task, TaskStats } from '@/app/api/tasks';

export function TaskScheduling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const tasksRes = await tasksApi.getList({ page: 1, size: 100 });
      const statsRes = await tasksApi.getStats();
      setTasks(tasksRes.items || []);
      setStats(statsRes);
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTaskId) return;
    try {
      await tasksApi.delete(deleteTaskId);
      setDeleteTaskId(null);
      loadData();
    } catch (err: any) {
      console.error("delete error:", err);
      setError(err.response?.data?.message || '删除失败');
    }
  }

  function handleDelete(id: number) {
    setDeleteTaskId(id);
  }

  async function handleToggle(id: number, enabled: boolean) {
    try {
      await tasksApi.toggle(id, enabled);
      loadData();
    } catch (err: any) {
      console.error("toggle error:", err);
      setError(err.response?.data?.message || '切换状态失败');
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.script_name && task.script_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'enabled' && task.enabled) ||
                         (statusFilter === 'disabled' && !task.enabled);
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (enabled: boolean) => {
    if (enabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
          运行中
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
        已暂停
      </span>
    );
  };

  const getLastRunStatusBadge = (status?: string) => {
    if (!status) return null;
    
    if (status === 'success') {
      return (
        <span className="inline-flex items-center text-xs text-green-600">
          <div className="w-1 h-1 rounded-full bg-green-500 mr-1"></div>
          成功
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs text-red-600">
        <div className="w-1 h-1 rounded-full bg-red-500 mr-1"></div>
        失败
      </span>
    );
  };

  const getEnvironmentBadge = (env?: string) => {
    if (!env) return null;
    const configs: Record<string, { label: string; color: string }> = {
      dev: { label: 'Dev', color: 'bg-blue-100 text-blue-700' },
      test: { label: 'Test', color: 'bg-yellow-100 text-yellow-700' },
      prod: { label: 'Prod', color: 'bg-red-100 text-red-700' },
    };
    const config = configs[env];
    if (!config) return null;
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">任务调度</h1>
          <p className="text-sm text-gray-500 mt-1">管理和调度定时执行的运维任务</p>
        </div>
        {hasPermission("task:create") && (
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingTask(null);
            setTaskDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建任务
        </Button>
        )}
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
                placeholder="搜索任务名称、脚本名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="任务状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="enabled">运行中</SelectItem>
                  <SelectItem value="disabled">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总任务数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total ?? 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">运行中</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats?.enabled ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已暂停</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {stats?.disabled ?? 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <Pause className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    任务名称
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    关联脚本
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cron 表达式
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    下次执行时间
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-sm text-gray-500">
                      暂无匹配的任务
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {task.name}
                            </span>
                            {getEnvironmentBadge(task.environment)}
                          </div>
                          {/* Execution Node Info */}
                          <div className="flex items-center gap-2 mt-1">
                            <Server className="w-3 h-3 text-gray-400" />
                            {task.execution_mode === 'all' ? (
                              <span className="text-xs text-gray-500">所有节点</span>
                            ) : task.target_nodes && task.target_nodes.length > 0 ? (
                              <span className="text-xs text-gray-500">
                                已选择 {task.target_nodes.length} 个节点
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">未指定</span>
                            )}
                          </div>
                          {task.last_run_time && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                上次: {formatDate(task.last_run_time)}
                              </span>
                              {getLastRunStatusBadge(task.last_run_status)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{task.script_name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 inline-block">
                            {task.cron_expression}
                          </code>
                          <span className="text-xs text-gray-500 mt-1">
                            {task.cron_description}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {task.next_run_time ? formatDate(task.next_run_time) : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {getStatusBadge(task.enabled)}
                          {hasPermission("task:toggle") && (
                          <Switch
                            checked={task.enabled}
                            onCheckedChange={(checked) => handleToggle(task.id, checked)}
                          />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("task:update") && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setEditingTask(task);
                              setTaskDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          )}
                          {hasPermission("task:delete") && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                显示 {filteredTasks.length} 条记录，共 {tasks.length} 条
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

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        mode={editingTask ? 'edit' : 'create'}
        task={editingTask}
        onSuccess={() => loadData()}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该任务吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete()} className="bg-red-600 hover:bg-red-700 text-white">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}