# Rubato

一个以「老旧纸质乐谱 × 现代数字艺术」为氛围的个人主页实验：以你的 `pics/main.svg` 为视觉核心，使用 Vue 3 + Vite + TypeScript + Tailwind CSS（v4）+ GSAP 实现音符的 hover / click / 漂浮交互，并在右侧以半透明 macOS 风格面板呈现内容。

## 技术栈

- Vue 3（Composition API / `<script setup>`）
- Vite
- TypeScript
- Tailwind CSS v4（通过 `@tailwindcss/vite`）
- GSAP（替代 Framer Motion）
- Inline SVG（以组件方式接入，直接操作 SVG 内部元素）

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发环境

```bash
npm run dev
```

启动后终端会输出本地地址，例如：

```
http://localhost:5173/
```

如果端口被占用，Vite 会自动换到下一个端口（例如 `5174`）。

### 3) 构建与预览

```bash
npm run build
npm run preview
```

## 项目结构（关键文件）

- [pics/main.svg](file:///Users/caominshan/Documents/trae_projects/rubato/pics/main.svg)：你的原始 SVG（源文件）
- [src/components/MainSvg.vue](file:///Users/caominshan/Documents/trae_projects/rubato/src/components/MainSvg.vue)：将 SVG 内联为 Vue 组件，并绑定音符 hover / click / 漂浮动画
- [src/components/FloatingPanel.vue](file:///Users/caominshan/Documents/trae_projects/rubato/src/components/FloatingPanel.vue)：右侧滑出浮层（半透明 + backdrop blur + GSAP 过渡）
- [src/App.vue](file:///Users/caominshan/Documents/trae_projects/rubato/src/App.vue)：首页布局与内容映射（点击不同音符展示不同内容）
- [src/style.css](file:///Users/caominshan/Documents/trae_projects/rubato/src/style.css)：背景渐变 + subtle paper grain + 全局风格

## SVG 交互约定

- 所有可交互元素使用 `.interactive-note` 类名标记。
- 点击时通过 `data-panel` 映射到右侧面板内容（在 `App.vue` 中维护对应关系）。

## 常见问题

### 鼠标 hover 抖动

音符自身有漂浮动画，hover 时若命中区域不稳定会出现 enter/leave 频繁切换。本项目在 `MainSvg.vue` 中对 hover 做了防抖，并在 hover 时暂停该音符的漂浮 tween，mouseleave 后恢复。
