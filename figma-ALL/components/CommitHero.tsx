import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Commit {
  id: string;
  time: string;
  message: string;
  xp: number;
  iconType: 'check' | 'clock' | 'star';
}

interface CommitHeroProps {
  onNewCommit?: (xp: number) => void;
}

export function CommitHero({ onNewCommit }: CommitHeroProps) {
  const [currentXP, setCurrentXP] = useState(245);
  const targetXP = 300;
  const streak = 5;
  
  const commits: Commit[] = [
    {
      id: '1',
      time: '08:45',
      message: 'Fixed payment',
      xp: 15,
      iconType: 'check'
    },
    {
      id: '2', 
      time: '10:12',
      message: 'Refactor user',
      xp: 20,
      iconType: 'clock'
    },
    {
      id: '3',
      time: '13:30', 
      message: 'Added dark m...',
      xp: 25,
      iconType: 'star'
    }
  ];

  const progressPercentage = (currentXP / targetXP) * 100;

  const handleCommitClick = (commit: Commit) => {
    console.log(`Clicked commit: ${commit.message}`);
  };

  // 金币图标组件 - 使用ImageWithFallback，您可以替换为实际的金币图像
  const CoinIcon = () => (
    <div className="w-5 h-5 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1605792657660-596af9009e82?w=20&h=20&fit=crop&crop=center" 
        alt="Gold Coin"
        className="w-full h-full rounded-full object-cover"
        style={{
          // 备用样式，如果图像加载失败则显示
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          border: '2px solid #fcd34d'
        }}
      />
      {/* 您可以将上面的src替换为您截取的金币图像路径 */}
    </div>
  );

  // 火花图标组件 - 现在使用ImageWithFallback，您可以替换为实际的火花图像
  const FlameIcon = () => (
    <div className="w-5 h-5 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=20&h=20&fit=crop&crop=center"
        alt="Flame Icon"
        className="w-full h-full object-cover"
        style={{
          // 备用样式，如果图像加载失败则显示火焰色
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          borderRadius: '4px'
        }}
      />
      {/* 您可以将上面的src替换为您截取的火花图像路径 */}
    </div>
  );

  // 对勾图标组件 - 使用ImageWithFallback，尺寸增大
  const CheckIcon = () => (
    <div className="w-6 h-6 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=24&h=24&fit=crop&crop=center"
        alt="Check Icon"
        className="w-full h-full object-cover rounded-sm"
        style={{
          background: '#10b981',
          borderRadius: '3px'
        }}
      />
      {/* 您可以将上面的src替换为您截取的对勾图像路径 */}
    </div>
  );

  // 时钟图标组件 - 使用ImageWithFallback，尺寸增大
  const ClockIcon = () => (
    <div className="w-6 h-6 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1501139083538-0139583c060f?w=24&h=24&fit=crop&crop=center"
        alt="Clock Icon"
        className="w-full h-full object-cover rounded-sm"
        style={{
          background: '#fb923c',
          borderRadius: '3px'
        }}
      />
      {/* 您可以将上面的src替换为您截取的时钟图像路径 */}
    </div>
  );

  // 星星图标组件 - 使用ImageWithFallback，尺寸增大
  const StarIcon = () => (
    <div className="w-6 h-6 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=24&h=24&fit=crop&crop=center"
        alt="Star Icon"
        className="w-full h-full object-cover rounded-sm"
        style={{
          background: '#3b82f6',
          borderRadius: '3px'
        }}
      />
      {/* 您可以将上面的src替换为您截取的星星图像路径 */}
    </div>
  );

  // 根据图标类型渲染对应的图标组件
  const renderCommitIcon = (iconType: string) => {
    switch (iconType) {
      case 'check':
        return <CheckIcon />;
      case 'clock':
        return <ClockIcon />;
      case 'star':
        return <StarIcon />;
      default:
        return <CheckIcon />;
    }
  };

  // 头像组件 - 现在使用ImageWithFallback，您可以替换为实际的头像图像  
  const HeroAvatar = () => (
    <div className="w-12 h-12 relative">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face"
        alt="Hero Avatar"
        className="w-full h-full rounded-full object-cover border-2 border-orange-300"
        style={{
          // 备用样式，如果图像加载失败则显示
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
        }}
      />
      {/* 您可以将上面的src替换为您截取的头像图像路径 */}
    </div>
  );

  return (
    <Card className="w-full h-[520px] bg-[#252a3a] border-[#3a4051] p-6 text-white rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HeroAvatar />
          <h1 className="text-2xl font-semibold text-white">Commit Hero</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-slate-400 hover:text-white hover:bg-[#3a4051] rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <motion.div 
          className="flex items-center justify-between"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2">
            <CoinIcon />
            <span className="text-slate-300">Today's Score:</span>
          </div>
          <motion.span 
            className="text-xl font-semibold text-white"
            key={currentXP}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            {currentXP} XP
          </motion.span>
        </motion.div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlameIcon />
            <span className="text-slate-300">Streak:</span>
          </div>
          <span className="text-xl font-semibold text-white">{streak} days</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-white">Recent Commits</h3>
        </div>

        <div className="space-y-1">
          {commits.map((commit, index) => (
            <motion.div
              key={commit.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#3a4051] cursor-pointer transition-colors"
              onClick={() => handleCommitClick(commit)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-[#3a4051] rounded-lg flex items-center justify-center flex-shrink-0">
                {renderCommitIcon(commit.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm flex-shrink-0">{commit.time}</span>
                  <span className="text-white truncate">{commit.message}</span>
                </div>
              </div>
              <span className="text-emerald-400 font-medium flex-shrink-0">+{commit.xp} XP</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-[#3a4051] rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-slate-300 text-sm">
          Next Goal: Reach {targetXP} XP for 'Code Ninja'
        </p>
      </div>
    </Card>
  );
}