# Commit-Hero MVP 构建任务清单

## 项目概述
基于 Next.js + Supabase 的开发者效率分析平台，包含 VSCode 插件和 Web 仪表盘，支持徽章反转动画。

---

## 阶段 1: 项目初始化与基础设置

### 任务 1.1: 创建项目根目录结构
**目标**: 建立基本的项目文件夹结构
**开始条件**: 空项目目录
**结束条件**: 创建所有必要的文件夹
**测试**: 验证文件夹结构存在
```bash
mkdir -p apps/web apps/vscode-extension supabase docs
```

### 任务 1.2: 初始化 Next.js Web 应用
**目标**: 创建基础的 Next.js 项目
**开始条件**: 项目根目录存在
**结束条件**: Next.js 项目可以启动
**测试**: `npm run dev` 成功启动，访问 localhost:3000 显示默认页面
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 任务 1.3: 安装 Web 应用依赖
**目标**: 安装项目所需的依赖包
**开始条件**: Next.js 项目已创建
**结束条件**: 所有依赖安装完成
**测试**: 无安装错误，package.json 包含所需依赖
```bash
npm install @supabase/supabase-js framer-motion zustand
npm install -D @types/node
```

### 任务 1.4: 初始化 VSCode 插件项目
**目标**: 创建 VSCode 插件基础结构
**开始条件**: apps/vscode-extension 目录存在
**结束条件**: VSCode 插件项目可以编译
**测试**: `npm run compile` 成功，生成 extension.js
```bash
cd apps/vscode-extension
npm init -y
npm install @types/vscode @types/node
npm install @supabase/supabase-js
```

### 任务 1.5: 配置 VSCode 插件 package.json
**目标**: 设置 VSCode 插件的基本配置
**开始条件**: package.json 已初始化
**结束条件**: package.json 包含正确的 VSCode 插件配置
**测试**: 插件可以在 VSCode 中加载（显示在扩展列表中）

---

## 阶段 2: Supabase 后端设置

### 任务 2.1: 创建 Supabase 项目
**目标**: 在 Supabase 控制台创建新项目
**开始条件**: 有 Supabase 账户
**结束条件**: 项目创建成功，获得 API 密钥
**测试**: 可以访问 Supabase 控制台，项目状态为活跃

### 任务 2.2: 设计数据库表结构
**目标**: 创建数据库迁移文件
**开始条件**: Supabase 项目已创建
**结束条件**: 迁移文件包含所有必要的表
**测试**: 迁移文件语法正确，可以执行
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 提交记录表
CREATE TABLE commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  repository TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  message TEXT,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  committed_at TIMESTAMP DEFAULT NOW()
);

-- 徽章表
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户徽章关联表
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### 任务 2.3: 执行数据库迁移
**目标**: 在 Supabase 中创建数据库表
**开始条件**: 迁移文件已创建
**结束条件**: 所有表在 Supabase 中创建成功
**测试**: 在 Supabase 控制台可以看到所有表，可以查询数据

### 任务 2.4: 创建 Supabase 客户端配置
**目标**: 在 Web 应用中配置 Supabase 客户端
**开始条件**: Supabase 项目已创建，获得 API 密钥
**结束条件**: 可以连接到 Supabase
**测试**: 客户端可以成功连接，无错误
```typescript
// apps/web/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 阶段 3: 基础 UI 组件开发

### 任务 3.1: 创建基础布局组件
**目标**: 创建应用的公共布局
**开始条件**: Next.js 项目已设置
**结束条件**: 布局组件可以正常渲染
**测试**: 页面显示正确的布局结构
```typescript
// apps/web/components/Layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Commit Hero</h1>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

### 任务 3.2: 创建徽章卡片组件（无动画）
**目标**: 创建基础的徽章显示组件
**开始条件**: 布局组件已创建
**结束条件**: 徽章卡片可以显示徽章信息
**测试**: 组件可以渲染徽章图片和文字
```typescript
// apps/web/components/BadgeCard.tsx
interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
}

export default function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-40 h-40">
      <img src={badge.icon_url} alt={badge.name} className="w-20 h-20 mx-auto" />
      <h3 className="text-center font-semibold mt-2">{badge.name}</h3>
      <p className="text-center text-sm text-gray-600 mt-1">{badge.description}</p>
    </div>
  )
}
```

### 任务 3.3: 添加徽章反转动画
**目标**: 使用 Framer Motion 实现徽章反转动画
**开始条件**: 徽章卡片组件已创建
**结束条件**: 鼠标悬停时徽章可以反转
**测试**: 悬停时看到平滑的反转动画效果
```typescript
// 更新 BadgeCard.tsx，添加动画
import { motion } from "framer-motion"

export default function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <motion.div
      className="w-40 h-40 perspective"
      whileHover={{ rotateY: 180 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute backface-hidden">
        <img src={badge.icon_url} alt={badge.name} className="w-20 h-20 mx-auto" />
        <h3 className="text-center font-semibold mt-2">{badge.name}</h3>
      </div>
      <div className="absolute backface-hidden rotate-y-180">
        <p className="text-center text-sm text-gray-600 mt-8">{badge.description}</p>
      </div>
    </motion.div>
  )
}
```

### 任务 3.4: 创建简单的数据图表组件
**目标**: 创建基础的提交数据图表
**开始条件**: 徽章组件已创建
**结束条件**: 可以显示简单的柱状图
**测试**: 图表正确显示数据
```typescript
// apps/web/components/Chart.tsx
export default function Chart({ data }: { data: { date: string; commits: number }[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">提交趋势</h3>
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => (
          <div key={index} className="flex-1 bg-blue-500" style={{ height: `${(item.commits / 10) * 100}%` }}>
            <span className="text-xs">{item.commits}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 阶段 4: 页面开发

### 任务 4.1: 创建首页
**目标**: 创建应用的首页
**开始条件**: 布局和基础组件已创建
**结束条件**: 首页可以正常访问
**测试**: 访问 / 显示欢迎页面
```typescript
// apps/web/app/page.tsx
import Layout from '@/components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎使用 Commit Hero
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          追踪你的开发效率，解锁成就徽章
        </p>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
          开始使用
        </button>
      </div>
    </Layout>
  )
}
```

### 任务 4.2: 创建仪表盘页面
**目标**: 创建显示用户数据的仪表盘
**开始条件**: 首页已创建
**结束条件**: 仪表盘页面可以显示
**测试**: 访问 /dashboard 显示仪表盘布局
```typescript
// apps/web/app/dashboard/page.tsx
import Layout from '@/components/Layout'
import Chart from '@/components/Chart'

export default function DashboardPage() {
  const mockData = [
    { date: 'Mon', commits: 5 },
    { date: 'Tue', commits: 3 },
    { date: 'Wed', commits: 8 },
    { date: 'Thu', commits: 2 },
    { date: 'Fri', commits: 6 }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">仪表盘</h1>
        <Chart data={mockData} />
      </div>
    </Layout>
  )
}
```

### 任务 4.3: 创建徽章页面
**目标**: 创建显示用户徽章的页面
**开始条件**: 仪表盘页面已创建
**结束条件**: 徽章页面可以显示徽章列表
**测试**: 访问 /badges 显示徽章网格
```typescript
// apps/web/app/badges/page.tsx
import Layout from '@/components/Layout'
import BadgeCard from '@/components/BadgeCard'

export default function BadgesPage() {
  const mockBadges = [
    {
      id: '1',
      name: '首次提交',
      description: '完成你的第一次代码提交',
      icon_url: '/badges/first-commit.png'
    },
    {
      id: '2',
      name: '连续提交',
      description: '连续7天都有代码提交',
      icon_url: '/badges/streak.png'
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">我的徽章</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
```

---

## 阶段 5: 数据集成

### 任务 5.1: 创建用户认证页面
**目标**: 创建登录注册页面
**开始条件**: 徽章页面已创建
**结束条件**: 用户可以登录注册
**测试**: 可以成功创建账户并登录
```typescript
// apps/web/app/auth/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) console.error('Error:', error.message)
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) console.error('Error:', error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">登录</h2>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="space-x-4">
            <button onClick={handleSignIn} className="bg-blue-500 text-white px-4 py-2 rounded">
              登录
            </button>
            <button onClick={handleSignUp} className="bg-green-500 text-white px-4 py-2 rounded">
              注册
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 任务 5.2: 实现用户认证状态管理
**目标**: 管理用户的登录状态
**开始条件**: 认证页面已创建
**结束条件**: 应用可以识别用户登录状态
**测试**: 登录后显示用户信息，未登录时重定向到登录页

### 任务 5.3: 连接仪表盘与真实数据
**目标**: 从 Supabase 获取用户提交数据
**开始条件**: 认证状态管理已实现
**结束条件**: 仪表盘显示真实数据
**测试**: 仪表盘显示从数据库获取的提交数据

### 任务 5.4: 连接徽章页面与真实数据
**目标**: 从 Supabase 获取用户徽章数据
**开始条件**: 仪表盘数据连接已完成
**结束条件**: 徽章页面显示用户已解锁的徽章
**测试**: 徽章页面显示从数据库获取的徽章数据

---

## 阶段 6: VSCode 插件开发

### 任务 6.1: 创建插件基础结构
**目标**: 设置 VSCode 插件的基本文件
**开始条件**: VSCode 插件项目已初始化
**结束条件**: 插件可以加载到 VSCode 中
**测试**: 插件在 VSCode 扩展列表中可见

### 任务 6.2: 实现 Git 提交监听
**目标**: 监听用户的 Git 提交操作
**开始条件**: 插件基础结构已创建
**结束条件**: 可以检测到 Git 提交事件
**测试**: 提交代码时插件能记录提交信息

### 任务 6.3: 实现数据上传到 Supabase
**目标**: 将收集的提交数据上传到 Supabase
**开始条件**: Git 提交监听已实现
**结束条件**: 提交数据成功上传到数据库
**测试**: Supabase 数据库中可以看到上传的提交记录

### 任务 6.4: 添加插件配置界面
**目标**: 允许用户配置插件设置
**开始条件**: 数据上传功能已实现
**结束条件**: 用户可以在 VSCode 中配置插件
**测试**: 可以通过设置页面配置插件参数

---

## 阶段 7: 徽章系统实现

### 任务 7.1: 创建徽章解锁逻辑
**目标**: 实现徽章解锁的条件判断
**开始条件**: 数据上传功能已实现
**结束条件**: 满足条件时自动解锁徽章
**测试**: 完成特定任务后徽章自动解锁

### 任务 7.2: 实现徽章解锁通知
**目标**: 徽章解锁时显示通知
**开始条件**: 徽章解锁逻辑已实现
**结束条件**: 解锁徽章时显示动画通知
**测试**: 解锁徽章时看到通知动画

### 任务 7.3: 添加更多徽章类型
**目标**: 增加更多种类的徽章
**开始条件**: 基础徽章系统已实现
**结束条件**: 有多种不同类型的徽章
**测试**: 可以解锁多种类型的徽章

---

## 阶段 8: 测试与优化

### 任务 8.1: 端到端测试
**目标**: 测试完整的数据流程
**开始条件**: 所有功能已实现
**结束条件**: 从 VSCode 插件到 Web 仪表盘的完整流程正常
**测试**: 提交代码 → 数据上传 → 徽章解锁 → Web 显示

### 任务 8.2: 性能优化
**目标**: 优化应用性能
**开始条件**: 端到端测试通过
**结束条件**: 应用响应速度快
**测试**: 页面加载时间 < 2秒

### 任务 8.3: 错误处理
**目标**: 添加完善的错误处理
**开始条件**: 性能优化完成
**结束条件**: 应用能优雅处理各种错误
**测试**: 网络错误、数据错误等情况下应用不崩溃

### 任务 8.4: 部署准备
**目标**: 准备生产环境部署
**开始条件**: 错误处理完成
**结束条件**: 应用可以部署到生产环境
**测试**: 在测试环境中成功部署并运行

---

## 任务执行说明

每个任务都应该：
1. **独立完成** - 不依赖其他未完成的任务
2. **可测试** - 有明确的测试标准
3. **小规模** - 可以在 1-2 小时内完成
4. **有明确目标** - 开始和结束条件清晰

建议按照任务编号顺序执行，每个任务完成后进行测试，确保功能正常后再进行下一个任务。
