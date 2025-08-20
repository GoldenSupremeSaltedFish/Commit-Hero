'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { AchievementModal } from '@/components/AchievementModal';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout>
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">测试页面</h1>
        <p className="text-gray-600">点击下面的按钮来测试成就徽章动画</p>
        
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          显示成就徽章
        </Button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full">
              <AchievementModal onClose={() => setShowModal(false)} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
