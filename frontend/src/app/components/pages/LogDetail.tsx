import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Copy, Check, Server, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { copyToClipboard } from '@/app/utils/clipboard';
import { executionsApi } from '@/app/api/executions';
import { formatDate } from '@/app/utils/datetime';

interface LogDetailProps {
  recordId: string;
  onBack?: () => void;
}

interface ExecutionDetail {
  id: string;
  execution_id: string;
  script_name: string;
  script_id: number;
  executor: string;
  execution_time: string;
  completion_time?: string;
  duration: number;
  status: 'success' | 'failed' | 'running';
  environment: 'dev' | 'test' | 'prod';
  nodes: Array<{
    id: number;
    name: string;
    ip: string;
  }>;
  node_executions?: Array<{
    id: number;
    node_id: number;
    node_name: string;
    ip?: string;
    status: string;
  }>;
  parameters?: Array<{
    key: string;
    value: string;
  }>;
}

export function LogDetail({ recordId, onBack }: LogDetailProps) {
  const [execution, setExecution] = useState<ExecutionDetail | null>(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError('');
      const detailRes = await executionsApi.getDetail(recordId);
      
      const nodes = (detailRes.node_executions || []).map((ne: any) => ({
        id: ne.node_id,
        name: ne.node_name,
        ip: ''
      }));
      
      const transformedExecution = {
        ...detailRes,
        id: detailRes.execution_id,
        execution_time: detailRes.started_at,
        completion_time: detailRes.completed_at,
        nodes: nodes
      };
      
      setExecution(transformedExecution);
      
      if (nodes.length > 0) {
        const firstNode = nodes[0];
        setSelectedNodeId(firstNode.id);
        const logsRes = await executionsApi.getLogs(recordId, firstNode.id);
        setLogs(logsRes.log_content || '');
      }
    } catch (err: any) {
      console.error("load error:", err);
      setError(err.response?.data?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadNodeLogs(nodeId: number) {
    try {
      setSelectedNodeId(nodeId);
      const logsRes = await executionsApi.getLogs(recordId, nodeId);
      setLogs(logsRes.log_content || '');
    } catch (err: any) {
      console.error("load logs error:", err);
      setError(err.response?.data?.message || '加载日志失败');
    }
  }

  async function handleDownloadLogs() {
    if (!selectedNodeId) return;
    try {
      const blob = await executionsApi.downloadLogs(recordId, selectedNodeId, 'txt');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution-log-${recordId}-node-${selectedNodeId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("download error:", err);
      setError(err.response?.data?.message || '下载失败');
    }
  }

  useEffect(() => {
    loadData();
  }, [recordId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const handleCopyLogs = async () => {
    const success = await copyToClipboard(logs);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!execution) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">未找到执行记录</div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (execution.status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (execution.status === 'success') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-4 h-4 mr-1.5" />
          执行成功
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-4 h-4 mr-1.5" />
        执行失败
      </span>
    );
  };

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
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {execution.script_name}
              {getStatusIcon()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">执行记录详情</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLogs}
            className="h-9"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制日志
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadLogs}
            className="h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            下载日志
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Execution Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">执行状态</span>
                  {getStatusBadge()}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">执行环境</span>
                  {getEnvironmentBadge(execution.environment)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">执行人</p>
                    <p className="text-sm text-gray-900 mt-0.5">{execution.executor}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">开始时间</p>
                    <p className="text-sm text-gray-900 mt-0.5">{formatDate(execution.execution_time)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">结束时间</p>
                    <p className="text-sm text-gray-900 mt-0.5">{execution.completion_time ? formatDate(execution.completion_time) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">执行耗时</p>
                    <p className="text-sm text-gray-900 mt-0.5 font-medium">
                      {formatDuration(execution.duration)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution Nodes */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-4 h-4" />
                执行节点
              </h3>
              <div className="space-y-2">
                {execution.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-colors ${
                      selectedNodeId === node.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}
                    onClick={() => handleLoadNodeLogs(node.id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{node.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{node.ip}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  共 <span className="font-medium text-gray-900">{execution.nodes.length}</span> 个节点
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Parameters */}
          {execution.parameters && execution.parameters.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">执行参数</h3>
                <div className="space-y-2">
                  {execution.parameters.map((param, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <code className="text-xs font-mono text-gray-600">{param.key}</code>
                      <code className="text-xs font-mono text-gray-900 font-medium">
                        {param.value}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Log Output */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="pt-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">执行日志</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>

              {/* Terminal-style log viewer */}
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-auto" style={{ maxHeight: '70vh' }}>
                <pre className="text-gray-100 whitespace-pre-wrap leading-relaxed">
                  {logs.split('\n').map((line, index) => {
                    let lineClass = 'text-gray-100';
                    
                    if (line.includes('ERROR')) {
                      lineClass = 'text-red-400';
                    } else if (line.includes('WARNING')) {
                      lineClass = 'text-yellow-400';
                    } else if (line.includes('SUCCESS')) {
                      lineClass = 'text-green-400';
                    } else if (line.includes('INFO:')) {
                      lineClass = 'text-blue-300';
                    }

                    return (
                      <div key={index} className={lineClass}>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              </div>

              {/* Log Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-xs text-gray-500">
                  <span>总行数: {logs.split('\n').length}</span>
                  <span>文件大小: {(logs.length / 1024).toFixed(2)} KB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}