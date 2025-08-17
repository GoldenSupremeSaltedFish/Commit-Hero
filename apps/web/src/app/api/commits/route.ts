import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, repository, commitHash, message, linesAdded, linesDeleted } = body;

    // 获取或创建用户
    let user = dbOperations.getUser(email);
    if (!user) {
      const result = dbOperations.createUser(email);
      user = dbOperations.getUser(email);
    }

    // 添加提交记录
    const result = dbOperations.addCommit(
      user.id,
      repository,
      commitHash,
      message,
      linesAdded || 0,
      linesDeleted || 0
    );

    return NextResponse.json({ success: true, commitId: result.lastInsertRowid });
  } catch (error) {
    console.error('添加提交记录失败:', error);
    return NextResponse.json({ error: '添加提交记录失败' }, { status: 500 });
  }
}

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
      return NextResponse.json({ commits: [] });
    }

    // 获取用户的提交记录
    const commits = dbOperations.getCommitsByUser(user.id);
    return NextResponse.json({ commits });
  } catch (error) {
    console.error('获取提交记录失败:', error);
    return NextResponse.json({ error: '获取提交记录失败' }, { status: 500 });
  }
}
