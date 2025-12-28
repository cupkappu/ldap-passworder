# LDAP Password Changer

[中文](/README.zh.md)

A small web application built with Next.js that allows users to change their LDAP password. It supports Docker-based deployments and optional SSO (via reverse proxy headers).

## Features ✅

- Self-service LDAP password change
- Uses an admin bind to perform changes safely
- Verifies the current password before changing
- Password strength validation (minimum 8 characters)
- Simple, responsive UI
- Dockerized for production deployments
- Environment-driven configuration

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- LDAP client: ldapjs
- Language: TypeScript
- Containerization: Docker & Docker Compose

## Quickstart

### Requirements

- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- An LDAP server

### Local development

1. Clone the repository and install dependencies:

```bash
git clone <repo>
cd ldap-passworder
npm install
```

2. Copy and edit environment variables:

```bash
cp .env.example .env.local
# edit .env.local
```

3. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000

### Docker Deployment

#### Option A — Docker Compose (recommended)

1. Edit `docker-compose.yml` environment variables for your LDAP server.
2. Start the services:

```bash
docker-compose up -d
```

3. View logs:

```bash
docker-compose logs -f ldap-passworder
```

4. Stop services:

```bash
docker-compose down
```

#### Option B — Docker only

```bash
docker build -t ldap-passworder .
docker run -d -p 3000:3000 \
  -e LDAP_URL=ldap://your-ldap-server:389 \
  -e LDAP_BASE_DN=dc=example,dc=com \
  -e LDAP_ADMIN_DN=cn=admin,dc=example,dc=com \
  -e LDAP_ADMIN_PASSWORD=your_admin_password \
  -e LDAP_USER_SEARCH_BASE=ou=users,dc=example,dc=com \
  -e LDAP_USER_SEARCH_FILTER='(uid={username})' \
  --name ldap-passworder ldap-passworder
```

### Useful note: local test LDAP

If you don't have an LDAP server handy, you can spin up the included OpenLDAP from `docker-compose.yml`:

```bash
docker-compose up -d openldap
```

Default test credentials:
- Admin DN: `cn=admin,dc=example,dc=com`
- Admin password: `admin_password`
- Base DN: `dc=example,dc=com`

## Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `LDAP_URL` | LDAP server URL | `ldap://localhost:389` |
| `LDAP_BASE_DN` | Base DN | `dc=example,dc=com` |
| `LDAP_ADMIN_DN` | Admin bind DN | `cn=admin,dc=example,dc=com` |
| `LDAP_ADMIN_PASSWORD` | Admin password | `admin_password` |
| `LDAP_USER_SEARCH_BASE` | User search base | `ou=users,dc=example,dc=com` |
| `LDAP_USER_SEARCH_FILTER` | Search filter (uses `{username}`) | `(uid={username})` |
| `NEXT_PUBLIC_APP_NAME` | App name | `LDAP Password Changer` |

### LDAP search filters

Common filters for `{username}` replacement:

- `(uid={username})` — search by uid
- `(cn={username})` — search by commonName
- `(sAMAccountName={username})` — Active Directory
- `(mail={username})` — search by email

## SSO / Remote-user support

This application supports simple SSO flows where a reverse proxy or identity provider (e.g., Authelia) sets `Remote-user` (case-insensitive; also checks `remote-user` / `remote_user`) and `Remote-email` headers.

Behavior:
- Middleware logs these headers for debugging
- Middleware sets `remote-user` and `remote-email` cookies (URL encoded), the client reads `remote-user` to pre-fill the username input
- The `/api/change-password` POST handler also logs these headers at the start of the request for auditing/debugging

Security note: Never trust these headers directly from the Internet. Ensure only your trusted reverse proxy can set them and strip the headers from incoming client requests.

Example (Nginx + Authelia):

```nginx
location / {
  auth_request /authelia;
  auth_request_set $remote_user $upstream_http_remote_user;
  auth_request_set $remote_email $upstream_http_remote_email;

  proxy_set_header Remote-user $remote_user;
  proxy_set_header Remote-email $remote_email;

  proxy_pass http://ldap-passworder:3000;
}
```

## Security recommendations

1. Protect environment variables (do not commit `.env.local`)
2. Use HTTPS in production (reverse proxy like Nginx)
3. Restrict access by network/firewall
4. Enforce strong password policies as needed
5. Add auditing/logging for sensitive operations
6. Use LDAPS (LDAP over TLS) in production

## Troubleshooting

### Can't connect to LDAP

- Check LDAP URL and network
- Verify firewall and ports (389/636)

### Authentication fails

- Verify user search base and filter
- Verify admin DN and password

### Docker can't reach LDAP

- If the LDAP server runs on host: use `host.docker.internal` on some platforms, or host networking

## Development

### Build & start

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## License

MIT

## Contributing

PRs and issues welcome.

## Support

Open an issue if you need help.

## Getting Started

Run the dev server:

```bash
npm run dev
# or
# yarn dev
# or
# pnpm dev
```
