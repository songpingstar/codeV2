---
name: "backend-development-workflow"
description: "引导完整的后端开发流程，从设计文档开始。当开始后端开发或用户要求生成后端代码结构时调用。"
---

# 后端开发工作流

本skill提供基于设计文档的完整、分步骤的后端开发工作流。确保与PRD、架构设计、数据库设计和API规范保持一致。

## 何时调用

**关键：在以下情况下立即调用本skill：**
- 用户想要从零开始后端开发
- 用户要求生成后端项目结构
- 用户需要根据schema创建SQLAlchemy模型
- 用户想要根据映射表生成API路由
- 用户需要实现RBAC权限
- 用户要求基于设计文档创建后端代码

## 设计文档来源

工作流使用以下设计文档作为权威来源：
- **PRD**: `doc/requirements/01_PRD.md`
- **架构设计**: `doc/architecture/03_architecture.md`
- **数据库设计**: `doc/database/04_database_design.md`
- **数据库Schema**: `doc/database/schema.sql`
- **API映射表**: `doc/api/07_api_mapping_table.md`
- **OpenAPI**: `doc/api/05_openapi.yaml`
- **RBAC设计**: `doc/security/06_rbac_design.md`

## 技术栈要求

- Python 3.10+
- FastAPI框架
- SQLAlchemy ORM
- SQLite（默认数据库）
- Pydantic v2
- 分层架构
- RESTful API风格
- 统一API前缀 `/api/v1`
- 统一响应结构 `{code, message, data}`

## 开发阶段

### 阶段1：生成后端项目结构

**目标**：基于设计文档创建标准后端目录结构

**要求**：
1. 创建标准后端目录结构
2. 生成main.py
3. 生成数据库连接模块
4. 生成基础配置文件
5. 生成requirements.txt
6. 生成统一响应封装模块
7. 启用SQLite WAL模式
8. 不实现具体业务逻辑（只搭骨架）

**输出**：完整的文件结构和代码。

**预期目录结构**：
```
backend/
├── main.py
├── config.py
├── database.py
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── models/
│   ├── routers/
│   ├── services/
│   ├── schemas/
│   └── core/
│       ├── response.py
│       ├── exceptions.py
│       └── security.py
└── tests/
```

---

### 阶段2：生成SQLAlchemy ORM模型

**目标**：根据`doc/database/schema.sql`生成ORM模型

**要求**：
1. 每张表生成一个Model类
2. 字段类型必须与schema.sql完全一致
3. 主键、索引、外键必须正确映射
4. 不新增字段
5. 添加created_at / updated_at自动维护
6. 生成models目录结构
7. 每个模型单文件
8. 使用declarative_base

**输出**：完整的models代码。

**关键映射**：
- users → User模型
- script_categories → ScriptCategory模型
- scripts → Script模型
- nodes → Node模型
- scheduled_tasks → ScheduledTask模型
- executions → Execution模型
- node_executions → NodeExecution模型
- system_configs → SystemConfig模型
- audit_logs → AuditLog模型
- notifications → Notification模型

---

### 阶段3：生成API路由文件（接口定义）

**目标**：根据`doc/api/07_api_mapping_table.md`生成所有API路由文件

**要求**：
1. 每个模块一个router文件
2. 路径严格按映射表
3. 不新增接口
4. 所有接口使用Pydantic请求模型
5. 所有接口使用统一响应格式
6. 所有接口添加RBAC依赖占位
7. 不实现业务逻辑，预留Service调用位置，使用TODO注释标注
8. 自动注册到main.py

**输出**：完整的routers接口定义代码。

**⚠️ 关键约束**：
- 阶段3只生成接口定义，不实现具体业务逻辑
- 每个接口必须预留Service调用位置，例如：
  ```python
  # TODO: 调用Service层实现
  # service = ScriptService(db)
  # result = service.get_scripts(...)
  return SuccessResponse.create(data={...})  # 临时返回mock数据
  ```
- 阶段4完成后，必须将TODO替换为真正的Service调用

**模块映射**：
- Script → routers/scripts.py
- Node → routers/nodes.py
- Task → routers/tasks.py
- Execution → routers/executions.py
- User → routers/users.py
- Dashboard → routers/dashboard.py
- Agent → routers/agent.py

---

### 阶段4：生成Service层

**目标**：为所有API生成Service层

**要求**：
1. 每个模块一个service文件
2. API不直接操作数据库
3. 所有数据库操作写在service层
4. 使用SQLAlchemy Session
5. 所有写操作必须事务安全
6. 不写复杂逻辑
7. 所有状态字段必须使用标准枚举：
   - pending / running / success / failed / timeout / disabled

**输出**：完整的service层代码。

**Service方法**：
- 每个实体的CRUD操作
- 带过滤器的查询操作
- 事务管理
- 业务验证

**⚠️ 重要**：阶段4完成后，必须将Service调用代码回填到阶段3的Router接口定义中，替换TODO注释。

---

### 阶段5：实现RBAC权限校验

**目标**：根据`doc/06_rbac_design.md`实现基础RBAC权限校验

**要求**：
1. 使用依赖注入方式
2. 支持角色：admin / ops / readonly
3. 每个接口必须声明required_roles
4. 未授权返回403
5. 先实现简化版（从header读取角色）
6. 不实现完整登录系统

**输出**：完整的权限模块代码。

**角色权限**：
- admin: 所有权限
- ops: 创建、编辑、执行、查看
- readonly: 仅查看

---

### 阶段6：实现全局异常处理

**目标**：实现全局异常处理机制

**要求**：
1. 捕获数据库异常
2. 捕获业务异常
3. 返回统一结构
4. 打印日志
5. 不暴露内部错误堆栈

**输出**：完整的异常处理代码。

**异常类型**：
- DatabaseError → 500
- ValidationError → 400
- PermissionError → 403
- NotFoundError → 404
- BusinessError → 400

---

### 阶段7：生成数据库初始化脚本

**目标**：生成数据库初始化脚本

**要求**：
1. 支持根据schema.sql初始化数据库
2. 支持自动建表
3. 启动时自动检测数据库文件
4. 开启WAL模式
5. 输出初始化日志

**输出**：完整的初始化脚本。

**初始化步骤**：
1. 检查数据库文件是否存在
2. 如果不存在则创建所有表
3. 启用WAL模式
4. 创建索引
5. 记录初始化状态

---

### 阶段8：生成pytest接口测试脚本

**目标**：生成pytest接口测试脚本

**要求**：
1. 为每个API生成一个测试
2. 使用TestClient
3. 测试成功响应
4. 测试权限控制
5. 测试参数校验
6. 输出coverage报告

**输出**：完整的测试脚本。

**测试覆盖**：
- GET端点（200响应）
- POST端点（201响应）
- PUT/DELETE端点（200响应）
- 权限测试（未授权返回403）
- 验证测试（无效输入返回400）

---

### 阶段9：检查代码与设计文档一致性

**目标**：验证代码与设计文档的一致性

**要求**：
1. 检查是否存在未实现的API
2. 检查是否存在未被API使用的表
3. 检查是否存在多余接口
4. 检查是否所有接口都在OpenAPI中
5. 检查是否所有接口都声明RBAC

**输出**：一致性报告。

**检查项**：
- [ ] 映射表中的所有API都已实现
- [ ] schema中的所有表都被使用
- [ ] 没有超出设计的额外接口
- [ ] 所有接口都在OpenAPI规范中
- [ ] 所有接口都声明了RBAC

---

## 禁止事项（严格规则）

**在任何阶段都禁止**：
- 新增设计中不存在的接口
- 修改API路径
- 修改数据库字段
- 过度设计业务逻辑
- 过度抽象

**始终**：
- 严格遵循设计文档
- 保持各层之间的一致性
- 使用统一响应格式
- 遵循命名规范

## 执行指南


## 质量标准

- 代码必须遵循PEP 8
- 所有函数必须有文档字符串
- 必须使用类型提示
- 错误处理必须全面
- 响应格式必须一致

## 完成标准

所有9个阶段完成时：
- [ ] 项目结构符合要求
- [ ] 所有模型与schema.sql匹配
- [ ] 所有路由与API映射表匹配
- [ ] 所有service遵循分层架构
- [ ] RBAC已实现
- [ ] 异常处理已全局化
- [ ] 数据库初始化正常工作
- [ ] 测试有良好覆盖率
- [ ] 一致性检查通过
