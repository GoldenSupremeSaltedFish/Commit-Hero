好，那我直接给你一个照着你提供的格式写的 **architecture.md**，用 **Next.js + Supabase** 后端，配合你之前的干净有趣 UI 草图来实现（包括徽章反转动画的支持）。

---

```markdown
# Architecture Design — 开发者效率分析平台（带徽章反转动画）

## 1. 产品描述

这是一个 **开发者效率分析平台**，目标是通过 **VSCode 插件 + Web 仪表盘** 的方式，为开发者提供积极、趣味化、正向反馈的效率数据分析。  
主要特性包括：
- **效率仪表盘**：可视化每日、每周的提交次数、代码行变动、活跃时段。
- **徽章奖励系统**：完成目标任务后解锁动态徽章（支持反转动画）。
- **趋势分析**：分析代码提交模式，给出健康提醒与鼓励性建议。
- **插件数据同步**：VSCode 插件将本地统计数据上传到云端 Supabase 数据库。
- **用户登录与数据隔离**：每个用户只能查看自己的效率数据与成就。

目标用户：
- 喜欢数据化管理的程序员
- 团队管理者（关注整体效率）
- 想通过游戏化方式提升开发积极性的个人

---

## 2. 技术栈

- **前端**：Next.js（App Router），TailwindCSS，Framer Motion（动画）
- **后端 / 数据**：Supabase（PostgreSQL + Auth + Storage）
- **实时通信**：Supabase Realtime
- **插件数据上传**：VSCode 插件调用 Supabase API
- **动画**：Framer Motion 实现徽章反转动画

---

## 3. 文件与文件夹结构

```

root/
├── apps/
│   ├── web/                  # Next.js Web 前端
│   │   ├── app/
│   │   │   ├── dashboard/    # 仪表盘页面
│   │   │   ├── badges/       # 徽章展示与动画页面
│   │   │   ├── auth/         # 登录注册页面
│   │   │   ├── layout.tsx    # 公共布局
│   │   │   └── page.tsx      # 首页
│   │   ├── components/
│   │   │   ├── BadgeCard.tsx # 徽章卡片组件（含反转动画）
│   │   │   ├── Chart.tsx     # 数据图表组件
│   │   │   └── Navbar.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts   # Supabase 客户端
│   │   │   └── utils.ts
│   │   ├── public/           # 静态资源
│   │   ├── styles/           # 全局样式
│   │   └── package.json
│   └── vscode-extension/     # VSCode 插件
│       ├── src/
│       │   ├── extension.ts  # 主入口，收集数据
│       │   ├── api.ts        # 调用 Supabase API
│       │   └── utils.ts
│       └── package.json
│
├── supabase/                 # Supabase 配置与迁移脚本
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── docs/
│   ├── architecture.md       # 架构设计文档
│   └── api\_spec.md           # API 规范
│
└── package.json

````

---

## 4. 各部分作用

- **apps/web**：  
  - 提供用户访问的 Web 仪表盘与徽章系统
  - 通过 Supabase 获取与展示数据
  - Framer Motion 实现徽章反转动画

- **apps/vscode-extension**：  
  - 监听用户的 VSCode 活动（提交、编辑、打开文件）
  - 将收集到的指标通过 Supabase API 上传
  - 提供基础设置（用户绑定、上传频率）

- **supabase**：  
  - 存储用户数据、徽章信息、历史趋势
  - 提供身份认证、数据实时推送
  - 存储徽章图标等静态文件

- **docs**：  
  - 存放项目文档，确保团队协作有据可依

---

## 5. 状态存储位置

- **前端状态（短期）**：React Hooks / Zustand 存储临时 UI 状态（例如当前选中徽章、图表过滤条件）
- **后端状态（长期）**：Supabase PostgreSQL 存储所有用户、徽章、效率数据
- **缓存**：Next.js Server Actions 缓存热点查询结果

---

## 6. 服务之间的连接

1. **VSCode 插件** 收集数据 → 调用 **Supabase REST API** 上传 → 存入 PostgreSQL
2. **Supabase Realtime** 将最新数据推送到 **Next.js Web 前端**
3. **Web 前端** 根据新数据更新仪表盘、触发徽章解锁动画
4. **Supabase Storage** 存储徽章图片，前端直接访问

---

## 7. 动画实现（徽章反转）

使用 **Framer Motion** 在 React 组件中实现：

```tsx
import { motion } from "framer-motion";

export default function BadgeCard({ badge }) {
  return (
    <motion.div
      className="w-40 h-40 perspective"
      whileHover={{ rotateY: 180 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute backface-hidden">
        <img src={badge.frontImage} alt="Badge Front" />
      </div>
      <div className="absolute backface-hidden rotate-y-180">
        <img src={badge.backImage} alt="Badge Back" />
      </div>
    </motion.div>
  );
}
````

---

```

---
