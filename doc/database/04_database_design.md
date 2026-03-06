# 运维任务调度系统 - 数据库设计文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 数据库设计文档 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-02-27 |
| 文档状态 | 初稿 |
| 数据库类型 | SQLite |

---

## 1. 数据库概述

### 1.1 数据库选型

本系统采用SQLite作为数据库，原因如下：

- **轻量级**：无需独立数据库服务器，部署简单
- **零配置**：开箱即用，适合中小规模应用
- **事务支持**：支持ACID事务，保证数据一致性
- **性能优秀**：对于读多写少的场景性能足够
- **跨平台**：支持Windows、Linux、macOS等平台

### 1.2 SQLite特性优化

- **WAL模式**：启用Write-Ahead Logging模式，提高并发性能
- **事务处理**：所有写操作使用事务，保证数据一致性
- **索引优化**：为常用查询字段创建索引
- **定期VACUUM**：定期清理数据库，回收空间

---

## 2. 数据库表设计

### 2.1 用户表 (users)

存储系统用户信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 用户ID |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希（bcrypt） |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'readonly' | 角色：admin/ops/readonly |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 状态：active/inactive |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_users_username`: username
- `idx_users_email`: email

---

### 2.2 脚本分类表 (script_categories)

存储脚本分类信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 分类ID |
| name | VARCHAR(50) | NOT NULL, UNIQUE | 分类名称 |
| description | TEXT | 分类描述 | |
| color | VARCHAR(20) | NOT NULL, DEFAULT 'blue' | 颜色标识 |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 排序序号 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_categories_name`: name

---

### 2.3 脚本表 (scripts)

存储脚本信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 脚本ID |
| name | VARCHAR(100) | NOT NULL | 脚本名称 |
| type | VARCHAR(20) | NOT NULL | 类型：Python/Shell |
| category_id | INTEGER | NOT NULL, FOREIGN KEY → script_categories.id | 分类ID |
| content | TEXT | NOT NULL | 脚本内容 |
| description | TEXT | 脚本描述 | |
| maintainer | VARCHAR(50) | NOT NULL | 维护人 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 状态：active/inactive |
| created_by | INTEGER | FOREIGN KEY → users.id | 创建人 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_scripts_name`: name
- `idx_scripts_type`: type
- `idx_scripts_category_id`: category_id
- `idx_scripts_status`: status

**外键约束**：
- `fk_scripts_category`: category_id → script_categories(id)
- `fk_scripts_creator`: created_by → users(id)

---

### 2.4 节点表 (nodes)

存储执行节点信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 节点ID |
| name | VARCHAR(100) | NOT NULL, UNIQUE | 节点名称 |
| ip | VARCHAR(50) | NOT NULL | IP地址 |
| environment | VARCHAR(20) | NOT NULL | 环境：dev/test/prod |
| tags | TEXT | 标签（JSON数组） | |
| node_token | VARCHAR(64) | NOT NULL | 节点认证Token |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'offline' | 状态：online/offline |
| last_heartbeat | DATETIME | 最后心跳时间 | |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_nodes_name`: name
- `idx_nodes_ip`: ip
- `idx_nodes_environment`: environment
- `idx_nodes_status`: status

---

### 2.5 注册Token表 (registration_tokens)

存储Agent预注册Token信息，用于Token认证注册流程。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Token ID |
| token | VARCHAR(64) | NOT NULL, UNIQUE | Token值（32字符，16字节十六进制） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending（待使用）/ used（已使用）/ expired（已过期） |
| expires_at | DATETIME | NOT NULL | 过期时间（默认24小时） |
| used_at | DATETIME | 使用时间 | Token被使用的时间 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_tokens_token`: token
- `idx_tokens_status`: status

**初始化**：系统首次启动时自动生成一个初始Token，有效期24小时。

---

### 2.6 调度任务表 (scheduled_tasks)

存储调度任务信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 任务ID |
| name | VARCHAR(100) | NOT NULL | 任务名称 |
| script_id | INTEGER | NOT NULL, FOREIGN KEY → scripts.id | 关联脚本ID |
| cron_expression | VARCHAR(100) | NOT NULL | Cron表达式 |
| cron_description | VARCHAR(200) | Cron描述 | |
| environment | VARCHAR(20) | NOT NULL | 执行环境：dev/test/prod |
| execution_mode | VARCHAR(20) | NOT NULL, DEFAULT 'all' | 执行模式：all/specified |
| target_nodes | TEXT | 目标节点（JSON数组） | |
| enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否启用 |
| last_run_time | DATETIME | 上次执行时间 | |
| last_run_status | VARCHAR(20) | 上次执行状态 | |
| next_run_time | DATETIME | 下次执行时间 | |
| created_by | INTEGER | FOREIGN KEY → users.id | 创建人 |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_tasks_name`: name
- `idx_tasks_script_id`: script_id
- `idx_tasks_enabled`: enabled
- `idx_tasks_next_run_time`: next_run_time

**外键约束**：
- `fk_tasks_script`: script_id → scripts(id)
- `fk_tasks_creator`: created_by → users(id)

---

### 2.6 执行记录表 (executions)

存储脚本执行记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 执行ID |
| execution_id | VARCHAR(50) | NOT NULL, UNIQUE | 执行唯一标识 |
| script_id | INTEGER | NOT NULL, FOREIGN KEY → scripts.id | 脚本ID |
| script_name | VARCHAR(100) | NOT NULL | 脚本名称（冗余） |
| task_id | INTEGER | FOREIGN KEY → scheduled_tasks.id | 关联任务ID |
| executor | VARCHAR(50) | NOT NULL | 执行人 |
| execution_type | VARCHAR(20) | NOT NULL | 执行类型：manual/scheduled |
| environment | VARCHAR(20) | NOT NULL | 执行环境：dev/test/prod |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending/running/success/failed/timeout |
| node_count | INTEGER | NOT NULL, DEFAULT 0 | 执行节点数 |
| success_count | INTEGER | NOT NULL, DEFAULT 0 | 成功节点数 |
| failed_count | INTEGER | NOT NULL, DEFAULT 0 | 失败节点数 |
| duration | INTEGER | 执行时长（秒） | |
| error_message | TEXT | 错误信息 | |
| started_at | DATETIME | 开始时间 | |
| completed_at | DATETIME | 完成时间 | |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_executions_execution_id`: execution_id
- `idx_executions_script_id`: script_id
- `idx_executions_task_id`: task_id
- `idx_executions_status`: status
- `idx_executions_started_at`: started_at
- `idx_executions_executor`: executor

**外键约束**：
- `fk_executions_script`: script_id → scripts(id)
- `fk_executions_task`: task_id → scheduled_tasks(id)

---

### 2.7 节点执行记录表 (node_executions)

存储单个节点的执行记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 记录ID |
| execution_id | VARCHAR(50) | NOT NULL, FOREIGN KEY → executions.execution_id | 执行ID |
| node_id | INTEGER | NOT NULL, FOREIGN KEY → nodes.id | 节点ID |
| node_name | VARCHAR(100) | NOT NULL | 节点名称（冗余） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending/running/success/failed/timeout |
| exit_code | INTEGER | 退出码 | |
| duration | INTEGER | 执行时长（秒） | |
| log_content | TEXT | 执行日志 | |
| error_message | TEXT | 错误信息 | |
| started_at | DATETIME | 开始时间 | |
| completed_at | DATETIME | 完成时间 | |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_node_executions_execution_id`: execution_id
- `idx_node_executions_node_id`: node_id
- `idx_node_executions_status`: status

**外键约束**：
- `fk_node_executions_execution`: execution_id → executions(execution_id)
- `fk_node_executions_node`: node_id → nodes(id)

**不可变设计**：节点执行记录一旦创建不可修改或删除

---

### 2.8 系统配置表 (system_configs)

存储系统配置参数。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 配置ID |
| config_key | VARCHAR(100) | NOT NULL, UNIQUE | 配置键 |
| config_value | TEXT | NOT NULL | 配置值 |
| config_type | VARCHAR(20) | NOT NULL, DEFAULT 'string' | 配置类型：string/int/bool/json |
| description | TEXT | 配置描述 | |
| category | VARCHAR(50) | NOT NULL | 配置分类 | |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**索引**：
- `idx_system_configs_key`: config_key
- `idx_system_configs_category`: category

---

### 2.9 操作日志表 (audit_logs)

存储系统操作审计日志。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 日志ID |
| user_id | INTEGER | FOREIGN KEY → users.id | 用户ID |
| username | VARCHAR(50) | NOT NULL | 用户名（冗余） |
| action | VARCHAR(50) | NOT NULL | 操作类型 |
| resource_type | VARCHAR(50) | NOT NULL | 资源类型 |
| resource_id | VARCHAR(50) | 资源ID | |
| details | TEXT | 操作详情（JSON） | |
| ip_address | VARCHAR(50) | IP地址 | |
| user_agent | TEXT | User-Agent | |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**：
- `idx_audit_logs_user_id`: user_id
- `idx_audit_logs_action`: action
- `idx_audit_logs_resource_type`: resource_type
- `idx_audit_logs_created_at`: created_at

**外键约束**：
- `fk_audit_logs_user`: user_id → users(id)

**不可变设计**：审计日志一旦创建不可修改或删除

---

### 2.10 通知记录表 (notifications)

存储通知发送记录。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | 通知ID |
| notification_type | VARCHAR(20) | NOT NULL | 通知类型：email/webhook |
| recipient | VARCHAR(200) | NOT NULL | 接收人 |
| subject | VARCHAR(200) | 主题 | |
| content | TEXT | 通知内容 | |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending/sent/failed |
| error_message | TEXT | 错误信息 | |
| related_execution_id | VARCHAR(50) | 关联执行ID | |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| sent_at | DATETIME | 发送时间 | |

**索引**：
- `idx_notifications_type`: notification_type
- `idx_notifications_status`: status
- `idx_notifications_created_at`: created_at

---

## 3. ER图

```
┌─────────────┐                          ┌─────────────┐
│    users    │                          │    nodes    │
├─────────────┤                          ├─────────────┤
│ id (PK)     │                          │ id (PK)     │
│ username    │                          │ name        │
│ password    │                          │ ip          │
│ email       │                          │ environment │
│ role        │                          │ status      │
│ status      │                          │ last_heartbeat│
└──────┬──────┘                          │ created_at  │
       │                                 └─────────────┘
       │
       │
       ▼
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   scripts   │       │ scheduled_tasks │       │  executions │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)         │       │ id (PK)     │
│ name        │       │ name            │       │ execution_id│
│ type        │       │ script_id (FK)  │◄──────│ script_id   │
│ category_id │◄──────│ cron_expression │       │ task_id (FK)│
│ content     │       │ enabled         │       │ status      │
│ maintainer  │       │ next_run_time   │       │ started_at  │
│ created_by  │◄──────│ created_by (FK) │◄──────│ created_at  │
└──────┬──────┘       └─────────────────┘       └──────┬──────┘
       │                                                   │
       │                                                   ▼
       │                                          ┌─────────────────┐
       │                                          │ node_executions │
       │                                          ├─────────────────┤
       │                                          │ id (PK)         │
       │                                          │ execution_id(FK) │◄──────
       │                                          │ node_id (FK)    │◄──────
       │                                          │ status          │
       │                                          │ log_content     │
       │                                          │ created_at      │
       │                                          └─────────────────┘
       ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│script_categories│       │ system_configs  │       │  audit_logs     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ name            │       │ config_key      │       │ user_id (FK)    │◄──────
│ description     │       │ config_value    │       │ action          │
│ color           │       │ config_type     │       │ resource_type   │
│ created_at      │       │ category        │       │ created_at      │
```
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ notifications   │
                                                  ├─────────────────┤
                                                  │ id (PK)         │
                                                  │ notification_type│
                                                  │ recipient       │
                                                  │ status          │
                                                  │ created_at      │
                                                  └─────────────────┘
```

---

## 4. 数据字典

### 4.1 用户角色 (role)

| 值 | 说明 |
|----|------|
| admin | 系统管理员 |
| ops | 运维工程师 |
| readonly | 只读用户 |

### 4.2 用户状态 (status)

| 值 | 说明 |
|----|------|
| active | 激活 |
| inactive | 停用 |

### 4.3 脚本类型 (type)

| 值 | 说明 |
|----|------|
| Python | Python脚本 |
| Shell | Shell脚本 |

### 4.4 脚本状态 (status)

| 值 | 说明 |
|----|------|
| active | 启用 |
| inactive | 停用 |

### 4.5 节点环境 (environment)

| 值 | 说明 |
|----|------|
| dev | 开发环境 |
| test | 测试环境 |
| prod | 生产环境 |

### 4.6 节点状态 (status)

| 值 | 说明 |
|----|------|
| online | 在线 |
| offline | 离线 |

### 4.7 执行模式 (execution_mode)

| 值 | 说明 |
|----|------|
| all | 所有节点 |
| specified | 指定节点 |

### 4.8 执行状态 (status)

| 值 | 说明 |
|----|------|
| pending | 等待执行 |
| running | 执行中 |
| success | 执行成功 |
| failed | 执行失败 |
| timeout | 执行超时 |

### 4.9 执行类型 (execution_type)

| 值 | 说明 |
|----|------|
| manual | 手动执行 |
| scheduled | 定时执行 |

### 4.10 通知类型 (notification_type)

| 值 | 说明 |
|----|------|
| email | 邮件通知 |
| webhook | Webhook通知 |

### 4.11 通知状态 (status)

| 值 | 说明 |
|----|------|
| pending | 待发送 |
| sent | 已发送 |
| failed | 发送失败 |

### 4.12 配置类型 (config_type)

| 值 | 说明 |
|----|------|
| string | 字符串 |
| int | 整数 |
| bool | 布尔值 |
| json | JSON对象 |

---

## 5. 数据完整性约束

### 5.1 外键约束

所有外键关系在删除时采用`ON DELETE RESTRICT`策略，防止误删除关联数据。

### 5.2 唯一性约束

- `users.username`: 用户名唯一
- `users.email`: 邮箱唯一
- `script_categories.name`: 分类名称唯一
- `nodes.name`: 节点名称唯一
- `system_configs.config_key`: 配置键唯一
- `executions.execution_id`: 执行ID唯一

### 5.3 非空约束

所有标记为`NOT NULL`的字段必须有值。

### 5.4 默认值约束

- 时间字段默认使用`CURRENT_TIMESTAMP`
- 布尔字段默认值为`FALSE`或`TRUE`
- 状态字段有明确的默认值

---

## 6. 索引优化

### 6.1 查询优化索引

为以下常用查询场景创建索引：

1. **用户查询**：按用户名、邮箱查询
2. **脚本查询**：按名称、类型、分类、状态查询
3. **节点查询**：按名称、IP、环境、状态查询
4. **任务查询**：按名称、启用状态、下次执行时间查询
5. **执行记录查询**：按脚本ID、状态、开始时间查询
6. **审计日志查询**：按用户ID、操作类型、创建时间查询

### 6.2 复合索引

为多字段查询创建复合索引：

- `idx_script_versions_version`: script_id, version
- `idx_executions_started_at`: started_at DESC
- `idx_audit_logs_created_at`: created_at DESC

---

## 7. 数据备份与恢复

### 7.1 备份策略

- **全量备份**：每天凌晨2点执行全量备份
- **增量备份**：每小时执行增量备份
- **备份保留**：保留最近30天的备份文件

### 7.2 恢复策略

- 支持从任意备份点恢复
- 恢复前自动备份当前数据库
- 提供恢复验证功能

---

## 8. 数据迁移

### 8.1 版本管理

使用数据库迁移工具（如Alembic）管理数据库版本变更。

### 8.2 迁移脚本

每个数据库变更都需要创建对应的迁移脚本，包括：

- 升级脚本（upgrade）
- 降级脚本（downgrade）

---

## 9. 性能优化建议

### 9.1 SQLite优化

1. **启用WAL模式**：提高并发性能
2. **调整缓存大小**：根据内存大小调整PRAGMA cache_size
3. **使用事务**：批量操作使用事务
4. **定期VACUUM**：清理数据库碎片

### 9.2 查询优化

1. **避免SELECT ***：只查询需要的字段
2. **使用LIMIT**：分页查询使用LIMIT
3. **合理使用索引**：为常用查询字段创建索引
4. **避免全表扫描**：确保查询使用索引

---

## 10. 安全考虑

### 10.1 敏感数据保护

- 用户密码使用bcrypt加密存储
- 不在日志中记录敏感信息
- 数据库文件访问权限控制

### 10.2 SQL注入防护

- 使用参数化查询
- 避免拼接SQL语句
- 输入数据验证和过滤

---

## 11. 附录

### 11.1 初始数据

系统初始化时需要插入的初始数据：

1. **默认用户**：admin/admin123（首次登录需修改密码）
2. **默认脚本分类**：监控告警、维护清理、备份恢复、部署发布、故障处理、配置管理
3. **系统配置**：默认系统参数配置

### 11.2 数据库文件位置

- 开发环境：`./data/ops_scheduler.db`
- 生产环境：`/var/lib/ops_scheduler/data/ops_scheduler.db`

### 11.3 数据库连接配置

```python
DATABASE_URL = "sqlite:///./data/ops_scheduler.db"
```

启用WAL模式：
```python
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  # 64MB cache
```
