# Todolist 桌面挂件 - 设计文档

## 概述

一个轻量级的桌面 todolist 挂件应用，支持悬浮置顶和完整展开两种模式，适合日常待办和工作任务管理。

## 技术栈

- **框架**: Tauri v2
- **前端**: React + TypeScript
- **样式**: CSS 变量 + CSS Modules
- **存储**: 本地 JSON 文件
- **构建**: Vite

## 窗口架构

单窗口 + 模式切换方案。一个 Tauri 窗口在两种模式间切换：

### 迷你模式

- 置顶悬浮（always-on-top）
- 无系统标题栏，自绘标题区域
- 圆角透明背景
- 窗口尺寸：约 320×480px
- 只显示任务列表和分类筛选
- 右上角"展开"按钮切换到完整模式

### 完整模式

- 普通窗口，可调整大小
- 带系统标题栏
- 窗口尺寸：约 800×600px（可调）
- 显示全部功能：布局切换、分类管理、任务详情
- 右上角"收起"按钮切换到迷你模式

### 切换机制

通过 Tauri 的 `invoke` API 调用 Rust 后端修改窗口属性：
- `setAlwaysOnTop(true/false)`
- `setSize()` 调整窗口大小
- `setDecorations()` 控制标题栏显示
- 前端切换 React 组件渲染逻辑

## 主题系统

4 种内置主题，通过 CSS 变量实现，在设置中切换：

### 活泼彩色（默认）

- 背景：暖色渐变（#ffecd2 → #fcb69f）
- 卡片：白色圆角卡片
- 强调色：红/橙/绿圆点标识任务状态
- 字体色：#333

### 毛玻璃 / 亚克力

- 背景：紫色渐变 + backdrop-filter blur
- 卡片：半透明白色 + 白色边框
- 强调色：白色系
- Tauri 窗口透明：`transparent: true`

### 极简扁平

- 背景：#f5f5f5
- 卡片：纯白 + 极细边框
- 强调色：灰色系
- 字体色：#222

### 暗色主题

- 背景：#1a1a2e
- 卡片：#16213e + 微弱边框
- 强调色：蓝色系
- 字体色：#e0e0e0

## 布局系统

完整模式下支持 3 种布局，通过顶部标签切换：

### 列表视图

- 每行一个任务
- 显示：颜色圆点、标题、分类标签、截止日期
- 点击任务行可编辑/查看详情
- 左滑或右键菜单删除

### 卡片视图

- 网格排列（2-3列，响应式）
- 每张卡片显示：颜色标识、标题、分类、日期
- 卡片可点击展开详情

### 看板视图

- 三列：待办 / 进行中 / 已完成
- 任务卡片可在列间拖拽移动
- 拖拽改变任务状态
- 初始版本固定三列，后续可扩展自定义列

## 数据模型

```typescript
interface Task {
  id: string;           // UUID
  title: string;        // 任务标题
  category: string;     // 分类 ID
  dueDate?: string;     // ISO 日期字符串，可选
  status: 'todo' | 'doing' | 'done';
  createdAt: string;    // ISO 时间戳
  completedAt?: string; // 完成时间，可选
}

interface Category {
  id: string;           // UUID
  name: string;         // 分类名称
  color: string;        // 颜色值
  isDefault: boolean;   // 是否预设分类
}

interface Settings {
  theme: 'colorful' | 'glass' | 'minimal' | 'dark';
  layout: 'list' | 'grid' | 'kanban';
  mode: 'mini' | 'full';
}

interface AppData {
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}
```

## 预设分类

| 名称 | 颜色 |
|------|------|
| 工作 | #ff6b6b |
| 生活 | #ffa502 |
| 学习 | #2ed573 |

支持用户自定义添加分类，自定义分类可删除，预设分类不可删除。

## 截止日期与提醒

- 添加任务时可选择截止日期（日期选择器）
- 列表中显示相对日期："今天"、"明天"、"周五"、"下周一"、"5月25日"
- 过期未完成任务：标题标红 + 日期显示"已过期"
- 当天到期任务：日期显示红色
- 系统通知：通过 Tauri 的 notification API，在任务到期当天发送系统通知

## 系统托盘

- 应用启动时在系统托盘显示图标
- 右键菜单：
  - 显示/隐藏主窗口
  - 退出应用
- 点击托盘图标：切换窗口显示/隐藏

## 数据存储

- 文件路径：`%APPDATA%/todolist-widget/data.json`
- 应用启动时读取，数据变更时写入
- 单文件存储所有数据（任务、分类、设置）
- 自动保存，无需手动操作

## 项目结构

```
src-tauri/
  src/
    main.rs           # Tauri 入口
    commands.rs       # Tauri invoke 命令
    storage.rs        # 数据读写
    tray.rs           # 系统托盘
  tauri.conf.json     # Tauri 配置
src/
  App.tsx             # 根组件
  components/
    MiniMode.tsx      # 迷你模式界面
    FullMode.tsx      # 完整模式界面
    TaskList.tsx      # 任务列表组件
    TaskCard.tsx      # 任务卡片组件
    KanbanBoard.tsx   # 看板组件
    CategoryTabs.tsx  # 分类标签栏
    AddTask.tsx       # 添加任务表单
    Settings.tsx      # 设置面板
    ThemeProvider.tsx  # 主题上下文
  hooks/
    useTasks.ts       # 任务数据 hook
    useTheme.ts       # 主题 hook
  types/
    index.ts          # TypeScript 类型定义
  styles/
    themes/           # 主题样式文件
```

## 开发阶段划分

1. **基础框架**：Tauri + React 项目搭建，窗口管理
2. **核心功能**：任务增删改查，本地存储
3. **分类系统**：分类管理，标签筛选
4. **日期功能**：截止日期，相对日期显示，过期提醒
5. **布局切换**：列表/卡片/看板三种视图
6. **主题系统**：4 种主题实现与切换
7. **迷你模式**：悬浮窗模式，窗口切换
8. **系统托盘**：托盘图标与菜单
9. **打磨优化**：动画、快捷键、边缘情况处理
