# LDAP 密码修改工具

一个基于Next.js构建的简单LDAP密码修改Web应用，支持Docker部署。

## 功能特性

- ✅ 用户自助修改LDAP密码
- ✅ 使用管理员账号进行密码修改操作
- ✅ 验证当前密码正确性
- ✅ 密码强度要求（最少8位）
- ✅ 友好的用户界面
- ✅ Docker容器化部署
- ✅ 环境变量配置

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI样式**: Tailwind CSS
- **LDAP客户端**: ldapjs
- **类型支持**: TypeScript
- **容器化**: Docker & Docker Compose

## 快速开始

### 环境要求

- Node.js 20+
- Docker & Docker Compose (用于容器化部署)
- LDAP服务器

### 本地开发

1. **克隆项目**
```bash
cd ldap-passworder
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 到 `.env.local` 并修改配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# LDAP服务器配置
LDAP_URL=ldap://your-ldap-server:389
LDAP_BASE_DN=dc=example,dc=com
LDAP_ADMIN_DN=cn=admin,dc=example,dc=com
LDAP_ADMIN_PASSWORD=your_admin_password

# 用户搜索配置
LDAP_USER_SEARCH_BASE=ou=users,dc=example,dc=com
LDAP_USER_SEARCH_FILTER=(uid={username})

# 应用配置
NEXT_PUBLIC_APP_NAME=LDAP密码修改工具
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

### Docker部署

#### 方式1: 使用Docker Compose（推荐）

1. **编辑 `docker-compose.yml` 中的环境变量**

修改LDAP服务器配置信息：

```yaml
environment:
  LDAP_URL: ldap://your-ldap-server:389
  LDAP_BASE_DN: dc=example,dc=com
  LDAP_ADMIN_DN: cn=admin,dc=example,dc=com
  LDAP_ADMIN_PASSWORD: your_admin_password
  LDAP_USER_SEARCH_BASE: ou=users,dc=example,dc=com
  LDAP_USER_SEARCH_FILTER: (uid={username})
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **查看日志**
```bash
docker-compose logs -f ldap-passworder
```

4. **停止服务**
```bash
docker-compose down
```

#### 方式2: 仅使用Docker

1. **构建镜像**
```bash
docker build -t ldap-passworder .
```

2. **运行容器**
```bash
docker run -d \
  -p 3000:3000 \
  -e LDAP_URL=ldap://your-ldap-server:389 \
  -e LDAP_BASE_DN=dc=example,dc=com \
  -e LDAP_ADMIN_DN=cn=admin,dc=example,dc=com \
  -e LDAP_ADMIN_PASSWORD=your_admin_password \
  -e LDAP_USER_SEARCH_BASE=ou=users,dc=example,dc=com \
  -e LDAP_USER_SEARCH_FILTER="(uid={username})" \
  --name ldap-passworder \
  ldap-passworder
```

### 测试LDAP服务器（可选）

如果你没有LDAP服务器，可以使用docker-compose.yml中包含的OpenLDAP服务：

```bash
docker-compose up -d openldap
```

这将启动一个测试用的OpenLDAP服务器：
- 管理员DN: `cn=admin,dc=example,dc=com`
- 管理员密码: `admin_password`
- Base DN: `dc=example,dc=com`

## 配置说明

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `LDAP_URL` | LDAP服务器地址 | `ldap://localhost:389` |
| `LDAP_BASE_DN` | LDAP基础DN | `dc=example,dc=com` |
| `LDAP_ADMIN_DN` | 管理员DN | `cn=admin,dc=example,dc=com` |
| `LDAP_ADMIN_PASSWORD` | 管理员密码 | `admin_password` |
| `LDAP_USER_SEARCH_BASE` | 用户搜索基础DN | `ou=users,dc=example,dc=com` |
| `LDAP_USER_SEARCH_FILTER` | 用户搜索过滤器 | `(uid={username})` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `LDAP密码修改工具` |

### LDAP用户搜索过滤器

过滤器中的 `{username}` 会被替换为用户输入的用户名。常见的过滤器：

- `(uid={username})` - 通过uid查找
- `(cn={username})` - 通过cn查找
- `(sAMAccountName={username})` - Active Directory
- `(mail={username})` - 通过邮箱查找

## 项目结构

```
ldap-passworder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── change-password/
│   │   │       └── route.ts          # 密码修改API
│   │   ├── globals.css               # 全局样式
│   │   ├── layout.tsx                # 布局组件
│   │   └── page.tsx                  # 主页面
│   └── lib/
│       └── ldap.ts                   # LDAP工具函数
├── .env.example                      # 环境变量示例
├── .env.local                        # 本地环境变量（不提交）
├── docker-compose.yml                # Docker Compose配置
├── Dockerfile                        # Docker镜像配置
├── next.config.ts                    # Next.js配置
├── package.json                      # 项目依赖
└── README.md                         # 项目文档
```

## SSO / Remote-user 支持

本项目支持基于反向代理或身份提供器（例如 Authelia）的简单联合登录（SSO）场景。若上游代理在请求头中添加 `Remote-user`（或 `remote-user` / `remote_user`）和 `Remote-email`，应用会：

- 在服务端（middleware）记录这两个 header（用于调试）
- 在 middleware 中把 `remote-user` 和 `remote-email` 写入 Cookie（URL 编码），客户端会在页面加载时读取 `remote-user` 并自动填充用户名字段
- 在 `/api/change-password` 的 `POST` 处理器也会在请求开始处打印相同的 header，便于审计与调试

**重要安全提示**：绝对不要直接信任来自客户端的这些头；确保只有可信的反向代理（如 Authelia / Nginx）会添加这些头，且在代理外部移除来自客户端的同名头。

示例（Nginx + Authelia）配置片段：

```nginx
# 假设 Authelia 设置在 /authelia 并返回 Remote-User / Remote-Email 响应头
location / {
  auth_request /authelia;
  # 将 Authelia 返回的响应头映射为上游请求头
  auth_request_set $remote_user $upstream_http_remote_user;
  auth_request_set $remote_email $upstream_http_remote_email;

  proxy_set_header Remote-user $remote_user;
  proxy_set_header Remote-email $remote_email;

  proxy_pass http://ldap-passworder:3000;
}
```


## 安全建议

1. **保护环境变量**: 不要将 `.env.local` 或包含敏感信息的配置文件提交到版本控制系统
2. **使用HTTPS**: 生产环境中应使用反向代理（如Nginx）提供HTTPS支持
3. **限制访问**: 通过防火墙或网络策略限制应用访问范围
4. **强密码策略**: 根据需要调整密码强度要求
5. **审计日志**: 考虑添加操作日志记录
6. **LDAPS**: 生产环境建议使用LDAPS（LDAP over TLS）

## 常见问题

### 1. 连接LDAP服务器失败

检查：
- LDAP服务器地址是否正确
- 网络连接是否畅通
- 防火墙是否允许389端口（LDAP）或636端口（LDAPS）

### 2. 用户验证失败

检查：
- 用户搜索基础DN是否正确
- 用户搜索过滤器是否匹配
- 管理员DN和密码是否正确

### 3. Docker容器无法访问LDAP服务器

如果LDAP服务器在宿主机：
- Linux/Mac: 使用 `host.docker.internal`
- 或将容器网络模式设置为host模式

## 开发

### 构建生产版本

```bash
npm run build
npm start
```

### 代码检查

```bash
npm run lint
```

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！

## 支持

如有问题，请提交Issue或联系维护者。


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
