"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationToast = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("motion/react");
const lucide_react_1 = require("lucide-react");
function NotificationToast({ notifications, onDismiss }) {
    return (<div className="fixed top-4 right-4 z-50 space-y-2">
      <react_2.AnimatePresence>
        {notifications.map((notification) => (<react_2.motion.div key={notification.id} initial={{ opacity: 0, x: 300, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 300, scale: 0.8 }} className="bg-[#252a3a] border border-[#3a4051] rounded-lg p-4 min-w-80 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {notification.type === 'xp' ? (<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <lucide_react_1.Plus className="w-4 h-4 text-white"/>
                  </div>) : (<div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    🏆
                  </div>)}
                <div>
                  <h4 className="font-medium text-white">{notification.title}</h4>
                  <p className="text-slate-300 text-sm">{notification.message}</p>
                  {notification.xp && (<p className="text-emerald-400 font-medium">+{notification.xp} XP</p>)}
                </div>
              </div>
              <button onClick={() => onDismiss(notification.id)} className="text-slate-400 hover:text-white">
                <lucide_react_1.X className="w-4 h-4"/>
              </button>
            </div>
          </react_2.motion.div>))}
      </react_2.AnimatePresence>
    </div>);
}
exports.NotificationToast = NotificationToast;
//# sourceMappingURL=NotificationToast.js.map