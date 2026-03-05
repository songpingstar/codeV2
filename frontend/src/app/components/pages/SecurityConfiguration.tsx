import { useState } from 'react';
import {
  Shield,
  Key,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Info,
  UserCheck,
  FileKey,
  Settings,
  Globe,
  Zap,
  Clock,
  Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
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

interface Secret {
  id: string;
  name: string;
  description: string;
  type: 'password' | 'api_key' | 'token' | 'certificate';
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

const mockSecrets: Secret[] = [
  {
    id: 'secret_1',
    name: 'DATABASE_PASSWORD',
    description: '生产数据库连接密码',
    type: 'password',
    createdBy: 'admin',
    createdAt: '2025-12-01 10:00:00',
    lastUsed: '2026-01-30 09:30:00',
    usageCount: 245,
  },
  {
    id: 'secret_2',
    name: 'AWS_ACCESS_KEY',
    description: 'AWS API 访问密钥',
    type: 'api_key',
    createdBy: 'admin',
    createdAt: '2025-12-15 14:20:00',
    lastUsed: '2026-01-29 16:45:00',
    usageCount: 128,
  },
  {
    id: 'secret_3',
    name: 'GITLAB_TOKEN',
    description: 'GitLab Personal Access Token',
    type: 'token',
    createdBy: 'ops_user',
    createdAt: '2026-01-10 11:30:00',
    lastUsed: '2026-01-30 08:15:00',
    usageCount: 56,
  },
];

export function SecurityConfiguration() {
  const [secrets, setSecrets] = useState<Secret[]>(mockSecrets);
  const [isAddSecretDialogOpen, setIsAddSecretDialogOpen] = useState(false);
  const [isDeleteSecretDialogOpen, setIsDeleteSecretDialogOpen] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [showSecretValue, setShowSecretValue] = useState<{ [key: string]: boolean }>({});

  // Security settings
  const [confirmHighRisk, setConfirmHighRisk] = useState(true);
  const [confirmProdExecution, setConfirmProdExecution] = useState(true);
  const [confirmSecretAccess, setConfirmSecretAccess] = useState(true);
  const [confirmNodeDelete, setConfirmNodeDelete] = useState(true);

  // Permission settings
  const [scriptExecutionPolicy, setScriptExecutionPolicy] = useState('role_based');
  const [secretAccessPolicy, setSecretAccessPolicy] = useState('admin_only');
  const [prodEnvironmentPolicy, setProdEnvironmentPolicy] = useState('restricted');

  const [secretFormData, setSecretFormData] = useState({
    name: '',
    description: '',
    type: 'password' as 'password' | 'api_key' | 'token' | 'certificate',
    value: '',
  });

  const getSecretTypeIcon = (type: string) => {
    switch (type) {
      case 'password':
        return Lock;
      case 'api_key':
        return Key;
      case 'token':
        return FileKey;
      case 'certificate':
        return Shield;
      default:
        return Key;
    }
  };

  const getSecretTypeName = (type: string) => {
    switch (type) {
      case 'password':
        return '密码';
      case 'api_key':
        return 'API 密钥';
      case 'token':
        return '令牌';
      case 'certificate':
        return '证书';
      default:
        return type;
    }
  };

  const handleAddSecret = () => {
    setSecretFormData({
      name: '',
      description: '',
      type: 'password',
      value: '',
    });
    setIsAddSecretDialogOpen(true);
  };

  const handleDeleteSecret = (secret: Secret) => {
    setSelectedSecret(secret);
    setIsDeleteSecretDialogOpen(true);
  };

  const handleSubmitAddSecret = () => {
    const newSecret: Secret = {
      id: `secret_${Date.now()}`,
      name: secretFormData.name,
      description: secretFormData.description,
      type: secretFormData.type,
      createdBy: 'current_user',
      createdAt: new Date().toLocaleString('zh-CN'),
      usageCount: 0,
    };
    setSecrets([...secrets, newSecret]);
    setIsAddSecretDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedSecret) return;
    setSecrets(secrets.filter((s) => s.id !== selectedSecret.id));
    setIsDeleteSecretDialogOpen(false);
  };

  const toggleSecretVisibility = (secretId: string) => {
    setShowSecretValue({
      ...showSecretValue,
      [secretId]: !showSecretValue[secretId],
    });
  };

  const copyToClipboard = (secretId: string) => {
    // Simulate copy
    console.log('Copied secret:', secretId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">安全设置</h1>
          <p className="text-sm text-gray-500 mt-1">配置系统安全策略和敏感信息管理</p>
        </div>
      </div>

      {/* Security Alert Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">安全配置重要提示</p>
              <ul className="text-xs text-red-700 mt-2 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>所有密钥和敏感信息均采用 AES-256 加密存储，仅在脚本执行时临时解密注入</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>密钥访问和使用将被完整记录到审计日志，支持事后追溯</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>建议启用所有高风险操作的二次确认，防止误操作导致严重后果</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>生产环境操作权限应严格控制，只授予必要人员</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">密钥总数</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{secrets.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日使用次数</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">89</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">安全策略</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {[confirmHighRisk, confirmProdExecution, confirmSecretAccess, confirmNodeDelete].filter(Boolean).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">权限策略</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secret Management */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                密钥与 Secret 管理
              </CardTitle>
              <CardDescription className="mt-1.5">
                集中管理脚本执行所需的敏感信息，支持加密存储和安全注入
              </CardDescription>
            </div>
            <Button onClick={handleAddSecret} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              新增密钥
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Usage Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">密钥使用说明</p>
                <div className="text-xs text-blue-700 space-y-2">
                  <p className="font-medium">在脚本中使用密钥：</p>
                  <pre className="bg-blue-100 p-3 rounded font-mono overflow-x-auto">
{`#!/bin/bash
# 使用环境变量方式注入密钥
echo "连接数据库..."
mysql -h 192.168.1.100 -u root -p\${DATABASE_PASSWORD}

# 使用 API 密钥
curl -H "Authorization: Bearer \${GITLAB_TOKEN}" \\
  https://gitlab.com/api/v4/projects`}
                  </pre>
                  <p className="flex items-start gap-2 mt-3">
                    <span className="text-blue-600">✓</span>
                    <span>
                      系统会在脚本执行时自动将密钥以环境变量形式注入，脚本执行完成后立即清除
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>密钥值不会出现在执行日志中，所有 <code className="bg-blue-200 px-1 rounded">$&#123;SECRET_NAME&#125;</code> 会被自动脱敏显示为 <code className="bg-blue-200 px-1 rounded">***</code></span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secrets List */}
          <div className="space-y-3">
            {secrets.map((secret) => {
              const Icon = getSecretTypeIcon(secret.type);
              const isVisible = showSecretValue[secret.id];
              return (
                <div
                  key={secret.id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900 font-mono">
                            {secret.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs border border-purple-200">
                            {getSecretTypeName(secret.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{secret.description}</p>

                        {/* Secret Value (masked) */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded border border-gray-200 font-mono text-sm">
                            {isVisible ? (
                              <span className="text-gray-900">sk_live_xxxxxxxxxxxxxxxxxxxx</span>
                            ) : (
                              <span className="text-gray-400">••••••••••••••••••••••••</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(secret.id)}
                            className="h-9"
                          >
                            {isVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(secret.id)}
                            className="h-9"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">创建人：</span>
                            <span className="text-gray-900 font-medium">{secret.createdBy}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">创建时间：</span>
                            <span className="text-gray-900">{secret.createdAt}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">最近使用：</span>
                            <span className="text-gray-900">
                              {secret.lastUsed || '从未使用'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">使用次数：</span>
                            <span className="text-gray-900 font-medium">{secret.usageCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="h-9">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSecret(secret)}
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {secrets.length === 0 && (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">暂无密钥</p>
                <Button
                  onClick={handleAddSecret}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个密钥
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Operation Confirmation */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50/50">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            高风险操作二次确认
          </CardTitle>
          <CardDescription className="mt-1.5">
            为防止误操作，建议对高风险操作启用二次确认
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Production Execution */}
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmProdExecution ? 'bg-red-100' : 'bg-gray-200'
                }`}>
                  <Shield className={`w-5 h-5 ${
                    confirmProdExecution ? 'text-red-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">生产环境脚本执行</h4>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">
                      高危
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    在生产环境执行脚本前，需要用户再次确认操作，避免误操作影响线上业务
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmProdExecution(!confirmProdExecution)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  confirmProdExecution ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    confirmProdExecution ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Secret Access */}
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmSecretAccess ? 'bg-purple-100' : 'bg-gray-200'
                }`}>
                  <Key className={`w-5 h-5 ${
                    confirmSecretAccess ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">密钥查看和复制</h4>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium border border-orange-200">
                      中危
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    查看或复制密钥明文前，需要用户确认身份，所有操作记录到审计日志
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmSecretAccess(!confirmSecretAccess)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  confirmSecretAccess ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    confirmSecretAccess ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* High Risk Script */}
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmHighRisk ? 'bg-yellow-100' : 'bg-gray-200'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    confirmHighRisk ? 'text-yellow-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">高风险脚本执行</h4>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium border border-yellow-200">
                      中危
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    包含 <code className="bg-gray-100 px-1 rounded">rm -rf</code>、<code className="bg-gray-100 px-1 rounded">DROP TABLE</code> 等危险命令的脚本，执行前需二次确认
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmHighRisk(!confirmHighRisk)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  confirmHighRisk ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    confirmHighRisk ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Node Delete */}
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  confirmNodeDelete ? 'bg-red-100' : 'bg-gray-200'
                }`}>
                  <Trash2 className={`w-5 h-5 ${
                    confirmNodeDelete ? 'text-red-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">节点和资源删除</h4>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">
                      高危
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    删除执行节点、脚本、任务等资源前，需要用户确认操作避免误删
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmNodeDelete(!confirmNodeDelete)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  confirmNodeDelete ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    confirmNodeDelete ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Permission Policy */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50/50">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            执行权限限制策略
          </CardTitle>
          <CardDescription className="mt-1.5">
            配置不同场景下的权限管控规则
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Script Execution Policy */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                脚本执行权限策略
              </Label>
              <div className="space-y-3">
                <div
                  onClick={() => setScriptExecutionPolicy('open')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    scriptExecutionPolicy === 'open'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          scriptExecutionPolicy === 'open'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {scriptExecutionPolicy === 'open' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">开放模式</h4>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          低限制
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        所有登录用户均可执行脚本，适合小团队或开发环境使用
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setScriptExecutionPolicy('role_based')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    scriptExecutionPolicy === 'role_based'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          scriptExecutionPolicy === 'role_based'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {scriptExecutionPolicy === 'role_based' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">基于角色</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          推荐
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        根据用户角色控制权限，运维工程师可执行，只读用户仅可查看
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setScriptExecutionPolicy('approval')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    scriptExecutionPolicy === 'approval'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          scriptExecutionPolicy === 'approval'
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {scriptExecutionPolicy === 'approval' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">审批模式</h4>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                          严格
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        所有脚本执行需要管理员审批后才能运行，适合生产环境
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secret Access Policy */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                密钥访问权限策略
              </Label>
              <div className="space-y-3">
                <div
                  onClick={() => setSecretAccessPolicy('admin_only')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    secretAccessPolicy === 'admin_only'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          secretAccessPolicy === 'admin_only'
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {secretAccessPolicy === 'admin_only' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">仅管理员</h4>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          推荐
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        只有系统管理员可以查看、创建和修改密钥，其他用户仅能在脚本中使用
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSecretAccessPolicy('owner_only')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    secretAccessPolicy === 'owner_only'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          secretAccessPolicy === 'owner_only'
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {secretAccessPolicy === 'owner_only' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">创建者可见</h4>
                      <p className="text-xs text-gray-600">
                        用户只能查看和管理自己创建的密钥，管理员可查看所有
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Production Environment Policy */}
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                生产环境访问策略
              </Label>
              <div className="space-y-3">
                <div
                  onClick={() => setProdEnvironmentPolicy('restricted')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    prodEnvironmentPolicy === 'restricted'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          prodEnvironmentPolicy === 'restricted'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {prodEnvironmentPolicy === 'restricted' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">严格限制</h4>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          推荐
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        只有指定的生产运维人员可以在生产环境执行脚本，其他人无权限
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setProdEnvironmentPolicy('approval_required')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    prodEnvironmentPolicy === 'approval_required'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          prodEnvironmentPolicy === 'approval_required'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {prodEnvironmentPolicy === 'approval_required' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">需要审批</h4>
                      <p className="text-xs text-gray-600">
                        在生产环境执行任何脚本都需要管理员审批，提供最高级别保护
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Secret Dialog */}
      <Dialog open={isAddSecretDialogOpen} onOpenChange={setIsAddSecretDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" />
              新增密钥
            </DialogTitle>
            <DialogDescription>添加新的敏感信息用于脚本执行</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-900">安全提醒</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    密钥将采用 AES-256 加密存储，只有在脚本执行时才会临时解密注入
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-name">
                密钥名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="secret-name"
                placeholder="例如: DATABASE_PASSWORD（建议使用大写字母和下划线）"
                value={secretFormData.name}
                onChange={(e) =>
                  setSecretFormData({ ...secretFormData, name: e.target.value })
                }
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                在脚本中使用 <code className="bg-gray-100 px-1 rounded">$&#123;密钥名称&#125;</code> 引用此密钥
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-type">
                密钥类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={secretFormData.type}
                onValueChange={(value: 'password' | 'api_key' | 'token' | 'certificate') =>
                  setSecretFormData({ ...secretFormData, type: value })
                }
              >
                <SelectTrigger id="secret-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span>密码</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="api_key">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600" />
                      <span>API 密钥</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="token">
                    <div className="flex items-center gap-2">
                      <FileKey className="w-4 h-4 text-green-600" />
                      <span>令牌</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="certificate">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span>证书</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-desc">密钥描述</Label>
              <Input
                id="secret-desc"
                placeholder="简要描述该密钥的用途"
                value={secretFormData.description}
                onChange={(e) =>
                  setSecretFormData({ ...secretFormData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret-value">
                密钥值 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="secret-value"
                type="password"
                placeholder="输入密钥内容"
                value={secretFormData.value}
                onChange={(e) =>
                  setSecretFormData({ ...secretFormData, value: e.target.value })
                }
                className="font-mono"
              />
              <p className="text-xs text-gray-500">密钥值保存后将无法查看明文</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSecretDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmitAddSecret}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Key className="w-4 h-4 mr-2" />
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Secret Dialog */}
      <Dialog open={isDeleteSecretDialogOpen} onOpenChange={setIsDeleteSecretDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              删除密钥
            </DialogTitle>
            <DialogDescription>此操作不可撤销，请仔细确认</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">危险操作警告</p>
                  <ul className="text-xs text-red-700 mt-2 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>删除密钥后，使用该密钥的脚本将无法正常执行</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>正在运行的任务可能会失败</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>密钥一旦删除无法恢复</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {selectedSecret && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">即将删除的密钥：</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    {(() => {
                      const Icon = getSecretTypeIcon(selectedSecret.type);
                      return <Icon className="w-5 h-5 text-purple-600" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {selectedSecret.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      使用 {selectedSecret.usageCount} 次 · {getSecretTypeName(selectedSecret.type)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600">
              确定要删除密钥{' '}
              <span className="font-medium text-gray-900 font-mono">
                "{selectedSecret?.name}"
              </span>{' '}
              吗？
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteSecretDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
