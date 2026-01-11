import { NextRequest, NextResponse } from 'next/server';
import { createUser, getLdapConfig } from '@/lib/ldap';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, confirmPassword, email, cn, sn } = body;

    // 基本校验
    if (!username || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: '请填写用户名和密码' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: '两次输入的密码不一致' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: '密码长度至少为8位' }, { status: 400 });
    }

    const config = getLdapConfig();

    const result = await createUser(config, { username, password, email, cn, sn });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    console.error('注册 API 错误:', error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
}
