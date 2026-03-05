# 功能点拆分表

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 功能点拆分表 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-02-27 |
| 文档状态 | 初稿 |

---

## 功能点列表

### 1. 仪表盘 (Dashboard)

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| DASH-001 | 仪表盘 | Dashboard | 统计卡片展示 | 显示今日执行任务数、成功率、在线节点数等关键指标 | 数据实时更新 | admin/ops/readonly | 统计数据正确显示 |
| DASH-002 | 仪表盘 | Dashboard | 脚本类型分布 | 展示Python和Shell脚本的数量分布 | 按脚本类型统计 | admin/ops/readonly | 分布数据准确 |
| DASH-003 | 仪表盘 | Dashboard | 调度任务统计 | 展示定时任务、触发式、手动任务的数量 | 按任务类型统计 | admin/ops/readonly | 统计数据准确 |
| DASH-004 | 仪表盘 | Dashboard | 最近执行记录 | 显示最近5条执行记录 | 按执行时间倒序 | admin/ops/readonly | 记录实时更新 |
| DASH-005 | 仪表盘 | Dashboard | 记录跳转 | 点击执行记录跳转到详情页 | 点击跳转 | admin/ops/readonly | 跳转正确 |

---

### 2. 脚本管理 (Script Management)

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| SCRIPT-001 | 脚本管理 | ScriptManagement | 脚本列表展示 | 展示所有脚本，显示名称、类型、分类、维护人、更新时间 | 支持分页 | admin/ops/readonly | 列表正确显示 |
| SCRIPT-002 | 脚本管理 | ScriptManagement | 脚本搜索 | 按脚本名称搜索 | 支持模糊搜索 | admin/ops/readonly | 搜索结果准确 |
| SCRIPT-003 | 脚本管理 | ScriptManagement | 脚本类型筛选 | 按脚本类型（Python/Shell）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| SCRIPT-004 | 脚本管理 | ScriptManagement | 脚本分类筛选 | 按脚本分类筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| SCRIPT-005 | 脚本管理 | ScriptManagement | 新建脚本 | 创建新的脚本，填写名称、类型、分类、维护人、描述 | 必填字段校验 | admin/ops | 创建成功 |
| SCRIPT-006 | 脚本管理 | ScriptDetail | 编辑脚本 | 修改脚本的基本信息和代码内容 | 保存时校验 | admin/ops | 修改成功 |
| SCRIPT-007 | 脚本管理 | ScriptManagement | 删除脚本 | 删除不再使用的脚本 | 需二次确认 | admin | 删除成功 |
| SCRIPT-008 | 脚本管理 | ScriptDetail | 查看脚本详情 | 查看脚本的完整信息和代码内容 | 只读 | admin/ops/readonly | 详情正确显示 |
| SCRIPT-009 | 脚本管理 | ScriptExecuteDialog | 立即执行 | 手动触发脚本执行，选择执行节点和环境 | 需选择节点和环境 | admin/ops | 执行成功 |
| SCRIPT-010 | 脚本管理 | ScriptDetail | 脚本代码编辑 | 编辑脚本代码内容，支持语法高亮 | 代码编辑器 | admin/ops | 编辑成功 |

---

### 3. 任务调度 (Task Scheduling)

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| TASK-001 | 任务调度 | TaskScheduling | 任务列表展示 | 展示所有调度任务，显示名称、关联脚本、Cron表达式、状态等 | 支持分页 | admin/ops/readonly | 列表正确显示 |
| TASK-002 | 任务调度 | TaskScheduling | 任务搜索 | 按任务名称、脚本名称搜索 | 支持模糊搜索 | admin/ops/readonly | 搜索结果准确 |
| TASK-003 | 任务调度 | TaskScheduling | 任务状态筛选 | 按任务状态（运行中/已暂停）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| TASK-004 | 任务调度 | TaskScheduling | 任务统计 | 显示总任务数、运行中、已暂停数量 | 实时统计 | admin/ops/readonly | 统计数据准确 |
| TASK-005 | 任务调度 | TaskDialog | 新建任务 | 创建新的调度任务，配置任务名称、关联脚本、Cron表达式等 | 必填字段校验 | admin/ops | 创建成功 |
| TASK-006 | 任务调度 | TaskDialog | 编辑任务 | 修改任务的配置信息 | 保存时校验 | admin/ops | 修改成功 |
| TASK-007 | 任务调度 | TaskScheduling | 删除任务 | 删除不再需要的任务 | 需二次确认 | admin | 删除成功 |
| TASK-008 | 任务调度 | TaskScheduling | 启用/暂停任务 | 快速切换任务的启用状态 | 点击切换 | admin/ops | 状态切换成功 |
| TASK-009 | 任务调度 | TaskDialog | Cron表达式编辑 | 可视化编辑Cron表达式 | 支持常用预设 | admin/ops | 表达式正确 |
| TASK-010 | 任务调度 | TaskDialog | 选择执行节点 | 选择指定节点或所有节点执行 | 单选/多选 | admin/ops | 选择成功 |
| TASK-011 | 任务调度 | TaskScheduling | 下次执行时间 | 自动计算并显示下次执行时间 | 实时计算 | admin/ops/readonly | 时间准确 |
| TASK-012 | 任务调度 | TaskScheduling | 上次执行状态 | 显示上次执行的结果（成功/失败） | 从执行记录获取 | admin/ops/readonly | 状态准确 |
| TASK-013 | 任务调度 | TaskDialog | 执行环境选择 | 选择执行环境（dev/test/prod） | 下拉选择 | admin/ops | 选择成功 |

---

### 4. 执行记录 (Execution History)

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| EXEC-001 | 执行记录 | ExecutionHistory | 记录列表展示 | 展示所有执行记录，显示执行时间、脚本名称、执行人、状态、耗时等 | 支持分页 | admin/ops/readonly | 列表正确显示 |
| EXEC-002 | 执行记录 | ExecutionHistory | 记录搜索 | 按脚本名称、执行人搜索 | 支持模糊搜索 | admin/ops/readonly | 搜索结果准确 |
| EXEC-003 | 执行记录 | ExecutionHistory | 执行状态筛选 | 按执行状态（成功/失败/执行中）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| EXEC-004 | 执行记录 | ExecutionHistory | 执行环境筛选 | 按执行环境（dev/test/prod）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| EXEC-005 | 执行记录 | ExecutionHistory | 统计信息 | 显示总执行次数、成功次数、失败次数、成功率 | 实时统计 | admin/ops/readonly | 统计数据准确 |
| EXEC-006 | 执行记录 | LogDetail | 查看日志 | 查看单次执行的详细日志 | 实时滚动 | admin/ops/readonly | 日志正确显示 |
| EXEC-007 | 执行记录 | LogDetail | 日志下载 | 下载执行日志文件 | 支持下载 | admin/ops/readonly | 下载成功 |
| EXEC-008 | 执行记录 | LogDetail | 日志复制 | 复制日志内容到剪贴板 | 一键复制 | admin/ops/readonly | 复制成功 |
| EXEC-009 | 执行记录 | LogDetail | 实时日志更新 | 执行中的任务显示实时日志 | WebSocket推送 | admin/ops/readonly | 实时更新 |

---

### 5. 节点管理 (Node Management)

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| NODE-001 | 节点管理 | NodeManagement | 节点列表展示 | 展示所有节点，显示名称、IP、环境、标签、状态、心跳时间等 | 支持分页 | admin/ops/readonly | 列表正确显示 |
| NODE-002 | 节点管理 | NodeManagement | 节点搜索 | 按节点名称、IP地址搜索 | 支持模糊搜索 | admin/ops/readonly | 搜索结果准确 |
| NODE-003 | 节点管理 | NodeManagement | 节点环境筛选 | 按节点环境（dev/test/prod）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| NODE-004 | 节点管理 | NodeManagement | 节点状态筛选 | 按节点状态（在线/离线）筛选 | 下拉选择 | admin/ops/readonly | 筛选结果准确 |
| NODE-005 | 节点管理 | NodeManagement | 节点统计 | 显示总节点数、在线、离线、在线率 | 实时统计 | admin/ops/readonly | 统计数据准确 |
| NODE-006 | 节点管理 | NodeFormDialog | 新增节点 | 添加新的执行节点，配置节点名称、IP、环境、标签 | 必填字段校验 | admin | 创建成功 |
| NODE-007 | 节点管理 | NodeFormDialog | 编辑节点 | 修改节点的配置信息 | 保存时校验 | admin | 修改成功 |
| NODE-008 | 节点管理 | NodeManagement | 删除节点 | 移除不再使用的节点 | 需二次确认 | admin | 删除成功 |
| NODE-009 | 节点管理 | NodeDetail | 查看节点详情 | 查看节点的详细信息和执行历史 | 只读 | admin/ops/readonly | 详情正确显示 |
| NODE-010 | 节点管理 | NodeManagement | 节点状态更新 | 显示节点在线/离线状态 | 心跳检测 | admin/ops/readonly | 状态实时更新 |
| NODE-011 | 节点管理 | NodeDetail | 资源监控 | 显示节点的CPU、内存、磁盘使用率 | 实时监控 | admin/ops/readonly | 数据准确 |
| NODE-012 | 节点管理 | NodeManagement | 节点标签管理 | 管理节点的标签 | 支持多个标签 | admin | 标签管理成功 |

---

### 6. 系统设置 (System Settings)

#### 6.1 用户与权限

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| USER-001 | 系统设置 | UserPermissionManagement | 用户列表展示 | 展示所有用户，显示用户名、角色、邮箱、状态等 | 支持分页 | admin | 列表正确显示 |
| USER-002 | 系统设置 | UserPermissionManagement | 新增用户 | 创建新用户，配置用户名、密码、邮箱、角色 | 密码强度校验 | admin | 创建成功 |
| USER-003 | 系统设置 | UserPermissionManagement | 编辑用户 | 修改用户信息 | 保存时校验 | admin | 修改成功 |
| USER-004 | 系统设置 | UserPermissionManagement | 删除用户 | 删除不再使用的用户 | 需二次确认 | admin | 删除成功 |
| USER-005 | 系统设置 | UserPermissionManagement | 分配角色 | 为用户分配角色（admin/ops/readonly） | 下拉选择 | admin | 分配成功 |
| USER-006 | 系统设置 | UserPermissionManagement | 角色权限配置 | 配置各角色的访问权限 | 权限勾选 | admin | 配置成功 |
| USER-007 | 系统设置 | SystemSettings | 最大用户数配置 | 配置系统支持的最大并发用户数量 | 数值输入 | admin | 配置成功 |
| USER-008 | 系统设置 | SystemSettings | 会话超时配置 | 配置用户无操作后自动退出时间 | 分钟数输入 | admin | 配置成功 |
| USER-009 | 系统设置 | SystemSettings | 密码策略配置 | 配置密码复杂度要求（低/中/高） | 下拉选择 | admin | 配置成功 |

#### 6.2 脚本分类管理

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| CATEGORY-001 | 系统设置 | SystemSettings | 分类列表展示 | 展示所有脚本分类，显示名称、描述、脚本数量 | 支持分页 | admin | 列表正确显示 |
| CATEGORY-002 | 系统设置 | SystemSettings | 新增分类 | 创建新的脚本分类 | 必填字段校验 | admin | 创建成功 |
| CATEGORY-003 | 系统设置 | SystemSettings | 编辑分类 | 修改分类的名称和描述 | 保存时校验 | admin | 修改成功 |
| CATEGORY-004 | 系统设置 | SystemSettings | 删除分类 | 删除不再使用的分类 | 需二次确认 | admin | 删除成功 |

#### 6.3 执行环境配置

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| ENV-001 | 系统设置 | SystemSettings | 默认Shell配置 | 配置默认Shell（Bash/Sh/Zsh/Python3） | 下拉选择 | admin | 配置成功 |
| ENV-002 | 系统设置 | SystemSettings | 脚本超时配置 | 配置单个脚本最大执行时长 | 秒数输入 | admin | 配置成功 |
| ENV-003 | 系统设置 | SystemSettings | 最大并发配置 | 配置同时执行的脚本任务数量上限 | 数值输入 | admin | 配置成功 |
| ENV-004 | 系统设置 | SystemSettings | 工作目录配置 | 配置脚本执行的默认工作目录 | 路径输入 | admin | 配置成功 |
| ENV-005 | 系统设置 | SystemSettings | 环境变量配置 | 配置全局环境变量 | 键值对输入 | admin | 配置成功 |
| ENV-006 | 系统设置 | SystemSettings | 日志级别配置 | 配置日志输出级别 | 下拉选择 | admin | 配置成功 |
| ENV-007 | 系统设置 | SystemSettings | 日志文件大小配置 | 配置单个日志文件大小限制 | 下拉选择 | admin | 配置成功 |

#### 6.4 通知配置

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| NOTIF-001 | 系统设置 | NotificationConfiguration | 邮件通知开关 | 启用/禁用邮件通知 | 开关切换 | admin | 切换成功 |
| NOTIF-002 | 系统设置 | NotificationConfiguration | SMTP服务器配置 | 配置SMTP服务器地址 | 地址输入 | admin | 配置成功 |
| NOTIF-003 | 系统设置 | NotificationConfiguration | SMTP端口配置 | 配置SMTP服务器端口 | 端口输入 | admin | 配置成功 |
| NOTIF-004 | 系统设置 | NotificationConfiguration | 发件人邮箱配置 | 配置发件人邮箱 | 邮箱输入 | admin | 配置成功 |
| NOTIF-005 | 系统设置 | NotificationConfiguration | SMTP密码配置 | 配置SMTP密码或授权码 | 密码输入 | admin | 配置成功 |
| NOTIF-006 | 系统设置 | NotificationConfiguration | 发送测试邮件 | 发送测试邮件验证配置 | 点击发送 | admin | 发送成功 |
| NOTIF-007 | 系统设置 | NotificationConfiguration | Webhook配置 | 配置Webhook URL | URL输入 | admin | 配置成功 |

#### 6.5 安全设置

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| SEC-001 | 系统设置 | SecurityConfiguration | 登录尝试限制 | 配置最大登录尝试次数 | 数值输入 | admin | 配置成功 |
| SEC-002 | 系统设置 | SecurityConfiguration | 锁定时长配置 | 配置账户锁定时长 | 分钟数输入 | admin | 配置成功 |
| SEC-003 | 系统设置 | SecurityConfiguration | IP白名单配置 | 配置允许访问的IP地址列表 | IP列表输入 | admin | 配置成功 |
| SEC-004 | 系统设置 | SecurityConfiguration | 双因素认证 | 启用/禁用双因素认证 | 开关切换 | admin | 切换成功 |

#### 6.6 系统参数

| FeatureID | 模块 | 页面 | 功能点名称 | 功能描述 | 规则说明 | 权限说明 | 验收标准 |
|-----------|------|------|-----------|----------|----------|----------|----------|
| SYS-001 | 系统设置 | SystemParameterConfiguration | 系统名称配置 | 配置系统显示名称 | 文本输入 | admin | 配置成功 |
| SYS-002 | 系统设置 | SystemParameterConfiguration | 日志保留配置 | 配置日志保留天数 | 天数输入 | admin | 配置成功 |
| SYS-003 | 系统设置 | SystemParameterConfiguration | 数据备份配置 | 配置数据备份时间和频率 | 时间选择 | admin | 配置成功 |

---

## 功能点统计

| 模块 | 功能点数量 |
|------|-----------|
| 仪表盘 | 5 |
| 脚本管理 | 10 |
| 任务调度 | 13 |
| 执行记录 | 9 |
| 节点管理 | 12 |
| 系统设置 - 用户与权限 | 9 |
| 系统设置 - 脚本分类管理 | 4 |
| 系统设置 - 执行环境配置 | 7 |
| 系统设置 - 通知配置 | 7 |
| 系统设置 - 安全设置 | 4 |
| 系统设置 - 系统参数 | 3 |
| **总计** | **83** |

---

## FeatureID 命名规范

- 格式：`模块缩写-序号`
- 模块缩写：
  - DASH: 仪表盘
  - SCRIPT: 脚本管理
  - TASK: 任务调度
  - EXEC: 执行记录
  - NODE: 节点管理
  - USER: 用户与权限
  - CATEGORY: 脚本分类管理
  - ENV: 执行环境配置
  - NOTIF: 通知配置
  - SEC: 安全设置
  - SYS: 系统参数
- 序号：三位数字，从001开始递增
