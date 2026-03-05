# Agent 安装指南

## 简介

Agent 是运行在目标节点上的代理程序，负责接收管理节点下发的任务并执行脚本。

## 系统要求

- Python 3.8+
- Linux/macOS/Windows

## 安装步骤

### 1. 安装依赖

```bash
cd agent
pip install -r requirements.txt
```

依赖包：
- `websockets>=10.0` - WebSocket 客户端
- `pyyaml>=6.0` - 配置文件解析
- `requests>=2.28.0` - HTTP 请求

### 2. 配置 Agent

编辑 `config.yaml` 文件：

```yaml
server:
  url: http://localhost:8000    # 管理节点地址
  api_prefix: /api/v1           # API 前缀
  timeout: 30                   # 请求超时时间(秒)

agent:
  node_name: "node-dev-01"     # 节点名称(唯一标识)
  ip: "172.21.35.90"          # 节点 IP 地址
  environment: dev              # 运行环境: dev/test/prod
  tags:                        # 标签(可选)
    - web
    - production

heartbeat:
  interval: 30                 # 心跳间隔(秒)

task:
  script_dir: /tmp/agent_scripts  # 脚本临时存放目录
  log_dir: /tmp/agent_logs        # 日志存放目录
  max_concurrent: 3               # 最大并发任务数
```

### 3. 启动 Agent

前台运行：
```bash
python agent.py
```

后台运行：
```bash
python agent.py -d
```

### 4. 验证连接

启动成功后，日志会显示：
```
WebSocket connected
Agent connected successfully
```

## 使用说明

### 基本操作

- **启动**: `python agent.py`
- **停止**: `Ctrl + C` 或发送 SIGTERM 信号
- **后台运行**: `python agent.py -d`

### 查看日志

日志默认输出到控制台，格式如下：
```
2026-03-04 10:00:00 - Agent - INFO - WebSocket connected
2026-03-04 10:00:00 - Agent - INFO - Agent connected successfully
2026-03-04 10:00:30 - Agent - DEBUG - Heartbeat sent via WebSocket
```

### 任务执行流程

1. 用户在前端选择脚本和目标节点
2. 点击执行按钮
3. 管理节点通过 WebSocket 推送任务给对应 Agent
4. Agent 接收任务，下载脚本内容
5. Agent 在本地执行脚本
6. 执行完成后，Agent 上报结果给管理节点

## 目录结构

```
agent/
├── agent.py           # 主程序入口
├── config.yaml        # 配置文件
├── requirements.txt   # Python 依赖
├── credentials.json   # 认证凭证(自动生成)
└── README.md         # 本文档
```

## 常见问题

### Q: Agent 无法连接到服务器
A: 检查 `config.yaml` 中的 `server.url` 是否正确，确保管理节点服务已启动。

### Q: 节点已注册但显示离线
A: 检查防火墙是否允许 WebSocket 连接(端口 8000)。

### Q: 任务执行失败
A: 查看 Agent 日志中的错误信息，确保脚本语法正确且有执行权限。

### Q: 如何重新注册节点
A: 删除 `credentials.json` 文件后重启 Agent，节点将重新注册。

## 安全注意事项

1. **生产环境**: 使用 `https://` 和 `wss://` 开头确保通信安全
2. **节点认证**: 首次注册后，凭证会保存在 `credentials.json`，请妥善保管
3. **脚本权限**: 确保 Agent 运行用户有执行脚本的权限
