import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: '缺少邮箱参数' }, { status: 400 });
    }

    // 获取用户
    const user = dbOperations.getUser(email);
    if (!user) {
      return NextResponse.json({ badges: [], userBadges: [] });
    }

    // 获取所有徽章和用户已解锁的徽章
    const allBadges = dbOperations.getBadges();
    const userBadges = dbOperations.getUserBadges(user.id);

    return NextResponse.json({ badges: allBadges, userBadges });
  } catch (error) {
    console.error('获取徽章失败:', error);
    return NextResponse.json({ error: '获取徽章失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, badgeId } = body;

    // 获取用户
    const user = dbOperations.getUser(email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 解锁徽章
    const result = dbOperations.unlockBadge(user.id, badgeId);

    return NextResponse.json({ success: true, unlocked: result.changes > 0 });
  } catch (error) {
    console.error('解锁徽章失败:', error);
    return NextResponse.json({ error: '解锁徽章失败' }, { status: 500 });
  }
}
