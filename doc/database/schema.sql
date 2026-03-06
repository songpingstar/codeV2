-- 运维任务调度系统 - 数据库表结构
-- 版本: v1.0.0
-- 创建日期: 2026-02-27

-- 启用WAL模式
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'readonly' CHECK(role IN ('admin', 'ops', 'readonly')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. 脚本分类表 (script_categories)
-- ============================================
CREATE TABLE IF NOT EXISTS script_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) NOT NULL DEFAULT 'blue',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON script_categories(name);

-- ============================================
-- 3. 脚本表 (scripts)
-- ============================================
CREATE TABLE IF NOT EXISTS scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK(type IN ('Python', 'Shell')),
    category_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    maintainer VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_by INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES script_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scripts_name ON scripts(name);
CREATE INDEX IF NOT EXISTS idx_scripts_type ON scripts(type);
CREATE INDEX IF NOT EXISTS idx_scripts_category_id ON scripts(category_id);
CREATE INDEX IF NOT EXISTS idx_scripts_status ON scripts(status);

-- ============================================
-- 4. 节点表 (nodes)
-- ============================================
CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    ip VARCHAR(50) NOT NULL,
    environment VARCHAR(20) NOT NULL CHECK(environment IN ('dev', 'test', 'prod')),
    tags TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline')),
    last_heartbeat DATETIME,
    cpu_usage VARCHAR(10),
    memory_usage VARCHAR(10),
    disk_usage VARCHAR(10),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name);
CREATE INDEX IF NOT EXISTS idx_nodes_ip ON nodes(ip);
CREATE INDEX IF NOT EXISTS idx_nodes_environment ON nodes(environment);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON nodes(status);

-- ============================================
-- 5. 注册Token表 (registration_tokens)
-- 用于Agent预注册认证
-- ============================================
CREATE TABLE IF NOT EXISTS registration_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'used', 'expired')),
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_token ON registration_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON registration_tokens(status);

-- ============================================
-- 6. 调度任务表 (scheduled_tasks)
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    script_id INTEGER NOT NULL,
    cron_expression VARCHAR(100) NOT NULL,
    cron_description VARCHAR(200),
    environment VARCHAR(20) NOT NULL CHECK(environment IN ('dev', 'test', 'prod')),
    execution_mode VARCHAR(20) NOT NULL DEFAULT 'all' CHECK(execution_mode IN ('all', 'specified')),
    target_nodes TEXT,
    enabled BOOLEAN NOT NULL DEFAULT 1,
    last_run_time DATETIME,
    last_run_status VARCHAR(20) CHECK(last_run_status IN ('success', 'failed', 'timeout')),
    next_run_time DATETIME,
    created_by INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_name ON scheduled_tasks(name);
CREATE INDEX IF NOT EXISTS idx_tasks_script_id ON scheduled_tasks(script_id);
CREATE INDEX IF NOT EXISTS idx_tasks_enabled ON scheduled_tasks(enabled);
CREATE INDEX IF NOT EXISTS idx_tasks_next_run_time ON scheduled_tasks(next_run_time);

-- ============================================
-- 6. 执行记录表 (executions)
-- ============================================
CREATE TABLE IF NOT EXISTS executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(50) NOT NULL UNIQUE,
    script_id INTEGER NOT NULL,
    script_name VARCHAR(100) NOT NULL,
    task_id INTEGER,
    executor VARCHAR(50) NOT NULL,
    execution_type VARCHAR(20) NOT NULL CHECK(execution_type IN ('manual', 'scheduled')),
    environment VARCHAR(20) NOT NULL CHECK(environment IN ('dev', 'test', 'prod')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'success', 'failed', 'timeout')),
    node_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    duration INTEGER,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE RESTRICT,
    FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_executions_execution_id ON executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_executions_script_id ON executions(script_id);
CREATE INDEX IF NOT EXISTS idx_executions_task_id ON executions(task_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_executor ON executions(executor);

-- ============================================
-- 7. 节点执行记录表 (node_executions)
-- ============================================
CREATE TABLE IF NOT EXISTS node_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(50) NOT NULL,
    node_id INTEGER NOT NULL,
    node_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'success', 'failed', 'timeout')),
    exit_code INTEGER,
    duration INTEGER,
    log_content TEXT,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES executions(execution_id) ON DELETE CASCADE,
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_node_executions_execution_id ON node_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_node_id ON node_executions(node_id);
CREATE INDEX IF NOT EXISTS idx_node_executions_status ON node_executions(status);

-- ============================================
-- 8. 系统配置表 (system_configs)
-- ============================================
CREATE TABLE IF NOT EXISTS system_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK(config_type IN ('string', 'int', 'bool', 'json')),
    description TEXT,
    category VARCHAR(50) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_system_configs_category ON system_configs(category);

-- ============================================
-- 9. 操作日志表 (audit_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- 10. 通知记录表 (notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_type VARCHAR(20) NOT NULL CHECK(notification_type IN ('email', 'webhook')),
    recipient VARCHAR(200) NOT NULL,
    subject VARCHAR(200),
    content TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    related_execution_id VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 初始数据
-- ============================================

-- 插入默认用户 (admin/admin123)
INSERT INTO users (username, password_hash, email, role, status) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYxq7qYqYqY', 'admin@example.com', 'admin', 'active');

-- 插入默认脚本分类（系统预设，管理员可新增、编辑、删除）
INSERT INTO script_categories (name, description, color, sort_order) VALUES
('监控告警', '系统监控和告警相关脚本', 'blue', 1),
('维护清理', '日常维护和清理任务脚本', 'green', 2),
('备份恢复', '数据备份和恢复脚本', 'purple', 3),
('部署发布', '应用部署和发布脚本', 'orange', 4),
('故障处理', '故障响应和处理脚本', 'red', 5),
('配置管理', '配置文件管理脚本', 'indigo', 6);

-- 插入默认系统配置
INSERT INTO system_configs (config_key, config_value, config_type, description, category) VALUES
('system.name', '运维任务调度系统', 'string', '系统名称', 'system'),
('system.max_users', '50', 'int', '最大用户数', 'system'),
('system.session_timeout', '30', 'int', '会话超时时间（分钟）', 'system'),
('system.log_retention', '90', 'int', '日志保留天数', 'system'),
('system.backup_enabled', 'true', 'bool', '是否启用数据备份', 'system'),
('system.backup_time', '02:00', 'string', '数据备份时间', 'system'),
('security.password_policy', 'medium', 'string', '密码策略（low/medium/high）', 'security'),
('security.login_attempts', '5', 'int', '最大登录尝试次数', 'security'),
('security.lockout_duration', '30', 'int', '账户锁定时长（分钟）', 'security'),
('security.ip_whitelist', '', 'string', 'IP白名单（逗号分隔）', 'security'),
('security.two_factor_enabled', 'false', 'bool', '是否启用双因素认证', 'security'),
('execution.default_shell', 'bash', 'string', '默认Shell', 'execution'),
('execution.script_timeout', '3600', 'int', '脚本超时时间（秒）', 'execution'),
('execution.max_concurrent', '10', 'int', '最大并发执行数', 'execution'),
('execution.work_dir', '/opt/ops/scripts', 'string', '工作目录', 'execution'),
('execution.log_level', 'info', 'string', '日志输出级别', 'execution'),
('execution.log_file_size', '100mb', 'string', '单个日志文件大小限制', 'execution'),
('notification.email_enabled', 'true', 'bool', '是否启用邮件通知', 'notification'),
('notification.smtp_server', 'smtp.example.com', 'string', 'SMTP服务器', 'notification'),
('notification.smtp_port', '587', 'string', 'SMTP端口', 'notification'),
('notification.smtp_user', 'noreply@example.com', 'string', '发件人邮箱', 'notification'),
('notification.webhook_url', '', 'string', 'Webhook URL', 'notification');

-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_script_categories_timestamp
AFTER UPDATE ON script_categories
FOR EACH ROW
BEGIN
    UPDATE script_categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_scripts_timestamp
AFTER UPDATE ON scripts
FOR EACH ROW
BEGIN
    UPDATE scripts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_nodes_timestamp
AFTER UPDATE ON nodes
FOR EACH ROW
BEGIN
    UPDATE nodes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_scheduled_tasks_timestamp
AFTER UPDATE ON scheduled_tasks
FOR EACH ROW
BEGIN
    UPDATE scheduled_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_system_configs_timestamp
AFTER UPDATE ON system_configs
FOR EACH ROW
BEGIN
    UPDATE system_configs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- 视图：仪表盘统计
-- ============================================

CREATE VIEW IF NOT EXISTS v_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM executions WHERE DATE(created_at) = DATE('now')) AS today_executions,
    (SELECT COUNT(*) FROM executions WHERE DATE(created_at) = DATE('now') AND status = 'success') AS today_success,
    (SELECT COUNT(*) FROM executions WHERE DATE(created_at) = DATE('now') AND status = 'failed') AS today_failed,
    (SELECT COUNT(*) FROM nodes WHERE status = 'online') AS online_nodes,
    (SELECT COUNT(*) FROM nodes) AS total_nodes,
    (SELECT COUNT(*) FROM scripts WHERE type = 'Python') AS python_scripts,
    (SELECT COUNT(*) FROM scripts WHERE type = 'Shell') AS shell_scripts,
    (SELECT COUNT(*) FROM scheduled_tasks WHERE enabled = 1) AS enabled_tasks,
    (SELECT COUNT(*) FROM scheduled_tasks WHERE enabled = 0) AS disabled_tasks;

-- ============================================
-- 视图：任务执行统计
-- ============================================

CREATE VIEW IF NOT EXISTS v_task_stats AS
SELECT
    t.id AS task_id,
    t.name AS task_name,
    t.enabled,
    t.next_run_time,
    t.last_run_time,
    t.last_run_status,
    (SELECT COUNT(*) FROM executions e WHERE e.task_id = t.id AND e.status = 'success') AS success_count,
    (SELECT COUNT(*) FROM executions e WHERE e.task_id = t.id AND e.status = 'failed') AS failed_count,
    (SELECT COUNT(*) FROM executions e WHERE e.task_id = t.id) AS total_count
FROM scheduled_tasks t;

-- ============================================
-- 视图：节点执行统计
-- ============================================

CREATE VIEW IF NOT EXISTS v_node_stats AS
SELECT
    n.id AS node_id,
    n.name AS node_name,
    n.status AS node_status,
    n.environment,
    n.last_heartbeat,
    (SELECT COUNT(*) FROM node_executions ne WHERE ne.node_id = n.id AND ne.status = 'success') AS success_count,
    (SELECT COUNT(*) FROM node_executions ne WHERE ne.node_id = n.id AND ne.status = 'failed') AS failed_count,
    (SELECT COUNT(*) FROM node_executions ne WHERE ne.node_id = n.id) AS total_count,
    (SELECT AVG(duration) FROM node_executions ne WHERE ne.node_id = n.id AND ne.status = 'success') AS avg_duration
FROM nodes n;
