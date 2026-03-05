import { useState } from 'react';
import {
  Mail,
  Webhook,
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Send,
  Settings,
  Zap,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Toggle,
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

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'webhook' | 'wechat' | 'feishu';
  enabled: boolean;
  config: Record<string, any>;
  lastTestTime?: string;
  lastTestStatus?: 'success' | 'failed';
}

interface AlertRule {
  id: string;
  name: string;
  type: 'failure' | 'timeout' | 'success' | 'node_offline';
  enabled: boolean;
  channels: string[];
  conditions: Record<string, any>;
}

const mockChannels: NotificationChannel[] = [
  {
    id: 'email_1',
    name: '运维团队邮件',
    type: 'email',
    enabled: true,
    config: {
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      sender: 'ops@example.com',
      recipients: ['ops-team@example.com', 'admin@example.com'],
    },
    lastTestTime: '2026-01-30 09:30:00',
    lastTestStatus: 'success',
  },
  {
    id: 'webhook_1',
    name: 'Slack 集成',
    type: 'webhook',
    enabled: true,
    config: {
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    lastTestTime: '2026-01-29 15:20:00',
    lastTestStatus: 'success',
  },
  {
    id: 'wechat_1',
    name: '企业微信机器人',
    type: 'wechat',
    enabled: false,
    config: {
      webhookUrl: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx',
    },
  },
];

const mockAlertRules: AlertRule[] = [
  {
    id: 'rule_1',
    name: '脚本执行失败告警',
    type: 'failure',
    enabled: true,
    channels: ['email_1', 'webhook_1'],
    conditions: {
      severity: 'high',
      notifyImmediately: true,
    },
  },
  {
    id: 'rule_2',
    name: '脚本执行超时告警',
    type: 'timeout',
    enabled: true,
    channels: ['email_1'],
    conditions: {
      timeoutThreshold: 3600,
      retryCount: 3,
    },
  },
  {
    id: 'rule_3',
    name: '执行成功通知',
    type: 'success',
    enabled: false,
    channels: ['webhook_1'],
    conditions: {
      onlyForCriticalScripts: true,
    },
  },
  {
    id: 'rule_4',
    name: '节点离线告警',
    type: 'node_offline',
    enabled: true,
    channels: ['email_1', 'webhook_1'],
    conditions: {
      offlineThreshold: 300,
    },
  },
];

export function NotificationConfiguration() {
  const [channels, setChannels] = useState<NotificationChannel[]>(mockChannels);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  const [channelFormData, setChannelFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'webhook' | 'wechat' | 'feishu',
    smtpServer: '',
    smtpPort: '587',
    sender: '',
    recipients: '',
    webhookUrl: '',
    webhookMethod: 'POST',
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'webhook':
        return Webhook;
      case 'wechat':
      case 'feishu':
        return MessageSquare;
      default:
        return Bell;
    }
  };

  const getChannelTypeName = (type: string) => {
    switch (type) {
      case 'email':
        return '邮件通知';
      case 'webhook':
        return 'Webhook';
      case 'wechat':
        return '企业微信';
      case 'feishu':
        return '飞书';
      default:
        return type;
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'failure':
        return XCircle;
      case 'timeout':
        return Clock;
      case 'success':
        return CheckCircle2;
      case 'node_offline':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getRuleTypeName = (type: string) => {
    switch (type) {
      case 'failure':
        return '执行失败';
      case 'timeout':
        return '执行超时';
      case 'success':
        return '执行成功';
      case 'node_offline':
        return '节点离线';
      default:
        return type;
    }
  };

  const getRuleColor = (type: string) => {
    switch (type) {
      case 'failure':
        return 'red';
      case 'timeout':
        return 'orange';
      case 'success':
        return 'green';
      case 'node_offline':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const handleToggleChannel = (channelId: string) => {
    setChannels(
      channels.map((ch) =>
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setAlertRules(
      alertRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleTestChannel = (channel: NotificationChannel) => {
    setSelectedChannel(channel);
    setTestingChannel(channel.id);
    setIsTestDialogOpen(true);

    // Simulate test
    setTimeout(() => {
      setChannels(
        channels.map((ch) =>
          ch.id === channel.id
            ? {
                ...ch,
                lastTestTime: new Date().toLocaleString('zh-CN'),
                lastTestStatus: 'success' as const,
              }
            : ch
        )
      );
      setTestingChannel(null);
    }, 2000);
  };

  const handleAddChannel = () => {
    setChannelFormData({
      name: '',
      type: 'email',
      smtpServer: '',
      smtpPort: '587',
      sender: '',
      recipients: '',
      webhookUrl: '',
      webhookMethod: 'POST',
    });
    setIsAddChannelDialogOpen(true);
  };

  const handleEditChannel = (channel: NotificationChannel) => {
    setSelectedChannel(channel);
    setChannelFormData({
      name: channel.name,
      type: channel.type,
      smtpServer: channel.config.smtpServer || '',
      smtpPort: channel.config.smtpPort || '587',
      sender: channel.config.sender || '',
      recipients: Array.isArray(channel.config.recipients)
        ? channel.config.recipients.join(', ')
        : '',
      webhookUrl: channel.config.url || channel.config.webhookUrl || '',
      webhookMethod: channel.config.method || 'POST',
    });
    setIsEditChannelDialogOpen(true);
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(channels.filter((ch) => ch.id !== channelId));
  };

  const handleSubmitAddChannel = () => {
    const newChannel: NotificationChannel = {
      id: `channel_${Date.now()}`,
      name: channelFormData.name,
      type: channelFormData.type,
      enabled: true,
      config:
        channelFormData.type === 'email'
          ? {
              smtpServer: channelFormData.smtpServer,
              smtpPort: channelFormData.smtpPort,
              sender: channelFormData.sender,
              recipients: channelFormData.recipients.split(',').map((r) => r.trim()),
            }
          : {
              url: channelFormData.webhookUrl,
              method: channelFormData.webhookMethod,
            },
    };
    setChannels([...channels, newChannel]);
    setIsAddChannelDialogOpen(false);
  };

  const handleSubmitEditChannel = () => {
    if (!selectedChannel) return;
    setChannels(
      channels.map((ch) =>
        ch.id === selectedChannel.id
          ? {
              ...ch,
              name: channelFormData.name,
              config:
                channelFormData.type === 'email'
                  ? {
                      smtpServer: channelFormData.smtpServer,
                      smtpPort: channelFormData.smtpPort,
                      sender: channelFormData.sender,
                      recipients: channelFormData.recipients
                        .split(',')
                        .map((r) => r.trim()),
                    }
                  : {
                      url: channelFormData.webhookUrl,
                      method: channelFormData.webhookMethod,
                    },
            }
          : ch
      )
    );
    setIsEditChannelDialogOpen(false);
  };

  const enabledChannelsCount = channels.filter((ch) => ch.enabled).length;
  const activeRulesCount = alertRules.filter((rule) => rule.enabled).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通知与告警配置</h1>
          <p className="text-sm text-gray-500 mt-1">配置任务执行结果通知方式和告警规则</p>
        </div>
        <Button onClick={handleAddChannel} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新增通知渠道
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">通知渠道</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{channels.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">已启用渠道</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{enabledChannelsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">告警规则</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{alertRules.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">生效规则</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{activeRulesCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>通知渠道配置</CardTitle>
          <CardDescription>配置邮件、Webhook、企业微信等通知方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {channels.map((channel) => {
              const Icon = getChannelIcon(channel.type);
              return (
                <div
                  key={channel.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    channel.enabled
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon & Toggle */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            channel.enabled ? 'bg-blue-100' : 'bg-gray-200'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${
                              channel.enabled ? 'text-blue-600' : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <button
                          onClick={() => handleToggleChannel(channel.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            channel.enabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              channel.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          ></div>
                        </button>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`text-base font-semibold ${
                              channel.enabled ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {channel.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-medium ${
                              channel.enabled
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {channel.enabled ? '已启用' : '已禁用'}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            {getChannelTypeName(channel.type)}
                          </span>
                        </div>

                        {/* Configuration Details */}
                        <div className="space-y-2">
                          {channel.type === 'email' && (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-500">SMTP 服务器：</span>
                                <span className="text-gray-900 font-mono">
                                  {channel.config.smtpServer}:{channel.config.smtpPort}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">发件人：</span>
                                <span className="text-gray-900">{channel.config.sender}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">收件人：</span>
                                <span className="text-gray-900">
                                  {Array.isArray(channel.config.recipients)
                                    ? channel.config.recipients.join(', ')
                                    : channel.config.recipients}
                                </span>
                              </div>
                            </div>
                          )}

                          {(channel.type === 'webhook' ||
                            channel.type === 'wechat' ||
                            channel.type === 'feishu') && (
                            <div className="text-sm">
                              <span className="text-gray-500">Webhook URL：</span>
                              <span className="text-gray-900 font-mono text-xs break-all">
                                {channel.config.url || channel.config.webhookUrl}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Test Status */}
                        {channel.lastTestTime && (
                          <div className="mt-3 flex items-center gap-2 text-xs">
                            {channel.lastTestStatus === 'success' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-700">最近测试成功</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-red-700">最近测试失败</span>
                              </>
                            )}
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500">{channel.lastTestTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChannel(channel)}
                        disabled={!channel.enabled || testingChannel === channel.id}
                        className="h-9"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {testingChannel === channel.id ? '测试中...' : '测试'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChannel(channel)}
                        className="h-9"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                        className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {channels.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">暂无通知渠道</p>
                <Button
                  onClick={handleAddChannel}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一个通知渠道
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle>告警规则配置</CardTitle>
          <CardDescription>配置不同场景下的告警触发条件和通知方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertRules.map((rule) => {
              const Icon = getRuleIcon(rule.type);
              const color = getRuleColor(rule.type);
              return (
                <div
                  key={rule.id}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    rule.enabled
                      ? `border-${color}-200 bg-${color}-50/30`
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          rule.enabled ? `bg-${color}-100` : 'bg-gray-200'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            rule.enabled ? `text-${color}-600` : 'text-gray-400'
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className={`text-base font-semibold ${
                              rule.enabled ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {rule.name}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                              rule.enabled
                                ? `bg-${color}-100 text-${color}-700 border-${color}-200`
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {getRuleTypeName(rule.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" />
                            <span>
                              {rule.channels.length} 个通知渠道
                            </span>
                          </div>
                          {rule.type === 'timeout' && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>超时阈值: {rule.conditions.timeoutThreshold}秒</span>
                            </div>
                          )}
                          {rule.type === 'node_offline' && (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>离线阈值: {rule.conditions.offlineThreshold}秒</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-4">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            rule.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        ></div>
                      </button>
                      <span
                        className={`text-xs font-medium w-12 ${
                          rule.enabled ? 'text-green-700' : 'text-gray-500'
                        }`}
                      >
                        {rule.enabled ? '已启用' : '已禁用'}
                      </span>
                      <Button variant="outline" size="sm" className="h-9">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Channel Tags */}
                  {rule.enabled && rule.channels.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">通知到:</span>
                      {rule.channels.map((channelId) => {
                        const channel = channels.find((ch) => ch.id === channelId);
                        if (!channel) return null;
                        const ChannelIcon = getChannelIcon(channel.type);
                        return (
                          <div
                            key={channelId}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                          >
                            <ChannelIcon className="w-3 h-3 text-gray-500" />
                            <span className="text-gray-700">{channel.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">通知与告警说明</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>通知渠道配置后，建议先执行测试确保配置正确</li>
                <li>告警规则支持多渠道通知，可根据场景灵活配置</li>
                <li>邮件通知支持多个收件人，使用逗号分隔</li>
                <li>Webhook 通知将发送 JSON 格式的执行结果数据</li>
                <li>企业微信和飞书需要先创建机器人并获取 Webhook 地址</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Channel Dialog */}
      <Dialog
        open={isAddChannelDialogOpen || isEditChannelDialogOpen}
        onOpenChange={(open) => {
          setIsAddChannelDialogOpen(false);
          setIsEditChannelDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              {isAddChannelDialogOpen ? '新增通知渠道' : '编辑通知渠道'}
            </DialogTitle>
            <DialogDescription>配置通知方式和参数</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">
                渠道名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="channel-name"
                placeholder="例如: 运维团队邮件"
                value={channelFormData.name}
                onChange={(e) =>
                  setChannelFormData({ ...channelFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-type">
                通知类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={channelFormData.type}
                onValueChange={(value: 'email' | 'webhook' | 'wechat' | 'feishu') =>
                  setChannelFormData({ ...channelFormData, type: value })
                }
                disabled={isEditChannelDialogOpen}
              >
                <SelectTrigger id="channel-type" className={isEditChannelDialogOpen ? 'bg-gray-50' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>邮件通知</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="webhook">
                    <div className="flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-purple-600" />
                      <span>Webhook</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="wechat">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>企业微信</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="feishu">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>飞书</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {isEditChannelDialogOpen && (
                <p className="text-xs text-gray-500">通知类型创建后不可修改</p>
              )}
            </div>

            {/* Email Configuration */}
            {channelFormData.type === 'email' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP 服务器</Label>
                    <Input
                      id="smtp-server"
                      placeholder="smtp.example.com"
                      value={channelFormData.smtpServer}
                      onChange={(e) =>
                        setChannelFormData({ ...channelFormData, smtpServer: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">端口</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      value={channelFormData.smtpPort}
                      onChange={(e) =>
                        setChannelFormData({ ...channelFormData, smtpPort: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender">发件人邮箱</Label>
                  <Input
                    id="sender"
                    type="email"
                    placeholder="ops@example.com"
                    value={channelFormData.sender}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, sender: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">收件人邮箱</Label>
                  <Input
                    id="recipients"
                    placeholder="user1@example.com, user2@example.com"
                    value={channelFormData.recipients}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, recipients: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">多个收件人使用逗号分隔</p>
                </div>
              </>
            )}

            {/* Webhook Configuration */}
            {(channelFormData.type === 'webhook' ||
              channelFormData.type === 'wechat' ||
              channelFormData.type === 'feishu') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">
                    Webhook URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-webhook-endpoint.com/notify"
                    value={channelFormData.webhookUrl}
                    onChange={(e) =>
                      setChannelFormData({ ...channelFormData, webhookUrl: e.target.value })
                    }
                    className="font-mono text-sm"
                  />
                </div>
                {channelFormData.type === 'webhook' && (
                  <div className="space-y-2">
                    <Label htmlFor="webhook-method">请求方法</Label>
                    <Select
                      value={channelFormData.webhookMethod}
                      onValueChange={(value) =>
                        setChannelFormData({ ...channelFormData, webhookMethod: value })
                      }
                    >
                      <SelectTrigger id="webhook-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Help Text */}
            {channelFormData.type === 'wechat' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-medium mb-1">企业微信配置说明</p>
                <p className="text-xs text-blue-700">
                  1. 在企业微信中创建群聊机器人
                  <br />
                  2. 获取 Webhook 地址并填入上方
                  <br />
                  3. 测试通知确保配置正确
                </p>
              </div>
            )}

            {channelFormData.type === 'feishu' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-900 font-medium mb-1">飞书配置说明</p>
                <p className="text-xs text-blue-700">
                  1. 在飞书群聊中添加自定义机器人
                  <br />
                  2. 获取 Webhook 地址并填入上方
                  <br />
                  3. 根据需要配置安全设置（签名验证等）
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddChannelDialogOpen(false);
                setIsEditChannelDialogOpen(false);
              }}
            >
              取消
            </Button>
            <Button
              onClick={
                isAddChannelDialogOpen ? handleSubmitAddChannel : handleSubmitEditChannel
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAddChannelDialogOpen ? '确认添加' : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Notification Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              测试通知
            </DialogTitle>
            <DialogDescription>
              将发送测试消息到 {selectedChannel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {testingChannel ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-600">正在发送测试通知...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">测试成功</p>
                      <p className="text-xs text-green-700 mt-1">
                        已成功发送测试通知，请检查接收端是否收到消息
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium mb-2">测试消息内容：</p>
                  <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-auto">
{`{
  "type": "test",
  "title": "运维调度系统 - 测试通知",
  "message": "这是一条测试消息",
  "timestamp": "${new Date().toLocaleString('zh-CN')}"
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
          {!testingChannel && (
            <DialogFooter>
              <Button onClick={() => setIsTestDialogOpen(false)}>关闭</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
