# RM Archive 源码修改指南

## 常用文件

- `app/page.tsx`：七个模块、全部卡片文字、卡片字母与前台交互。
- `app/globals.css`：主站颜色、字体、间距、卡片、树形首页、弹窗与响应式样式。
- `app/admin/`：仅站主可访问的留言管理后台。
- `app/api/feedback/route.ts`：前台意见箱提交接口。
- `app/api/admin/feedback/[id]/route.ts`：后台状态修改和删除接口。
- `db/schema.ts`：留言数据库字段。
- `public/`：首页树形图片等静态素材。

## 修改卡片文字

打开 `app/page.tsx`，在 `items` 数组中搜索卡片 id 或标题。修改 `title`、`summary`、`tags`、`relation` 等字段即可。

## 修改卡片字母

每条档案的 `image` 字段控制卡片和详情页中央显示的字母或短字符。例如：

```ts
{ id:"music-007", title:"Right Place, Wrong Person", image:"RP", ... }
```

可以把 `RP` 改为任意简短文字。字母区域的字体、颜色和大小位于 `app/globals.css` 的 `.thumb>span` 与 `.detail-visual>span`。

## 修改样式

主站样式位于 `app/globals.css`。文件开头的 `--paper`、`--ink`、`--blue`、`--rust`、`--moss` 是主要配色变量。后台样式单独位于 `app/admin/admin.module.css`。

## 本地运行

需要 Node.js 22 或更高版本。在项目目录执行：

```bash
npm install
npm run dev
```

随后打开终端显示的本地地址。前台静态内容可以直接修改；留言数据库和登录保护需要部署到 Sites 后才能完整使用。

## 发布前检查

```bash
npm run build
```
