import { NextRequest, NextResponse } from 'next/server';
import { changePassword, getLdapConfig } from '@/lib/ldap';

export async function POST(request: NextRequest) {
  try {
    const remoteUser = request.headers.get('Remote-user') ?? request.headers.get('remote-user') ?? request.headers.get('remote_user');
    const remoteEmail = request.headers.get('Remote-email') ?? request.headers.get('remote-email') ?? request.headers.get('remote_email');
    console.log(`Change-password headers: Remote-user=${remoteUser ?? '-'} Remote-email=${remoteEmail ?? '-'}`);

    const body = await request.json();
    const { username, currentPassword, newPassword, confirmPassword } = body;

    // 验证输入
    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: '请填写所有字段' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: '两次输入的新密码不一致' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: '新密码长度至少为8位' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: '新密码不能与当前密码相同' },
        { status: 400 }
      );
    }

    // 获取LDAP配置
    const config = getLdapConfig();

    // 修改密码
    const result = await changePassword(config, {
      username,
      currentPassword,
      newPassword,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
