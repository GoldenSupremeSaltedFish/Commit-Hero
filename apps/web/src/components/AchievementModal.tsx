import React, { useState } from 'react';
import { Trophy, Share, Code, Bug, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AchievementModalProps {
  onClose: () => void;
}

export function AchievementModal({ onClose }: AchievementModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleShareSlack = () => {
    // 模拟分享到Slack的功能
    console.log('Sharing achievement to Slack...');
    // 在真实应用中，这里会调用Slack API
    alert('Achievement shared to Slack! 🎉');
    onClose();
  };

  const handleOK = () => {
    onClose();
  };

  const handleBadgeClick = () => {
    setIsFlipped(!isFlipped);
  };

  // 奖章组件 - 现在支持翻转动画
  const AchievementBadge = () => (
    <div className="relative w-40 h-40 cursor-pointer" onClick={handleBadgeClick}>
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={{ 
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
      >
        {/* 正面 - Bug Buster 徽章 */}
        <motion.div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden" }}
          animate={{ scale: isFlipped ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=160&h=160&fit=crop&crop=center"
            alt="Achievement Badge"
            className="w-full h-full object-cover rounded-full"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              boxShadow: isFlipped ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 15px 35px rgba(0, 0, 0, 0.4)'
            }}
          />
        </motion.div>

        {/* 背面 - 详细信息 */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
          animate={{ scale: isFlipped ? 1 : 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full p-4 shadow-lg flex flex-col items-center justify-center text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-full h-full flex flex-col items-center justify-center">
              <Bug className="w-8 h-8 text-white mb-2" />
              <div className="text-white text-xs space-y-1">
                <div className="flex items-center gap-1 justify-center">
                  <Code className="w-3 h-3" />
                  <span>10 Bugs Fixed</span>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" />
                  <span>In 1 Day</span>
                </div>
                <div className="text-yellow-200 font-semibold text-sm mt-2">
                  Level 3
                </div>
                <div className="text-white/80 text-xs">
                  Epic Debugging!
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <Card className="w-full h-[520px] bg-[#252a3a] border-[#3a4051] p-6 text-white rounded-2xl">
      <div className="flex flex-col h-full">
        {/* 上半部分内容 */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-5">
          <div className="flex items-center justify-center gap-2 -mt-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-2xl font-semibold text-white whitespace-nowrap">Achievement Unlocked!</h2>
          </div>

          <AchievementBadge />

          <motion.div 
            className="text-center space-y-3"
            animate={{ 
              y: isFlipped ? -10 : 0,
              opacity: isFlipped ? 0.8 : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-3xl font-bold text-yellow-400">Bug Buster</h3>
            <p className="text-slate-300 text-lg">
              {isFlipped ? "Mastered the art of debugging!" : "Fixed 10 bugs in a day!"}
            </p>
            <p className="text-emerald-400 text-xl font-semibold">+50 XP</p>
          </motion.div>
        </div>

        {/* 底部按钮区域 - 正确的向上移动 */}
        <div className="mb-4">
          <div className="flex gap-3 -mx-2">
            <Button
              onClick={handleShareSlack}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 px-6"
            >
              <Share className="w-4 h-4 mr-2" />
              Share on Slack
            </Button>
            <Button
              onClick={handleOK}
              variant="outline"
              className="flex-1 border-[#3a4051] bg-transparent text-white hover:bg-[#3a4051] rounded-lg py-3 px-6"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
