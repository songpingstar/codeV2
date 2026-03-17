import { useState, useEffect } from "react"
import { 
  RefreshCw, 
  Play, 
  CheckCircle,
  CheckCircle2,
  XCircle, 
  Clock, 
  AlertCircle,
  Activity,
  Server,
  TrendingUp,
  FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { dashboardApi } from '@/app/api/dashboard';
import { formatDate } from '@/app/utils/datetime';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {change !== undefined && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
            <span>{change >= 0 ? '+' : ''}{change}% 较昨日</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ExecutionRecord {
  id: string;
  script_name: string;
  status: string;
  node: string;
  start_time: string;
  duration: string;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    success: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    running: 'bg-blue-100 text-blue-700 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };
  
  const labels: Record<string, string> = {
    success: '成功',
    failed: '失败',
    running: '运行中',
    pending: '等待中',
  };

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    success: CheckCircle2,
    failed: XCircle,
    running: Clock,
    pending: Clock,
  };

  const Icon = icons[status] || Clock;
  const style = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  const label = labels[status] || status;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${style}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

const COLORS = {
  python: '#3b82f6',
  shell: '#22c55e',
  go: '#06b6d4',
};

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

  const pieData = [
    { name: 'Python', value: scriptDistribution?.python ?? 0 },
    { name: 'Shell', value: scriptDistribution?.shell ?? 0 },
    { name: 'Go', value: scriptDistribution?.go ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">仪表盘</h1>
        <p className="text-sm text-gray-500 mt-1">系统运行状态总览</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="今日执行任务"
              value={stats?.today_executions ?? 0}
              change={stats?.executions_change}
              icon={Activity}
              color="bg-blue-500"
            />
            <StatCard
              title="今日执行成功率"
              value={`${(stats?.today_success_rate ?? 0).toFixed(1)}%`}
              change={stats?.success_rate_change}
              icon={CheckCircle2}
              color="bg-green-500"
            />
            <StatCard
              title="在线节点"
              value={`${stats?.online_nodes ?? 0} / ${stats?.total_nodes ?? 0}`}
              icon={Server}
              color="bg-orange-500"
            />
            <StatCard
              title="脚本总数"
              value={(scriptDistribution?.python ?? 0) + (scriptDistribution?.shell ?? 0)}
              icon={FileCode}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-medium text-gray-700">脚本类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                {((scriptDistribution?.python ?? 0) + (scriptDistribution?.shell ?? 0)) > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.python : index === 1 ? COLORS.shell : COLORS.go} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} 个`, '数量']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <Legend 
                        verticalAlign="middle" 
                        align="right"
                        layout="vertical"
                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                    暂无脚本数据
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base font-medium text-gray-700">调度任务统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-semibold text-blue-600">{taskStats?.scheduled ?? 0}</div>
                    <div className="text-sm text-gray-600 mt-1">定时任务</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-semibold text-green-600">{taskStats?.manual ?? 0}</div>
                    <div className="text-sm text-gray-600 mt-1">手动</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-600">{taskStats?.triggered ?? 0}</div>
                    <div className="text-sm text-gray-600 mt-1">触发式</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-700">最近执行记录</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">脚本名称</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">执行节点</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExecutions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-sm text-gray-500">
                          暂无执行记录
                        </td>
                      </tr>
                    ) : (
                      recentExecutions.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">{record.script_name}</td>
                          <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{record.node}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{formatDate(record.start_time)}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{record.duration}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
