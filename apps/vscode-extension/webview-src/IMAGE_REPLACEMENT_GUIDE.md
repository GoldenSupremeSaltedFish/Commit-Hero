# 图像替换指南

本应用中有以下几个位置可以替换为您从原设计图截取的实际图像：

## 1. 头像图标 (Hero Avatar)
**位置**: CommitHero 组件左上角
**文件**: `/components/CommitHero.tsx`
**尺寸**: 48x48 像素 (w-12 h-12)
**当前占位图像**: Unsplash 人像照片
**替换方法**: 
- 从原设计图截取头像部分
- 将图像保存为 PNG 或 JPG 格式
- 替换 HeroAvatar 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的头像图像路径.png" // 替换这里
  alt="Hero Avatar"
  className="w-full h-full rounded-full object-cover border-2 border-orange-300"
/>
```

## 2. 金币图标 (Coin Icon)
**位置**: CommitHero 组件中 "Today's Score" 旁边
**文件**: `/components/CommitHero.tsx`
**尺寸**: 20x20 像素 (w-5 h-5)
**当前占位图像**: Unsplash 金币图片
**替换方法**:
- 从原设计图截取金币图标部分
- 将图像保存为 PNG 格式（建议透明背景）
- 替换 CoinIcon 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的金币图像路径.png" // 替换这里
  alt="Gold Coin"
  className="w-full h-full rounded-full object-cover"
/>
```

## 3. 火花图标 (Flame Icon)
**位置**: CommitHero 组件中 "Streak" 旁边
**文件**: `/components/CommitHero.tsx`
**尺寸**: 20x20 像素 (w-5 h-5)
**当前占位图像**: Unsplash 火焰图片
**替换方法**:
- 从原设计图截取火花图标部分
- 将图像保存为 PNG 格式（建议透明背景）
- 替换 FlameIcon 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的火花图像路径.png" // 替换这里
  alt="Flame Icon"
  className="w-full h-full object-cover"
/>
```

## 4. 对勾图标 (Check Icon) - 增大尺寸
**位置**: Recent Commits 列表中，表示已完成的提交
**文件**: `/components/CommitHero.tsx`
**尺寸**: 24x24 像素 (w-6 h-6) - **已增大**
**容器尺寸**: 40x40 像素 (w-10 h-10) - **已增大**
**当前占位图像**: Unsplash 相关图片
**替换方法**:
- 从原设计图截取对勾图标部分
- 将图像保存为 PNG 格式（建议透明背景）
- 替换 CheckIcon 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的对勾图像路径.png" // 替换这里
  alt="Check Icon"
  className="w-full h-full object-cover rounded-sm"
/>
```

## 5. 时钟图标 (Clock Icon) - 增大尺寸
**位置**: Recent Commits 列表中，表示进行中的提交
**文件**: `/components/CommitHero.tsx`
**尺寸**: 24x24 像素 (w-6 h-6) - **已增大**
**容器尺寸**: 40x40 像素 (w-10 h-10) - **已增大**
**当前占位图像**: Unsplash 时钟图片
**替换方法**:
- 从原设计图截取时钟图标部分
- 将图像保存为 PNG 格式（建议透明背景）
- 替换 ClockIcon 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的时钟图像路径.png" // 替换这里
  alt="Clock Icon"
  className="w-full h-full object-cover rounded-sm"
/>
```

## 6. 星星图标 (Star Icon) - 增大尺寸
**位置**: Recent Commits 列表中，表示特殊/重要的提交
**文件**: `/components/CommitHero.tsx`
**尺寸**: 24x24 像素 (w-6 h-6) - **已增大**
**容器尺寸**: 40x40 像素 (w-10 h-10) - **已增大**
**当前占位图像**: Unsplash 星空图片
**替换方法**:
- 从原设计图截取星星图标部分
- 将图像保存为 PNG 格式（建议透明背景）
- 替换 StarIcon 组件中的 `src` 属性

```tsx
<ImageWithFallback
  src="您的星星图像路径.png" // 替换这里
  alt="Star Icon"
  className="w-full h-full object-cover rounded-sm"
/>
```

## 7. Bug Buster 成就奖章 - 带翻转动画
**位置**: AchievementModal 组件中央
**文件**: `/components/AchievementModal.tsx`
**尺寸**: 160x160 像素 (w-40 h-40) - **显著增大，约占横向40%空间**
**当前占位图像**: Unsplash 奖章图片
**新功能**: **可点击翻转动画** - 点击徽章可查看背面详细信息
**替换方法**:
- 从原设计图截取Bug Buster奖章部分（正面）
- 可选：准备一个背面设计图像（如果不想使用CSS设计的背面）
- 将图像保存为 PNG 格式（建议高分辨率）
- 替换正面图像的 `src` 属性

```tsx
<ImageWithFallback
  src="您的Bug_Buster奖章图像路径.png" // 替换这里
  alt="Achievement Badge"
  className="w-full h-full object-cover rounded-full"
/>
```

### 翻转动画特性：
- **交互方式**: 点击徽章进行翻转
- **动画效果**: 3D Y轴旋转，带弹簧缓动
- **正面显示**: 成就徽章图像
- **背面显示**: 详细的成就统计信息（10个Bug、1天内、等级3等）
- **视觉反馈**: 翻转时有轻微缩放和阴影变化
- **用户提示**: 底部显示"点击翻转"提示文字

## 最新功能更新
**Bug Buster 徽章的交互式翻转动画**：
- 模仿 Figma Smart Animate 的翻转效果
- 使用 Motion 库实现平滑的 3D 旋转动画
- 背面显示详细的成就信息，包含图标和统计数据
- 支持反复翻转，增强用户体验的趣味性
- 翻转时文字描述也会相应变化

**Recent Commits 区域的改进**：
- 图标容器从 32x32px 增大到 40x40px，占据更多视觉空间
- 实际图标从 16x16px 增大到 24x24px，更加清晰可见
- 条目间距从 12px 减少到 4px，创造更紧凑的布局
- 条目内边距优化为上下8px、左右12px，保持合适的点击区域

## 备用设计
如果图像加载失败，每个组件都有 CSS 备用设计。徽章背面完全使用 CSS 设计，无需额外图像。

## 图像格式建议
- **格式**: PNG（支持透明背景）或 JPG
- **质量**: 高质量，清晰
- **尺寸**: 按照上述指定尺寸，或更高分辨率（会自动缩放）
- **背景**: 透明背景（PNG）或与设计匹配的背景色
- **特别注意**: Bug Buster奖章建议使用高分辨率图像以保证在大尺寸和动画中的清晰度

## 替换步骤
1. 从原设计图截取相应的图标/图像
2. 调整图像大小到推荐尺寸
3. 保存图像到项目中的适当位置
4. 更新相应组件中的 `src` 属性
5. 测试图像是否正确显示
6. **新增**: 测试Bug Buster徽章的翻转动画效果

## 图标类型对应关系
在 Recent Commits 中，不同的提交类型使用不同的图标：
- `iconType: 'check'` → CheckIcon (对勾图标)
- `iconType: 'clock'` → ClockIcon (时钟图标)  
- `iconType: 'star'` → StarIcon (星星图标)

您可以根据需要添加更多图标类型或修改现有的图标映射。

## 动画交互说明
Bug Buster 徽章现在支持点击翻转，这个功能增加了用户体验的趣味性：
- 点击徽章查看详细的成就统计
- 再次点击可翻转回正面
- 翻转时有平滑的3D动画效果
- 背面显示成就的具体数据（Bug数量、完成时间、等级等）