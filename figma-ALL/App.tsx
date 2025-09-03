import React, { useState, useEffect } from 'react';
import { CommitHero } from './components/CommitHero';
import { AchievementModal } from './components/AchievementModal';
import { NotificationToast } from './components/NotificationToast';

interface Notification {
  id: string;
  type: 'xp' | 'achievement';
  title: string;
  message: string;
  xp?: number;
}

export default function App() {
  const [showAchievement, setShowAchievement] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString()
    };
    setNotifications(prev => [...prev, newNotification]);

    // 自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 模拟新的XP获得
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showAchievement) {
        addNotification({
          type: 'xp',
          title: 'Great Work!',
          message: 'Code review completed',
          xp: 10
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showAchievement]);

  return (
    <div className="min-h-screen bg-[#1a1d29] p-6 relative">
      <div className="max-w-[800px] mx-auto">
        <div className="flex gap-6">
          <div className="w-[387px]">
            <CommitHero onNewCommit={(xp) => addNotification({
              type: 'xp',
              title: 'Commit Success!',
              message: 'Your code has been committed',
              xp
            })} />
          </div>
          {showAchievement && (
            <div className="w-[387px]">
              <AchievementModal onClose={() => setShowAchievement(false)} />
            </div>
          )}
        </div>
      </div>
      
      <NotificationToast 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}