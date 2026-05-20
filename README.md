# InterviewFlow 前端

AI 驱动的智能求职模拟与面经管理平台 — 前端 Web 应用。

## 技术栈

| 类别         | 技术                             |
| ------------ | -------------------------------- |
| 框架         | Vue 3.4 (Composition API)        |
| 构建工具     | Vite 5                           |
| 语言         | TypeScript 5.3                   |
| UI 组件库    | Element Plus 2.5                 |
| 图标库       | @element-plus/icons-vue 2.3      |
| 路由         | Vue Router 4                     |
| 状态管理     | Pinia 2                          |
| HTTP 客户端  | Axios 1.6                        |
| Markdown     | markdown-it 14 + highlight.js 11 |
| 图表         | ECharts 5 + vue-echarts 6        |
| 日期处理     | dayjs 1.11                       |

## 快速开始

### 前置条件

- Node.js 18+
- npm 9+ / pnpm

### 安装 & 运行

```bash
# 安装依赖
npm install

# 开发服务器（默认代理到 localhost:8080）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`，Vite 自动代理 `/api` 请求到 `http://localhost:8080`（配置见 `vite.config.ts`）。

## 项目结构

```
frontend/
├── index.html                    # HTML 入口
├── package.json
├── tsconfig.json
├── vite.config.ts                # Vite 配置（别名、代理）
└── src/
    ├── main.ts                   # 应用入口（注册插件、全局错误处理）
    ├── App.vue                   # 根组件（<router-view />）
    ├── vite-env.d.ts
    ├── types/
    │   ├── models.d.ts           # 数据模型类型
    │   └── api.d.ts              # API 请求/响应类型
    ├── utils/
    │   ├── request.ts            # Axios 实例（拦截器、AI配置头）
    │   ├── markdown.ts           # Markdown 渲染（语法高亮）
    │   └── logger.ts             # 前端日志捕获系统
    ├── stores/
    │   ├── auth.ts               # 认证状态（登录/注册/登出）
    │   ├── aiConfig.ts           # AI 配置管理（本地存储）
    │   └── log.ts                # 日志收集与过滤
    ├── router/
    │   └── index.ts              # 路由定义 & 导航守卫
    ├── layouts/
    │   └── MainLayout.vue        # 主布局（侧边栏 + 顶栏 + 内容区）
    ├── components/
    │   ├── Sidebar.vue           # 侧边导航
    │   ├── Topbar.vue            # 顶栏（页面标题 + 设置入口）
    │   ├── SettingsDrawer.vue    # AI 配置抽屉（提供商选择、模型管理）
    │   ├── ResumeEditorDrawer.vue # 简历编辑器抽屉
    │   └── ExperienceEditorDrawer.vue # 面经编辑器抽屉
    └── pages/
        ├── LoginPage.vue         # 登录/注册页
        ├── ResumePage.vue        # 简历管理（卡片 + 编辑器）
        ├── ExperiencePage.vue    # 面经知识库
        ├── JdMatchPage.vue       # JD 智能匹配 + 历史记录
        ├── InterviewPage.vue     # AI 模拟面试（准备 → 对话）
        ├── ReportPage.vue        # 面试复盘列表
        ├── ReportDetailPage.vue  # 面试复盘详情
        └── LogPage.vue           # 运行日志查看
```

## 路由

| 路径              | 页面         | 说明                 |
| ----------------- | ------------ | -------------------- |
| /login            | LoginPage    | 登录/注册            |
| /                 | MainLayout   | 主布局（需登录）     |
| /resumes          | ResumePage   | 简历管理             |
| /experiences      | ExperiencePage | 面经知识库         |
| /jd-match         | JdMatchPage  | JD 智能匹配          |
| /interview        | InterviewPage | AI 模拟面试         |
| /reports          | ReportPage   | 面试复盘列表         |
| /reports/:id      | ReportDetailPage | 复盘报告详情     |
| /logs             | LogPage      | 运行日志             |

路由守卫逻辑（`router/index.ts`）：
- 未登录访问非 `/login` 路径 → 重定向到 `/login`
- 已登录访问 `/login` → 重定向到 `/`

## 功能页面详解

### 1. 登录/注册页 (`LoginPage.vue`)

- Tab 切换登录 / 注册
- 调用 `POST /api/auth/login` 或 `POST /api/auth/register`
- 成功后 Token 存入 `localStorage`，通过 Pinia `authStore` 管理

### 2. 简历管理 (`ResumePage.vue`)

- 卡片式布局展示所有简历
- 新建 / 编辑：打开 `ResumeEditorDrawer` 抽屉组件
- 支持 PDF 上传解析（调用 `POST /api/resumes/parse-pdf`）
- 实时搜索过滤

### 3. 面经知识库 (`ExperiencePage.vue`)

- 列表式管理面经记录
- 支持公司、岗位、标签、内容字段
- 新建 / 编辑：打开 `ExperienceEditorDrawer` 组件

### 4. JD 智能匹配 (`JdMatchPage.vue`)

- **三步流程**：选择简历 → 粘贴 JD → 开始分析
- 三态切换：`history-page` / `match-result` / `match-form`
- 分析结果展示：
  - 综合匹配度（进度条 + 颜色标识）
  - 核心短板（红牌警告）
  - 加分优势（绿牌鼓励）
  - 优化建议（蓝色信息）
- 历史记录：
  - 列表展示所有匹配记录（含评分标签、简历名称、JD 链接）
  - 点击查看详情对话框
  - 编辑标题/JD 链接
  - 删除确认
- 结果页和历史页均可返回重新分析

### 5. AI 模拟面试 (`InterviewPage.vue`)

- **准备阶段**：
  - 选择简历
  - 选择目标岗位（预置常用岗位下拉）
  - 输入岗位 JD（可选）
  - 关联面经（可选）
  - 选择难度（小厂/中厂/大厂，卡片式选择）
- **面试阶段**：
  - 实时对话界面（消息气泡 + Markdown 渲染）
  - 支持同步聊天（`POST /api/interviews/chat`）
  - 当前轮次 / 最大轮次显示
  - 可提前结束面试
- 面试结束后 2 秒自动跳转到复盘报告

### 6. 面试复盘 (`ReportPage.vue` / `ReportDetailPage.vue`)

- 列表页：展示所有已完成面试的复盘摘要（得分、难度、答题数量）
- 详情页：评分（综合/技术/逻辑）+ 优劣势 + 逐题反馈
- 支持删除面试记录

### 7. 运行日志 (`LogPage.vue`)

- 实时捕获前端运行时日志（error/warn/info）
- 支持按级别过滤和搜索
- 拦截 `console.error`、`window.onerror`、`unhandledrejection`

## 关键组件

### Sidebar.vue
- 固定左侧导航，6 个主要菜单项
- 底部显示 AI 连接状态指示灯（已连接/未连接）
- 日志页面有错误角标提醒

### SettingsDrawer.vue
- AI 服务提供商选择：DeepSeek / OpenAI / 通义千问 / 智谱 / 自定义
- 自动填充 Base URL、推荐模型
- 支持模型下拉选择 / 自定义输入
- 连接测试 + 保存配置
- 配置存 `localStorage`，Axios 拦截器自动注入请求头

### Topbar.vue
- 显示当前页面中文标题（根据路由自动匹配）
- 右端「设置」按钮打开 AI 配置抽屉

## 状态管理

### authStore (Pinia)
- `token` / `user` / `isLoggedIn`
- `login()` / `register()` / `logout()`
- Token 同步到 `localStorage`

### aiConfigStore (Pinia)
- `config`：`{ baseUrl, apiKey, model, connected }`
- `save()` / `loadFromStorage()` / `testConnection()`
- 配置持久化到 `localStorage`

### logStore (Pinia)
- 收集前端所有日志（上限 500 条）
- 支持按级别过滤、搜索
- 提供 `errorCount` 供 Sidebar 角标使用

## 网络请求

基于 Axios 的请求封装（`utils/request.ts`）：

**请求拦截器**：
- 自动注入 `Authorization: Bearer <token>`
- 自动注入 AI 配置头（`X-AI-Key`、`X-AI-Base-Url`、`X-AI-Model`）

**响应拦截器**：
- 统一解包 `res.data.data`，仅返回业务数据
- 非 200 码自动弹出错误提示
- 网络错误统一处理

## 构建与部署

```bash
# 生产构建
npm run build

# 构建产物在 dist/ 目录
# 可部署到任意静态文件服务器（Nginx / Caddy 等）
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/frontend/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
