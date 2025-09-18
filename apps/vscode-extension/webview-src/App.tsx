import { useEffect, useState } from 'react';
import { AchievementModal } from './components/AchievementModal';
import { CommitHero } from './components/CommitHero';
import { NotificationToast } from './components/NotificationToast';

// VSCode API 类型声明
declare global {
  interface Window {
    vscodeAPI: {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
    handleVSCodeMessage: (message: any) => void;
  }
}

interface Notification {
  id: string;
  type: 'xp' | 'achievement';
  title: string;
  message: string;
  xp?: number;
}

interface GitStats {
  totalCommits: number;
  streakDays: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  totalFilesChanged: number;
  lastCommitDate: string;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    category: 'commit' | 'streak' | 'lines' | 'files';
  }>;
}

export default function App() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [gitStats, setGitStats] = useState<GitStats | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
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

  // 设置 VSCode 消息处理器
  useEffect(() => {
    window.handleVSCodeMessage = (message: any) => {
      console.log('收到 VSCode 消息:', message);

      switch (message.type) {
        case 'updateData':
          setGitStats(message.data);
          break;
        case 'updateTrackingStatus':
          setIsTracking(message.isTracking);
          break;
        case 'gitStatsResponse':
          setGitStats(message.data);
          break;
        case 'achievementUnlocked':
          // Show achievement notification
          addNotification({
            type: 'achievement',
            title: `🎉 ${message.achievement.name}`,
            message: message.achievement.description,
          });
          // Show achievement modal with real data
          setCurrentAchievement(message.achievement);
          setShowAchievement(true);
          break;
      }
    };

    // 请求初始数据
    if (window.vscodeAPI) {
      window.vscodeAPI.postMessage({ type: 'getGitStats' });
    }

    return () => {
      window.handleVSCodeMessage = undefined;
    };
  }, []);

  // 模拟新的XP获得
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showAchievement) {
        addNotification({
          type: 'xp',
          title: 'Great Work!',
          message: 'Code review completed',
          xp: 10,
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showAchievement]);

  return (
    <div className='min-h-screen bg-[#1a1d29] p-6 relative'>
      <div className='max-w-[800px] mx-auto'>
        <div className='flex gap-6'>
          <div className='w-[387px]'>
            <CommitHero
              onNewCommit={xp =>
                addNotification({
                  type: 'xp',
                  title: 'Commit Success!',
                  message: 'Your code has been committed',
                  xp,
                })
              }
              gitStats={gitStats}
              isTracking={isTracking}
            />
          </div>
          {showAchievement && (
            <div className='w-[387px]'>
              <AchievementModal
                onClose={() => setShowAchievement(false)}
                achievement={currentAchievement}
              />
            </div>
          )}
        </div>
      </div>

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
}
