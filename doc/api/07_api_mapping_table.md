# API 接口映射表

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | API 接口映射表 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-02-27 |
| 文档状态 | 初稿 |
| API 基础路径 | /api/v1 |

---

## 1. 仪表盘模块 (Dashboard)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Dashboard | Dashboard | 统计卡片展示 | DASH-001 | /api/v1/dashboard/stats | GET | - | {code:int, message:string, data:{today_executions:int, success_rate:float, online_nodes:int, total_nodes:int}} | admin, ops, readonly | 否 | 否 | 实时统计数据 |
| Dashboard | Dashboard | 脚本类型分布 | DASH-002 | /api/v1/dashboard/script-distribution | GET | - | {code:int, message:string, data:{python:int, shell:int}} | admin, ops, readonly | 否 | 否 | 按脚本类型统计 |
| Dashboard | Dashboard | 调度任务统计 | DASH-003 | /api/v1/dashboard/task-stats | GET | - | {code:int, message:string, data:{scheduled:int, triggered:int, manual:int}} | admin, ops, readonly | 否 | 否 | 按任务类型统计 |
| Dashboard | Dashboard | 最近执行记录 | DASH-004 | /api/v1/dashboard/recent-executions | GET | limit:int(默认:5) | {code:int, message:string, data:[{id:string, script_name:string, status:string, node:string, start_time:string, duration:string}]} | admin, ops, readonly | 否 | 否 | 返回最近N条记录 |

---

## 2. 脚本管理模块 (Script)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Script | ScriptManagement | 脚本列表展示 | SCRIPT-001 | /api/v1/scripts | GET | page:int(默认:1), size:int(默认:20), keyword:string, type:string, category_id:int | {code:int, message:string, data:{total:int, items:[{id:int, name:string, type:string, category_id:int, category_name:string, maintainer:string, updated_at:string}]}} | admin, ops, readonly | 是 | 否 | 支持多条件筛选 |
| Script | ScriptManagement | 脚本搜索 | SCRIPT-002 | /api/v1/scripts/search | GET | keyword:string(必填), page:int(默认:1), size:int(默认:20) | {code:int, message:string, data:{total:int, items:[{...}]}} | admin, ops, readonly | 是 | 否 | 模糊搜索脚本名称 |
| Script | ScriptDetail | 新建脚本 | SCRIPT-005 | /api/v1/scripts | POST | name:string(必填), type:string(必填, 枚举:Python/Shell), category_id:int(必填), content:text(必填), description:string, maintainer:string(必填) | {code:int, message:string, data:{id:int, name:string, type:string, category_id:int, content:string, created_at:string}} | admin, ops | 否 | 否 | 创建成功 |
| Script | ScriptDetail | 编辑脚本 | SCRIPT-006 | /api/v1/scripts/{id} | PUT | name:string, type:string, category_id:int, content:text, description:string, maintainer:string | {code:int, message:string, data:{id:int, name:string, type:string, category_id:int, content:string, updated_at:string}} | admin, ops | 否 | 否 | 更新成功 |
| Script | ScriptManagement | 删除脚本 | SCRIPT-007 | /api/v1/scripts/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | 需二次确认 |
| Script | ScriptDetail | 查看脚本详情 | SCRIPT-008 | /api/v1/scripts/{id} | GET | - | {code:int, message:string, data:{id:int, name:string, type:string, category_id:int, category_name:string, content:text, description:string, maintainer:string, created_by:string, created_at:string, updated_at:string}} | admin, ops, readonly | 否 | 否 | 返回完整脚本信息 |
| Script | ScriptExecuteDialog | 立即执行 | SCRIPT-009 | /api/v1/scripts/{id}/execute | POST | node_ids:array[int](必填), environment:string(必填, 枚举:dev/test/prod), parameters:object | {code:int, message:string, data:{execution_id:string, status:string, started_at:string}} | admin, ops | 否 | 否 | 返回执行ID |

---

## 3. 任务调度模块 (Task)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Task | TaskScheduling | 任务列表展示 | TASK-001 | /api/v1/scheduled-tasks | GET | page:int(默认:1), size:int(默认:20), keyword:string, status:string, environment:string | {code:int, message:string, data:{total:int, items:[{id:int, name:string, script_id:int, script_name:string, cron_expression:string, cron_description:string, enabled:boolean, next_run_time:string, last_run_time:string, last_run_status:string}]}} | admin, ops, readonly | 是 | 否 | 支持多条件筛选 |
| Task | TaskScheduling | 任务搜索 | TASK-002 | /api/v1/scheduled-tasks/search | GET | keyword:string(必填), page:int(默认:1), size:int(默认:20) | {code:int, message:string, data:{total:int, items:[{...}]}} | admin, ops, readonly | 是 | 否 | 模糊搜索任务名称 |
| Task | TaskScheduling | 任务统计 | TASK-004 | /api/v1/scheduled-tasks/stats | GET | - | {code:int, message:string, data:{total:int, enabled:int, disabled:int}} | admin, ops, readonly | 否 | 否 | 统计任务数量 |
| Task | TaskDialog | 新建任务 | TASK-005 | /api/v1/scheduled-tasks | POST | name:string(必填), script_id:int(必填), cron_expression:string(必填), cron_description:string, environment:string(必填, 枚举:dev/test/prod), execution_mode:string(默认:all, 枚举:all/specified), target_nodes:array[int] | {code:int, message:string, data:{id:int, name:string, script_id:int, cron_expression:string, enabled:boolean, next_run_time:string, created_at:string}} | admin, ops | 否 | 否 | 创建成功后自动计算下次执行时间 |
| Task | TaskDialog | 编辑任务 | TASK-006 | /api/v1/scheduled-tasks/{id} | PUT | name:string, script_id:int, cron_expression:string, cron_description:string, environment:string, execution_mode:string, target_nodes:array[int] | {code:int, message:string, data:{id:int, name:string, script_id:int, cron_expression:string, enabled:boolean, next_run_time:string, updated_at:string}} | admin, ops | 否 | 否 | 更新后重新计算下次执行时间 |
| Task | TaskScheduling | 删除任务 | TASK-007 | /api/v1/scheduled-tasks/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | 需二次确认 |
| Task | TaskScheduling | 启用/暂停任务 | TASK-008 | /api/v1/scheduled-tasks/{id}/toggle | PUT | enabled:boolean(必填) | {code:int, message:string, data:{id:int, enabled:boolean, next_run_time:string}} | admin, ops | 否 | 否 | 切换任务启用状态 |
| Task | TaskDialog | Cron表达式解析 | TASK-009 | /api/v1/scheduled-tasks/parse-cron | POST | cron_expression:string(必填) | {code:int, message:string, data:{description:string, next_runs:array[string]}} | admin, ops | readonly | 否 | 否 | 解析Cron表达式并返回描述和下次执行时间 |
| Task | TaskDialog | 获取可用节点列表 | TASK-010 | /api/v1/scheduled-tasks/available-nodes | GET | environment:string(必填, 枚举:dev/test/prod) | {code:int, message:string, data:[{id:int, name:string, ip:string, status:string}]} | admin, ops, readonly | 否 | 否 | 根据环境返回可用节点 |

---

## 4. 执行记录模块 (Execution)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Execution | ExecutionHistory | 记录列表展示 | EXEC-001 | /api/v1/executions | GET | page:int(默认:1), size:int(默认:20), keyword:string, status:string, environment:string | {code:int, message:string, data:{total:int, items:[{id:int, execution_id:string, script_name:string, executor:string, execution_type:string, environment:string, status:string, node_count:int, success_count:int, failed_count:int, duration:int, started_at:string, completed_at:string}]}} | admin, ops, readonly | 是 | 否 | 支持多条件筛选 |
| Execution | ExecutionHistory | 记录搜索 | EXEC-002 | /api/v1/executions/search | GET | keyword:string(必填), page:int(默认:1), size:int(默认:20) | {code:int, message:string, data:{total:int, items:[{...}]}} | admin, ops, readonly | 是 | 否 | 模糊搜索脚本名称或执行人 |
| Execution | ExecutionHistory | 统计信息 | EXEC-003 | /api/v1/executions/stats | GET | - | {code:int, message:string, data:{total:int, success:int, failed:int, success_rate:float}} | admin, ops, readonly | 否 | 否 | 统计执行记录 |
| Execution | LogDetail | 查看日志 | EXEC-004 | /api/v1/executions/{execution_id}/logs | GET | node_id:int | {code:int, message:string, data:{execution_id:string, node_id:int, node_name:string, status:string, log_content:text, exit_code:int, duration:int, started_at:string, completed_at:string}} | admin, ops, readonly | 否 | 否 | 查看指定节点的执行日志 |
| Execution | LogDetail | 日志下载 | EXEC-005 | /api/v1/executions/{execution_id}/logs/download | GET | node_id:int, format:string(默认:txt) | {code:int, message:string, data:{download_url:string}} | admin, ops, readonly | 否 | 否 | 返回日志下载链接 |
| Execution | ExecutionHistory | 执行详情 | EXEC-006 | /api/v1/executions/{execution_id} | GET | - | {code:int, message:string, data:{id:int, execution_id:string, script_id:int, script_name:string, task_id:int, executor:string, execution_type:string, environment:string, status:string, node_count:int, success_count:int, failed_count:int, duration:int, error_message:string, started_at:string, completed_at:string, node_executions:[{node_id:int, node_name:string, status:string, duration:int}]}} | admin, ops, readonly | 否 | 否 | 返回执行详情和所有节点执行情况 |

---

## 5. 节点管理模块 (Node)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Node | NodeManagement | 节点列表展示 | NODE-001 | /api/v1/nodes | GET | page:int(默认:1), size:int(默认:20), keyword:string, environment:string, status:string | {code:int, message:string, data:{total:int, items:[{id:int, name:string, ip:string, environment:string, tags:array[string], status:string, last_heartbeat:string, cpu_usage:string, memory_usage:string, disk_usage:string}]}} | admin, ops, readonly | 是 | 否 | 支持多条件筛选 |
| Node | NodeManagement | 节点搜索 | NODE-002 | /api/v1/nodes/search | GET | keyword:string(必填), page:int(默认:1), size:int(默认:20) | {code:int, message:string, data:{total:int, items:[{...}]}} | admin, ops, readonly | 是 | 否 | 模糊搜索节点名称或IP |
| Node | NodeManagement | 节点统计 | NODE-003 | /api/v1/nodes/stats | GET | - | {code:int, message:string, data:{total:int, online:int, offline:int, online_rate:float}} | admin, ops, readonly | 否 | 否 | 统计节点数量 |
| Node | NodeFormDialog | 新增节点 | NODE-004 | /api/v1/nodes | POST | name:string(必填), ip:string(必填), environment:string(必填, 枚举:dev/test/prod), tags:array[string] | {code:int, message:string, data:{id:int, name:string, ip:string, environment:string, tags:array[string], status:string, created_at:string}} | admin | 否 | 否 | 创建成功后节点状态为offline |
| Node | NodeFormDialog | 编辑节点 | NODE-005 | /api/v1/nodes/{id} | PUT | name:string, ip:string, environment:string, tags:array[string] | {code:int, message:string, data:{id:int, name:string, ip:string, environment:string, tags:array[string], updated_at:string}} | admin | 否 | 否 | 更新节点信息 |
| Node | NodeManagement | 删除节点 | NODE-006 | /api/v1/nodes/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | 需二次确认 |
| Node | NodeDetail | 查看节点详情 | NODE-007 | /api/v1/nodes/{id} | GET | - | {code:int, message:string, data:{id:int, name:string, ip:string, environment:string, tags:array[string], status:string, last_heartbeat:string, cpu_usage:string, memory_usage:string, disk_usage:string, created_at:string, updated_at:string}} | admin, ops, readonly | 否 | 否 | 返回节点详细信息 |
| Node | NodeDetail | 节点执行历史 | NODE-008 | /api/v1/nodes/{id}/executions | GET | page:int(默认:1), size:int(默认:20), status:string | {code:int, message:string, data:{total:int, items:[{execution_id:string, script_name:string, status:string, duration:int, started_at:string}]}} | admin, ops, readonly | 是 | 否 | 查看节点执行历史 |

---

## 6. 用户权限模块 (User)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| User | UserPermissionManagement | 用户列表展示 | USER-001 | /api/v1/users | GET | page:int(默认:1), size:int(默认:20), keyword:string, role:string, status:string | {code:int, message:string, data:{total:int, items:[{id:int, username:string, email:string, role:string, status:string, created_at:string}]}} | admin | 是 | 否 | 支持多条件筛选 |
| User | UserPermissionManagement | 新增用户 | USER-002 | /api/v1/users | POST | username:string(必填), password:string(必填), email:string, role:string(默认:readonly, 枚举:admin/ops/readonly) | {code:int, message:string, data:{id:int, username:string, email:string, role:string, status:string, created_at:string}} | admin | 否 | 否 | 密码需符合密码策略 |
| User | UserPermissionManagement | 编辑用户 | USER-003 | /api/v1/users/{id} | PUT | email:string, role:string, status:string | {code:int, message:string, data:{id:int, username:string, email:string, role:string, status:string, updated_at:string}} | admin | 否 | 否 | 不允许修改用户名和密码 |
| User | UserPermissionManagement | 删除用户 | USER-004 | /api/v1/users/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | 需二次确认，不允许删除自己 |
| User | UserPermissionManagement | 重置密码 | USER-003 | /api/v1/users/{id}/reset-password | PUT | password:string(必填) | {code:int, message:string, data:null} | admin | 否 | 否 | 重置用户密码 |
| User | UserPermissionManagement | 修改密码 | USER-003 | /api/v1/users/me/change-password | PUT | old_password:string(必填), new_password:string(必填) | {code:int, message:string, data:null} | admin, ops, readonly | 否 | 否 | 用户修改自己的密码 |

---

## 7. 脚本分类模块 (Category)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Category | SystemSettings | 分类列表展示 | CATEGORY-001 | /api/v1/script-categories | GET | - | {code:int, message:string, data:[{id:int, name:string, description:string, color:string, sort_order:int, script_count:int}]} | admin | 否 | 否 | 返回所有分类，包含脚本数量 |
| Category | SystemSettings | 新增分类 | CATEGORY-002 | /api/v1/script-categories | POST | name:string(必填), description:string, color:string(默认:blue), sort_order:int(默认:0) | {code:int, message:string, data:{id:int, name:string, description:string, color:string, sort_order:int, created_at:string}} | admin | 否 | 否 | 创建脚本分类 |
| Category | SystemSettings | 编辑分类 | CATEGORY-003 | /api/v1/script-categories/{id} | PUT | name:string, description:string, color:string, sort_order:int | {code:int, message:string, data:{id:int, name:string, description:string, color:string, sort_order:int, updated_at:string}} | admin | 否 | 否 | 更新分类信息 |
| Category | SystemSettings | 删除分类 | CATEGORY-004 | /api/v1/script-categories/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | 需二次确认，不允许删除有脚本的分类 |

---

## 8. 系统配置模块 (Config)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Config | SystemSettings | 获取系统配置 | SYS-001 | /api/v1/system-configs | GET | category:string | {code:int, message:string, data:[{id:int, config_key:string, config_value:string, config_type:string, description:string, category:string}]}} | admin | 否 | 否 | 根据分类返回配置 |
| Config | SystemSettings | 更新系统配置 | SYS-001 | /api/v1/system-configs/{id} | PUT | config_value:string(必填) | {code:int, message:string, data:{id:int, config_key:string, config_value:string, updated_at:string}} | admin | 否 | 否 | 更新单个配置项 |
| Config | SystemSettings | 批量更新配置 | SYS-001 | /api/v1/system-configs/batch | PUT | configs:array[object](必填) | {code:int, message:string, data:{updated_count:int}} | admin | 否 | 是 | 批量更新多个配置项 |

---

## 9. 认证授权模块 (Auth)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Auth | - | 用户登录 | - | /api/v1/auth/login | POST | username:string(必填), password:string(必填) | {code:int, message:string, data:{token:string, user:{id:int, username:string, email:string, role:string}}} | 公开 | 否 | 否 | 返回JWT Token |
| Auth | - | 用户登出 | - | /api/v1/auth/logout | POST | - | {code:int, message:string, data:null} | admin, ops, readonly | 否 | 否 | 清除Token |
| Auth | - | 刷新Token | - | /api/v1/auth/refresh | POST | refresh_token:string(必填) | {code:int, message:string, data:{token:string, refresh_token:string}} | 公开 | 否 | 否 | 刷新访问Token |
| Auth | - | 获取当前用户信息 | - | /api/v1/auth/me | GET | - | {code:int, message:string, data:{id:int, username:string, email:string, role:string, status:string}} | admin, ops, readonly | 否 | 否 | 返回当前登录用户信息 |

---

## 10. Agent通信模块 (Agent)

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Agent | - | Agent注册 | - | /api/v1/agent/register | POST | node_name:string(必填), ip:string(必填), environment:string(必填), tags:array[string] | {code:int, message:string, data:{node_id:int, node_token:string}} | 公开 | 否 | 否 | Agent节点注册到管理节点 |
| Agent | - | Agent心跳 | - | /api/v1/agent/heartbeat | POST | node_id:int(必填), node_token:string(必填), cpu_usage:string, memory_usage:string, disk_usage:string | {code:int, message:string, data:null} | 公开 | 否 | 否 | Agent定期上报心跳 |
| Agent | - | 接收任务 | - | /api/v1/agent/tasks | GET | node_id:int(必填), node_token:string(必填) | {code:int, message:string, data:[{execution_id:string, script_id:int, script_content:text, parameters:object}]} | 公开 | 否 | 否 | Agent获取待执行任务 |
| Agent | - | 上报执行结果 | - | /api/v1/agent/tasks/{execution_id}/result | POST | node_id:int(必填), node_token:string(必填), status:string(必填), exit_code:int, log_content:text, error_message:string, duration:int | {code:int, message:string, data:null} | 公开 | 否 | 否 | Agent上报任务执行结果 |

---

## 接口数量统计

### 按模块统计

| 模块 | 接口数量 |
|------|---------|
| Dashboard | 4 |
| Script | 7 |
| Task | 9 |
| Execution | 6 |
| Node | 8 |
| User | 6 |
| Category | 4 |
| Config | 3 |
| Auth | 4 |
| Agent | 4 |
| **总计** | **55** |

### 按HTTP方法统计

| HTTP方法 | 接口数量 |
|---------|---------|
| GET | 27 |
| POST | 13 |
| PUT | 10 |
| DELETE | 5 |
| **总计** | **55** |

### 按权限角色统计

| 权限角色 | 可访问接口数量 |
|---------|---------------|
| admin | 59 |
| ops | 34 |
| readonly | 28 |
| 公开 | 8 |

### 按操作类型统计

| 操作类型 | 接口数量 |
|---------|---------|
| 查询 (GET) | 28 |
| 创建 (POST) | 16 |
| 更新 (PUT) | 10 |
| 删除 (DELETE) | 5 |
| **总计** | **59** |

---

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "error message",
  "data": null
}
```

### 分页响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 20,
    "items": []
  }
}
```

---

## 统一错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 接口设计规范

### RESTful规范

- URL使用名词复数形式
- 使用HTTP动词表示操作类型
- 使用路径参数标识资源
- 使用查询参数进行筛选和分页

### 分页规范

- `page`: 页码，从1开始
- `size`: 每页数量，默认20
- 响应包含`total`、`page`、`size`、`items`字段

### 批量操作规范

- 批量接口使用`/batch`后缀
- 请求参数使用数组形式
- 响应返回操作数量统计

### 状态字段规范

- `pending`: 待处理
- `running`: 运行中
- `success`: 成功
- `failed`: 失败
- `timeout`: 超时
- `disabled`: 禁用
- `active`: 启用
- `inactive`: 停用
- `online`: 在线
- `offline`: 离线

---

## 认证授权

### Token认证

- 使用JWT Token进行认证
- Token在请求头中传递：`Authorization: Bearer {token}`
- Token有效期：24小时
- Refresh Token有效期：7天

### 权限控制

- 基于角色的访问控制（RBAC）
- 角色定义：admin、ops、readonly
- 接口权限在接口映射表中标注

---

## 注意事项

1. 所有时间字段使用ISO 8601格式：`YYYY-MM-DD HH:mm:ss`
2. 所有ID字段使用整数类型
3. 所有布尔值使用小写：`true`/`false`
4. 所有枚举值使用小写
5. 所有字符串使用UTF-8编码
6. 所有分页接口默认返回20条记录
7. 所有批量操作接口需要二次确认
8. 所有删除操作需要二次确认
9. 所有敏感操作需要记录审计日志
10. 所有接口返回统一的响应格式
