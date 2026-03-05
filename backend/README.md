# 运维任务调度系统 - 后端API

基于FastAPI + SQLAlchemy + SQLite的运维任务调度系统后端API。

## 技术栈

- Python 3.11+
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- Pydantic v2
- SQLite

## 项目结构

```
backend/
├── main.py                      # FastAPI应用入口
├── config.py                    # 配置文件
├── database.py                  # 数据库连接
├── requirements.txt             # Python依赖
├── app/
│   ├── __init__.py
│   ├── models/                  # SQLAlchemy ORM模型
│   │   ├── user.py
│   │   ├── script.py
│   │   ├── script_category.py
│   │   ├── node.py
│   │   ├── scheduled_task.py
│   │   ├── execution.py
│   │   ├── node_execution.py
│   │   ├── system_config.py
│   │   ├── audit_log.py
│   │   └── notification.py
│   ├── routers/                 # API路由
│   │   ├── dashboard.py
│   │   ├── scripts.py
│   │   ├── tasks.py
│   │   ├── executions.py
│   │   ├── nodes.py
│   │   ├── users.py
│   │   ├── script_categories.py
│   │   ├── system_configs.py
│   │   ├── auth.py
│   │   └── agent.py
│   ├── services/                # 业务逻辑层
│   │   ├── script_service.py
│   │   ├── node_service.py
│   │   └── user_service.py
│   ├── schemas/                 # Pydantic模型
│   │   └── __init__.py
│   └── core/                    # 核心模块
│       ├── response.py           # 统一响应格式
│       ├── exceptions.py         # 异常定义
│       └── security.py          # RBAC权限控制
└── tests/                       # 测试文件
    └── test_api.py
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 访问API文档

启动后访问以下地址查看API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 4. 测试API

```bash
# 健康检查
curl http://localhost:8000/health

# 获取仪表盘统计（需要角色）
curl -H "X-Role: admin" http://localhost:8000/api/v1/dashboard/stats

# 获取脚本列表
curl -H "X-Role: admin" http://localhost:8000/api/v1/scripts
```

## API模块

### 1. 仪表盘模块 (Dashboard)
- 统计卡片展示
- 脚本类型分布
- 调度任务统计
- 最近执行记录

### 2. 脚本管理模块 (Script)
- 脚本列表展示
- 脚本搜索
- 新建/编辑/删除脚本
- 查看脚本详情
- 立即执行脚本

### 3. 任务调度模块 (Task)
- 任务列表展示
- 任务搜索
- 任务统计
- 新建/编辑/删除任务
- 启用/暂停任务
- Cron表达式解析
- 获取可用节点列表

### 4. 执行记录模块 (Execution)
- 记录列表展示
- 记录搜索
- 统计信息
- 查看日志
- 日志下载
- 执行详情

### 5. 节点管理模块 (Node)
- 节点列表展示
- 节点搜索
- 节点统计
- 新增/编辑/删除节点
- 查看节点详情
- 节点执行历史

### 6. 用户权限模块 (User)
- 用户列表展示
- 新增/编辑/删除用户
- 重置密码
- 修改密码

### 7. 脚本分类模块 (Category)
- 分类列表展示
- 新增/编辑/删除分类

### 8. 系统配置模块 (Config)
- 获取系统配置
- 更新系统配置
- 批量更新配置

### 9. 认证授权模块 (Auth)
- 用户登录
- 用户登出
- 刷新Token
- 获取当前用户信息

### 10. Agent通信模块 (Agent)
- Agent注册
- Agent心跳
- 接收任务
- 上报执行结果

## RBAC权限控制

系统支持三种角色：

- **admin**: 管理员，拥有所有权限
- **ops**: 运维人员，可以创建、编辑、执行、查看
- **readonly**: 只读用户，仅能查看

### 使用方式

在请求头中添加 `X-Role` 字段：

```bash
curl -H "X-Role: admin" http://localhost:8000/api/v1/scripts
```

## 统一响应格式

所有API返回统一的JSON格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 响应码说明

- 200: 成功
- 400: 参数错误/业务错误
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 数据库

### 初始化

数据库会在首次启动时自动初始化，包括：
- 创建所有表
- 启用WAL模式
- 插入初始数据（默认用户、脚本分类、系统配置）

### 默认数据

**默认用户**:
- 用户名: admin
- 密码: admin123
- 角色: admin

**默认脚本分类**:
- 监控告警
- 维护清理
- 备份恢复
- 部署发布
- 故障处理
- 配置管理

## 测试

运行测试：

```bash
cd backend
pytest tests/test_api.py -v
```

## 开发规范

1. **分层架构**: Router → Service → Model
2. **统一响应**: 使用 `SuccessResponse.create()` 和 `ErrorResponse.create()`
3. **异常处理**: 使用自定义异常类（`NotFoundError`, `BusinessError`等）
4. **权限控制**: 使用 `Depends(require_ops)` 或 `Depends(require_admin)`
5. **类型提示**: 所有函数必须使用类型提示

## 待完善功能

1. 实现完整的JWT Token认证系统
2. 实现审计日志记录功能
3. 实现通知发送功能
4. 完善Service层的实际业务逻辑
5. 添加更多的单元测试和集成测试
6. 实现WebSocket实时日志推送
7. 实现任务调度器（基于Cron表达式）

## 文档

- [API映射表](../doc/api/07_api_mapping_table.md)
- [数据库设计](../doc/database/04_database_design.md)
- [OpenAPI规范](../doc/api/05_openapi.yaml)
- [RBAC设计](../doc/security/06_rbac_design.md)

## 许可证

MIT License