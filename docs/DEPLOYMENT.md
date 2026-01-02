# Deployment Guide

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Production Build](#production-build)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Server Configuration](#server-configuration)
- [Load Balancing](#load-balancing)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)
- [Scaling](#scaling)

## Overview

This guide covers deploying the Kabale Digital ID Card system to production. The application is built with TanStack Start and can be deployed as a Node.js application.

### Deployment Architecture

```
┌─────────────┐
│   Load     │
│  Balancer  │
└─────┬───────┘
      │
      ├──────────┬──────────┐
      │          │          │
┌─────▼───┐ ┌───▼────┐ ┌───▼────┐
│ Server  │ │ Server │ │ Server │
│   1     │ │   2    │ │   3    │
└────┬────┘ └───┬────┘ └───┬────┘
     │          │          │
     └──────────┼──────────┘
                │
         ┌──────▼──────┐
         │   MySQL     │
         │  Database   │
         └─────────────┘
```

## Prerequisites

### Server Requirements

- **Node.js**: Version 18 or higher
- **pnpm**: Latest version
- **MySQL/MariaDB**: Version 10.3 or higher
- **Process Manager**: PM2, systemd, or similar
- **Reverse Proxy**: Nginx or similar (recommended)
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

### System Resources

Minimum recommended:
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **Network**: Stable internet connection

For production with load balancing:
- **CPU**: 2+ cores per instance
- **RAM**: 4+ GB per instance
- **Storage**: 50+ GB SSD
- **Database**: Separate server recommended

## Production Build

### 1. Build the Application

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
pnpm prisma generate

# Build for production
pnpm build
```

The build output will be in `.output/` directory:
- `.output/server/` - Server code
- `.output/client/` - Client assets

### 2. Verify Build

```bash
# Test the production build locally
pnpm preview
```

Visit `http://localhost:3000` to verify the build works.

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file or set environment variables:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-secure-password
DB_NAME=kabale_id_production

# Application Configuration
NODE_ENV=production
PORT=3000

# Session Configuration
SESSION_SECRET=your-very-long-random-secret-key-minimum-32-characters
SESSION_MAX_AGE=604800000  # 7 days in milliseconds

# Optional: System Admin Seed
SYSTEM_ADMIN_EMAIL=admin@kabale.gov
SYSTEM_ADMIN_PASSWORD=secure-initial-password
SYSTEM_ADMIN_FIRST_NAME=System
SYSTEM_ADMIN_LAST_NAME=Administrator
```

### Security Best Practices

1. **Never commit `.env` files**: Add to `.gitignore`
2. **Use strong secrets**: Generate random 32+ character strings
3. **Rotate secrets**: Change SESSION_SECRET periodically
4. **Use different databases**: Separate dev/staging/production
5. **Limit database access**: Use dedicated database user with minimal privileges

### Generating Secrets

```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE kabale_id_production 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

### 2. Create Database User

```sql
CREATE USER 'kabale_prod'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON kabale_id_production.* TO 'kabale_prod'@'%';
FLUSH PRIVILEGES;
```

### 3. Run Migrations

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
pnpm prisma migrate deploy
```

### 4. Seed Initial Data (Optional)

```bash
# Seed system admin (if configured)
pnpm seed
```

**Note**: Only run seed if you haven't created the system admin manually.

### 5. Verify Database Connection

```bash
# Test connection
pnpm prisma db pull
```

## Server Configuration

### Using PM2 (Recommended)

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'kabale-id',
    script: '.output/server/index.mjs',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }],
};
```

#### 3. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 4. PM2 Commands

```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart kabale-id  # Restart
pm2 stop kabale-id     # Stop
pm2 delete kabale-id   # Remove
```

### Using systemd

Create `/etc/systemd/system/kabale-id.service`:

```ini
[Unit]
Description=Kabale Digital ID Card System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/kabale-id
Environment=NODE_ENV=production
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable kabale-id
sudo systemctl start kabale-id
sudo systemctl status kabale-id
```

## Load Balancing

The project includes a load balancer script for development/testing. For production, use a proper load balancer.

### Using Nginx as Load Balancer

#### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### 2. Configure Nginx

Create `/etc/nginx/sites-available/kabale-id`:

```nginx
upstream kabale_backend {
    least_conn;  # Load balancing method
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    # Add more servers as needed
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://kabale_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (if serving directly)
    location /static {
        alias /var/www/kabale-id/.output/client;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/kabale-id /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Using Built-in Load Balancer (Development Only)

For development/testing:

```bash
pnpm load
```

This starts multiple instances and a simple load balancer. **Not recommended for production**.

## SSL/HTTPS Setup

### Using Let's Encrypt

#### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

#### 2. Obtain Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

#### 3. Auto-Renewal

Certbot sets up auto-renewal automatically. Test renewal:

```bash
sudo certbot renew --dry-run
```

### Manual SSL Certificate

If using a different certificate provider:

1. Place certificate files:
   - Certificate: `/etc/ssl/certs/kabale-id.crt`
   - Private key: `/etc/ssl/private/kabale-id.key`

2. Update Nginx configuration with certificate paths

3. Test configuration: `sudo nginx -t`

## Monitoring and Logging

### Application Logs

#### PM2 Logs

```bash
# View logs
pm2 logs kabale-id

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### systemd Logs

```bash
# View logs
sudo journalctl -u kabale-id -f

# View recent logs
sudo journalctl -u kabale-id -n 100
```

### Database Monitoring

Monitor database performance:

```sql
-- Check connection count
SHOW PROCESSLIST;

-- Check table sizes
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'kabale_id_production'
ORDER BY size_mb DESC;
```

### Health Checks

Create a health check endpoint (if needed):

```typescript
// Add to a route
export const healthCheckFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  });
```

### Monitoring Tools

Consider using:
- **PM2 Plus**: Built-in PM2 monitoring
- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure monitoring
- **Sentry**: Error tracking

## Backup Strategy

### Database Backups

#### Automated Backup Script

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/kabale-id"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="kabale_id_production"
DB_USER="kabale_prod"
DB_PASS="your-password"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

#### Schedule Backups

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh
```

### Application Backups

Backup important files:

```bash
# Backup configuration
tar -czf backup-config-$(date +%Y%m%d).tar.gz .env ecosystem.config.js

# Backup uploads (if storing files locally)
tar -czf backup-uploads-$(date +%Y%m%d).tar.gz uploads/
```

### Backup Verification

Regularly test backup restoration:

1. Restore to a test database
2. Verify data integrity
3. Test application functionality

## Scaling

### Horizontal Scaling

1. **Multiple Server Instances**:
   - Deploy application to multiple servers
   - Use load balancer to distribute traffic
   - Ensure session storage works across instances (database-backed)

2. **Database Scaling**:
   - Use read replicas for read-heavy operations
   - Consider connection pooling
   - Monitor query performance

### Vertical Scaling

1. **Increase Server Resources**:
   - More CPU cores
   - More RAM
   - Faster storage (SSD)

2. **Database Optimization**:
   - Add indexes for slow queries
   - Optimize query patterns
   - Consider partitioning large tables

### Performance Optimization

1. **Caching**:
   - Cache frequently accessed data
   - Use Redis for session storage (if needed)
   - Cache static assets

2. **CDN**:
   - Use CDN for static assets
   - Cache images and documents

3. **Database Optimization**:
   - Regular `ANALYZE TABLE` commands
   - Monitor slow query log
   - Optimize indexes

## Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificate installed
- [ ] Reverse proxy configured
- [ ] Application running with process manager
- [ ] Health checks working
- [ ] Monitoring set up
- [ ] Backups configured and tested
- [ ] Error logging configured
- [ ] Security headers configured
- [ ] Rate limiting configured (if needed)
- [ ] System admin account created
- [ ] Initial Kabales created
- [ ] Documentation updated

## Post-Deployment

### 1. Verify Deployment

- Test all user flows
- Check error logs
- Monitor performance
- Verify backups

### 2. Create Initial Data

- Create system admin (if not seeded)
- Create initial Kabales
- Assign Kabale administrators

### 3. Monitor

- Watch application logs
- Monitor database performance
- Check server resources
- Review error rates

### 4. Maintenance

- Regular security updates
- Database maintenance
- Log rotation
- Backup verification

## Troubleshooting

For deployment issues, see [Troubleshooting Guide](TROUBLESHOOTING.md).

## Related Documentation

- [Setup Guide](SETUP.md) - Development setup
- [Architecture Documentation](ARCHITECTURE.md) - System design
- [Database Documentation](DATABASE.md) - Database schema

