---
name: "api-mapping-table"
description: "Generates comprehensive API interface mapping table from feature breakdown. Invoke when backend API development needs detailed interface specifications."
---

# API 接口映射表生成指南

本 Skill 专注于根据功能点拆分表生成完整的 API 接口映射表，为后端 API 开发提供唯一的标准和规范。

## 适用场景

当您需要：
- 根据功能点拆分表生成 API 接口映射表
- 为后端开发提供详细的接口规范
- 定义完整的 API 接口列表和参数规范
- 统一 API 设计规范和命名约定
- 作为后端 API 开发的唯一标准

## 前置条件

- 已完成功能点拆分表（doc/02_feature_breakdown.xlsx）
- 明确系统功能模块划分
- 了解 RESTful API 设计规范

## 接口模块划分

按以下模块输出接口：
- **Script** - 脚本管理模块
- **Node** - 节点管理模块
- **Task** - 任务管理模块
- **Execution** - 执行记录模块
- **Schedule** - 调度管理模块
- **Auth** - 认证授权模块

## 接口字段规范

每个接口必须包含以下字段：

### 基本信息
- **模块名称**：所属功能模块
- **页面名称**：前端页面名称
- **功能点名称**：具体功能点
- **FeatureID**：与功能点拆分表中的 FeatureID 对应
- **URL**：统一使用 `/api/v1/` 前缀
- **HTTP 方法**：GET/POST/PUT/DELETE

### 请求参数
- **字段名**：参数名称
- **类型**：string/int/boolean/array/object
- **是否必填**：是/否
- **默认值**：参数默认值
- **描述**：参数说明

### 响应结构
- **code**：int - 状态码
- **message**：string - 响应消息
- **data**：object - 响应数据
- **data 内部字段明细**：字段名+类型+说明

### 其他信息
- **权限角色**：admin / ops / readonly
- **是否分页**：是/否
- **是否批量操作**：是/否
- **备注说明**：其他说明

## 设计规范

### RESTful 规范
- URL 语义清晰，使用名词复数形式
- 动词使用规范：
  - GET：查询资源
  - POST：创建资源
  - PUT：更新资源
  - DELETE：删除资源

### 分页规范
分页接口统一使用以下参数：
- **page**：int - 页码，从 1 开始
- **size**：int - 每页数量，默认 20

### 批量操作规范
批量接口使用 `/batch` 后缀

### 版本管理
版本号统一为 v1，URL 前缀：`/api/v1/`

## 状态字段统一设计

所有状态字段使用以下枚举值：
- **pending**：待处理
- **running**：运行中
- **success**：成功
- **failed**：失败
- **timeout**：超时
- **disabled**：禁用

## 输出格式要求

### Markdown 表格格式
- 使用 Markdown 表格格式（可直接导入 Excel）
- 每个模块单独一个表
- 字段列完整清晰
- 不允许省略字段
- 不允许伪代码

### 表格结构示例

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Script | 脚本管理 | 创建脚本 | FEAT-001 | /api/v1/scripts | POST | name:string, content:text, ... | {code, message, data} | admin, ops | 否 | 否 | - |

## 额外输出

### 接口数量统计
- 总接口数量
- 各模块接口数量汇总
- 各 HTTP 方法数量统计

### 模块接口汇总
- 按模块统计接口数量
- 按权限角色统计接口数量
- 按操作类型统计接口数量（查询/创建/更新/删除）

## 产出文档

- `doc/api/07_api_mapping_table.md` - API 接口映射表

## 使用指南

### 执行步骤

1. **功能点确认**：确认功能点拆分表已就绪
2. **模块分析**：分析各功能模块的接口需求
3. **接口设计**：按照规范设计每个接口
4. **参数定义**：详细定义请求和响应参数
5. **权限标注**：标注每个接口的权限要求
6. **表格生成**：生成完整的接口映射表
7. **统计分析**：生成接口数量统计和汇总

### 注意事项

- 接口设计应遵循 RESTful 规范
- URL 命名应清晰易懂
- 参数类型和必填项应明确标注
- 权限角色应根据业务需求合理分配
- 保持接口设计的一致性
- 考虑接口的可扩展性

## 质量标准

### 完整性要求
- 所有功能点都应有对应的接口
- 接口参数定义完整无遗漏
- 响应结构清晰明确
- 权限标注准确无误

### 规范性要求
- 符合 RESTful 设计规范
- URL 命名统一规范
- 参数命名清晰易懂
- 状态字段使用统一枚举值

### 可读性要求
- 表格格式清晰易读
- 字段说明准确详细
- 备注信息完整有用
- 统计数据准确完整

## 示例

### Script 模块接口示例

| 模块 | 页面 | 功能点 | FeatureID | URL | 方法 | 请求参数 | 响应结构 | 权限角色 | 分页 | 批量 | 备注 |
|------|------|--------|-----------|-----|------|----------|----------|----------|------|------|------|
| Script | 脚本管理 | 创建脚本 | FEAT-001 | /api/v1/scripts | POST | name:string(必填), content:text(必填), type:string(默认:shell), description:string | {code:int, message:string, data:{id:int, name:string, ...}} | admin, ops | 否 | 否 | - |
| Script | 脚本管理 | 查询脚本列表 | FEAT-002 | /api/v1/scripts | GET | page:int(默认:1), size:int(默认:20), keyword:string, type:string | {code:int, message:string, data:{total:int, items:[{...}]}} | admin, ops, readonly | 是 | 否 | 支持关键词搜索 |
| Script | 脚本管理 | 更新脚本 | FEAT-003 | /api/v1/scripts/{id} | PUT | name:string, content:text, type:string, description:string | {code:int, message:string, data:{id:int, name:string, ...}} | admin, ops | 否 | 否 | - |
| Script | 脚本管理 | 删除脚本 | FEAT-004 | /api/v1/scripts/{id} | DELETE | - | {code:int, message:string, data:null} | admin | 否 | 否 | - |
| Script | 脚本管理 | 批量删除脚本 | FEAT-005 | /api/v1/scripts/batch | DELETE | ids:array[int](必填) | {code:int, message:string, data:null} | admin | 否 | 是 | - |

## 目标

生成一份可直接驱动后端 API 开发的完整接口映射表，确保：
- 接口设计规范统一
- 参数定义清晰完整
- 权限控制准确合理
- 可直接用于后端开发
