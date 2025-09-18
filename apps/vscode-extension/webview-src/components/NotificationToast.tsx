import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';

interface Notification {
  id: string;
  type: 'xp' | 'achievement';
  title: string;
  message: string;
  xp?: number;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notifications, onDismiss }: NotificationToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-[#252a3a] border border-[#3a4051] rounded-lg p-4 min-w-80 text-white shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {notification.type === 'xp' ? (
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-white">{notification.title}</h4>
                  <p className="text-slate-300 text-sm">{notification.message}</p>
                  {notification.xp && (
                    <p className="text-emerald-400 font-medium">+{notification.xp} XP</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}