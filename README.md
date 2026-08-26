# Rubato

一个由节奏、记忆与感受碎片构成的数字空间

## 概念

"Rubato"源自音乐术语，意为"节奏的自由伸缩"。

这个网站将这一概念延伸到视觉与交互之中：  
时间不再是固定的节拍，而是可以被拉伸、停顿与流动的体验。

它不是传统意义上的作品集或博客，而是一个持续生长的数字档案空间，用于记录艺术、书籍、展览以及情绪与瞬间。

## 当前状态

Rubato 正在持续开发与迭代中，  
视觉风格与交互体验仍在不断优化与扩展。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS 4
- **路由**: Vue Router 4
- **动画**: GSAP

## 快速开始

### 环境要求

- Node.js >= 18
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问终端输出的本地地址（默认 `http://localhost:5173`）即可查看项目。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

本地预览构建后的生产版本。

## Supabase 数据初始化（可选）

如果需要使用 Supabase 存储书籍和展览数据，请按以下步骤操作：

1. 在项目根目录创建 `.env` 文件，并配置以下环境变量：

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

2. 将书籍和展览数据分别写入 `content/books.json` 和 `content/exhibitions.json`。

3. 运行种子脚本导入数据：

```bash
npm run seed:supabase
```

## 进入 Rubato

进入 Rubato。  
在这里停留一会儿。
