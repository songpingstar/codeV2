import { useState, useEffect } from "react"
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  Server,
  FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { dashboardApi } from '@/app/api/dashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  color: string;
}

function StatCard({ title, value, change, icon: Icon, trend, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend && <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ExecutionRecord {
  id: string;
  scriptName: string;
  status: 'success' | 'failed' | 'running';
  node: string;
  startTime: string;
  duration: string;
}

function getStatusBadge(status: string) {
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  
  const labels = {
    success: '成功',
    failed: '失败',
    running: '运行中',
  };

  const icons = {
    success: CheckCircle2,
    failed: XCircle,
    running: Clock,
  };

  const Icon = icons[status as keyof typeof icons];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      <Icon className="w-3 h-3" />
      {labels[status as keyof typeof labels]}
    </span>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [scriptDistribution, setScriptDistribution] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [recentExecutions, setRecentExecutions] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [statsRes, scriptDistRes, taskStatsRes, executionsRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getScriptDistribution(),
        dashboardApi.getTaskStats(),
        dashboardApi.getRecentExecutions(5)
      ]);
      setStats(statsRes);
      setScriptDistribution(scriptDistRes);
      setTaskStats(taskStatsRes);
      setRecentExecutions(executionsRes || []);
    } catch (err) {
      console.error("load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-sm text-gray-500 mt-1">系统运行状态总览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="今日执行任务"
          value={stats?.today_executions ?? 0}
          change="+12% 较昨日"
          icon={Activity}
          trend="up"
          color="bg-blue-600"
        />
        <StatCard
          title="成功率"
          value={`${(stats?.success_rate ?? 0).toFixed(1)}%`}
          change="+2.1% 较昨日"
          icon={CheckCircle2}
          trend="up"
          color="bg-green-600"
        />
        <StatCard
          title="在线节点"
          value={`${stats?.online_nodes ?? 0}/${stats?.total_nodes ?? 0}`}
          icon={Server}
          color="bg-orange-600"
        />
        
        {/* 脚本类型分布 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">脚本类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Python</span>
                <span className="text-sm font-bold text-gray-900">{scriptDistribution?.python ?? 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(scriptDistribution?.python ?? 0) / (scriptDistribution?.python ?? 0 + scriptDistribution?.shell ?? 1) * 100}%` }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Shell</span>
                <span className="text-sm font-bold text-gray-900">{scriptDistribution?.shell ?? 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(scriptDistribution?.shell ?? 0) / (scriptDistribution?.python ?? 0 + scriptDistribution?.shell ?? 1) * 100}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 调度任务统计 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">调度任务统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">定时任务</span>
                <span className="text-lg font-bold text-gray-900">{taskStats?.scheduled ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">触发式</span>
                <span className="text-lg font-bold text-gray-900">{taskStats?.triggered ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">手动</span>
                <span className="text-lg font-bold text-gray-900">{taskStats?.manual ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>最近执行记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">脚本名称</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">执行节点</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">开始时间</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExecutions.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{record.scriptName}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.node}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.startTime}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      {/* 已移至顶部统计区域 */}
    </div>
  );
}
