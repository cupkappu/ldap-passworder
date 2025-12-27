import ldap, { Client, SearchOptions } from 'ldapjs';

export interface LdapConfig {
  url: string;
  baseDN: string;
  adminDN: string;
  adminPassword: string;
  userSearchBase: string;
  userSearchFilter: string;
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

/**
 * 创建LDAP客户端连接
 */
function createClient(url: string): Client {
  return ldap.createClient({
    url,
    timeout: 5000,
    connectTimeout: 10000,
  });
}

/**
 * 绑定LDAP连接
 */
function bindClient(client: Client, dn: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    client.bind(dn, password, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 搜索用户DN
 */
function searchUserDN(
  client: Client,
  searchBase: string,
  filter: string
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const opts: SearchOptions = {
      filter,
      scope: 'sub',
      attributes: ['dn'],
    };

    client.search(searchBase, opts, (err, res) => {
      if (err) {
        reject(err);
        return;
      }

      let userDN: string | null = null;

      res.on('searchEntry', (entry) => {
        userDN = entry.objectName?.toString() || null;
      });

      res.on('error', (err) => {
        reject(err);
      });

      res.on('end', () => {
        resolve(userDN);
      });
    });
  });
}

/**
 * 验证用户当前密码
 */
async function verifyUserPassword(
  url: string,
  userDN: string,
  password: string
): Promise<boolean> {
  const client = createClient(url);
  
  try {
    console.log('尝试验证用户密码，DN:', userDN);
    await bindClient(client, userDN, password);
    console.log('用户密码验证成功');
    return true;
  } catch (error) {
    console.error('用户密码验证失败:', error);
    return false;
  } finally {
    client.unbind();
  }
}

/**
 * 修改用户密码
 */
function modifyPassword(
  client: Client,
  userDN: string,
  newPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const change = new ldap.Change({
      operation: 'replace',
      modification: {
        type: 'userPassword',
        values: [newPassword],
      },
    });

    client.modify(userDN, [change], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * 主函数：修改用户密码
 */
export async function changePassword(
  config: LdapConfig,
  request: ChangePasswordRequest
): Promise<{ success: boolean; message: string }> {
  let adminClient: Client | null = null;

  try {
    // 1. 使用管理员账号连接LDAP
    adminClient = createClient(config.url);
    await bindClient(adminClient, config.adminDN, config.adminPassword);

    // 2. 搜索用户DN
    const filter = config.userSearchFilter.replace(/{username}/g, request.username);
    console.log('搜索用户，filter:', filter, 'base:', config.userSearchBase);
    const userDN = await searchUserDN(adminClient, config.userSearchBase, filter);
    console.log('找到用户 DN:', userDN);

    if (!userDN) {
      return {
        success: false,
        message: '用户不存在',
      };
    }

    // 3. 验证用户当前密码
    const isPasswordValid = await verifyUserPassword(
      config.url,
      userDN,
      request.currentPassword
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: '当前密码错误',
      };
    }

    // 4. 修改密码
    await modifyPassword(adminClient, userDN, request.newPassword);

    return {
      success: true,
      message: '密码修改成功',
    };
  } catch (error) {
    console.error('LDAP操作失败:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '密码修改失败',
    };
  } finally {
    if (adminClient) {
      adminClient.unbind();
    }
  }
}

/**
 * 获取LDAP配置
 */
export function getLdapConfig(): LdapConfig {
  return {
    url: process.env.LDAP_URL || 'ldap://localhost:389',
    baseDN: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
    adminDN: process.env.LDAP_ADMIN_DN || 'cn=admin,dc=example,dc=com',
    adminPassword: process.env.LDAP_ADMIN_PASSWORD || '',
    userSearchBase: process.env.LDAP_USER_SEARCH_BASE || 'ou=users,dc=example,dc=com',
    userSearchFilter: process.env.LDAP_USER_SEARCH_FILTER || '(uid={username})',
  };
}
