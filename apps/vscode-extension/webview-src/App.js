"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const AchievementModal_1 = require("./components/AchievementModal");
const CommitHero_1 = require("./components/CommitHero");
const NotificationToast_1 = require("./components/NotificationToast");
function App() {
    const [showAchievement, setShowAchievement] = (0, react_1.useState)(true);
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [gitStats, setGitStats] = (0, react_1.useState)(null);
    const [isTracking, setIsTracking] = (0, react_1.useState)(false);
    const addNotification = (notification) => {
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
    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    // 设置 VSCode 消息处理器
    (0, react_1.useEffect)(() => {
        window.handleVSCodeMessage = (message) => {
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
    (0, react_1.useEffect)(() => {
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
    return (<div className='min-h-screen bg-[#1a1d29] p-6 relative'>
      <div className='max-w-[800px] mx-auto'>
        <div className='flex gap-6'>
          <div className='w-[387px]'>
            <CommitHero_1.CommitHero onNewCommit={xp => addNotification({
            type: 'xp',
            title: 'Commit Success!',
            message: 'Your code has been committed',
            xp,
        })}/>
          </div>
          {showAchievement && (<div className='w-[387px]'>
              <AchievementModal_1.AchievementModal onClose={() => setShowAchievement(false)}/>
            </div>)}
        </div>
      </div>

      <NotificationToast_1.NotificationToast notifications={notifications} onDismiss={dismissNotification}/>
    </div>);
}
exports.default = App;
//# sourceMappingURL=App.js.map