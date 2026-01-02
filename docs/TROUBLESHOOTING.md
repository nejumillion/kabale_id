# Troubleshooting Guide

## Table of Contents

- [Common Issues](#common-issues)
- [Database Issues](#database-issues)
- [Authentication Problems](#authentication-problems)
- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

## Common Issues

### Application Won't Start

**Symptoms**: Application fails to start or crashes immediately.

**Possible Causes**:
1. Missing environment variables
2. Database connection failure
3. Port already in use
4. Missing dependencies

**Solutions**:

1. **Check Environment Variables**:
   ```bash
   # Verify all required variables are set
   echo $DB_HOST
   echo $DB_USER
   echo $DB_NAME
   ```

2. **Check Database Connection**:
   ```bash
   # Test database connection
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1"
   ```

3. **Check Port Availability**:
   ```bash
   # Check if port is in use
   lsof -i :3000
   
   # Kill process if needed
   kill -9 $(lsof -t -i:3000)
   ```

4. **Reinstall Dependencies**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Module Not Found Errors

**Symptoms**: `Cannot find module 'X'` or similar errors.

**Solutions**:

1. **Reinstall Dependencies**:
   ```bash
   pnpm install
   ```

2. **Clear Cache**:
   ```bash
   rm -rf node_modules .output
   pnpm install
   pnpm build
   ```

3. **Check Package Versions**:
   ```bash
   pnpm list | grep problematic-package
   ```

### TypeScript Errors

**Symptoms**: TypeScript compilation errors.

**Solutions**:

1. **Regenerate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```

2. **Check TypeScript Configuration**:
   ```bash
   # Verify tsconfig.json is correct
   cat tsconfig.json
   ```

3. **Clear TypeScript Cache**:
   ```bash
   rm -rf node_modules/.cache
   ```

## Database Issues

### Connection Refused

**Symptoms**: `ECONNREFUSED` or database connection errors.

**Solutions**:

1. **Verify Database is Running**:
   ```bash
   # Check MySQL service
   sudo systemctl status mysql
   # or
   sudo service mysql status
   ```

2. **Check Database Credentials**:
   - Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env`
   - Test connection manually:
     ```bash
     mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
     ```

3. **Check Firewall**:
   ```bash
   # If database is remote, check firewall rules
   sudo ufw status
   ```

4. **Check Database User Permissions**:
   ```sql
   SHOW GRANTS FOR 'your_user'@'%';
   ```

### Migration Errors

**Symptoms**: Migrations fail or database schema is out of sync.

**Solutions**:

1. **Check Migration Status**:
   ```bash
   pnpm prisma migrate status
   ```

2. **Reset Database (Development Only)**:
   ```bash
   # ⚠️ WARNING: This deletes all data
   pnpm prisma migrate reset
   ```

3. **Create New Migration**:
   ```bash
   pnpm prisma migrate dev --name fix_migration_name
   ```

4. **Manual Migration**:
   ```bash
   # Apply pending migrations
   pnpm prisma migrate deploy
   ```

### Prisma Client Not Generated

**Symptoms**: `Cannot find module '@/prisma'` or Prisma client errors.

**Solutions**:

1. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```

2. **Verify Output Directory**:
   - Check `prisma/schema.prisma` for `output` path
   - Ensure `generated/prisma/` directory exists

3. **Check TypeScript Paths**:
   - Verify `tsconfig.json` has correct path mappings
   - Check `@/prisma` resolves to `generated/prisma/client`

### Database Performance Issues

**Symptoms**: Slow queries, timeouts, high database load.

**Solutions**:

1. **Check Indexes**:
   ```sql
   -- Show indexes on a table
   SHOW INDEXES FROM User;
   
   -- Analyze table
   ANALYZE TABLE User;
   ```

2. **Monitor Slow Queries**:
   ```sql
   -- Enable slow query log
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

3. **Optimize Queries**:
   - Use `select` instead of fetching all fields
   - Add `include` only when needed
   - Use pagination for large result sets

4. **Check Connection Pool**:
   - Prisma handles connection pooling automatically
   - Monitor connection count:
     ```sql
     SHOW PROCESSLIST;
     ```

## Authentication Problems

### Login Not Working

**Symptoms**: Cannot log in, "Invalid credentials" error.

**Solutions**:

1. **Verify User Exists**:
   ```sql
   SELECT id, email, phone, role FROM User WHERE email = 'user@example.com';
   ```

2. **Check Password Hash**:
   - Verify password was hashed correctly
   - Check Argon2 configuration matches

3. **Check Session Configuration**:
   - Verify `SESSION_SECRET` is set
   - Check cookie settings in `src/server/session.ts`

4. **Clear Sessions**:
   ```sql
   -- Delete all sessions (forces re-login)
   DELETE FROM Session;
   ```

### Session Not Persisting

**Symptoms**: Logged out immediately, session expires too quickly.

**Solutions**:

1. **Check Cookie Settings**:
   - Verify `secure` flag matches environment (HTTPS in production)
   - Check `httpOnly` and `sameSite` settings

2. **Check Session Expiration**:
   ```typescript
   // Verify SESSION_MAX_AGE in session.ts
   const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
   ```

3. **Check Browser Settings**:
   - Verify cookies are enabled
   - Check for browser extensions blocking cookies

4. **Verify Session Storage**:
   ```sql
   -- Check active sessions
   SELECT * FROM Session WHERE expiresAt > NOW();
   ```

### 403 Forbidden Errors

**Symptoms**: "Forbidden" errors when accessing routes.

**Solutions**:

1. **Check User Role**:
   ```sql
   SELECT id, email, role FROM User WHERE id = 'user-id';
   ```

2. **Verify Route Guards**:
   - Check route loader has correct guard
   - Verify middleware is applied

3. **Check Kabale Access** (for Kabale Admins):
   ```sql
   -- Verify Kabale Admin profile
   SELECT * FROM KabaleAdminProfile WHERE userId = 'user-id';
   ```

4. **Review RBAC Logic**:
   - Check `src/server/rbac.ts` for access rules
   - Verify `requireKabaleAccess()` is working

## Build Errors

### Build Fails

**Symptoms**: `pnpm build` fails with errors.

**Solutions**:

1. **Check TypeScript Errors**:
   ```bash
   # Run TypeScript check
   pnpm tsc --noEmit
   ```

2. **Check Linting Errors**:
   ```bash
   pnpm lint
   ```

3. **Clear Build Cache**:
   ```bash
   rm -rf .output node_modules/.cache
   pnpm build
   ```

4. **Check Prisma Client**:
   ```bash
   pnpm prisma generate
   pnpm build
   ```

### Vite Build Errors

**Symptoms**: Vite-specific build errors.

**Solutions**:

1. **Check Vite Configuration**:
   - Verify `vite.config.ts` is correct
   - Check plugin configurations

2. **Clear Vite Cache**:
   ```bash
   rm -rf node_modules/.vite
   ```

3. **Check Dependencies**:
   ```bash
   pnpm install --frozen-lockfile
   ```

## Runtime Errors

### Server Function Errors

**Symptoms**: Server functions fail or return errors.

**Solutions**:

1. **Check Server Logs**:
   ```bash
   # PM2 logs
   pm2 logs kabale-id
   
   # systemd logs
   sudo journalctl -u kabale-id -f
   ```

2. **Verify Input Validation**:
   - Check Zod schemas match input
   - Verify required fields are provided

3. **Check Authorization**:
   - Verify user has correct role
   - Check middleware is applied

4. **Database Query Errors**:
   - Check Prisma query syntax
   - Verify relations are correct
   - Check for null/undefined values

### Component Errors

**Symptoms**: React component errors, white screen.

**Solutions**:

1. **Check Browser Console**:
   - Open browser developer tools
   - Check for JavaScript errors

2. **Check Route Loaders**:
   - Verify loader returns correct data
   - Check for null/undefined handling

3. **Verify Component Props**:
   - Check prop types match
   - Verify data structure

## Performance Issues

### Slow Page Loads

**Symptoms**: Pages take too long to load.

**Solutions**:

1. **Check Database Queries**:
   - Use `select` to fetch only needed fields
   - Add indexes for frequently queried fields
   - Use pagination for large lists

2. **Optimize Server Functions**:
   - Use `Promise.all()` for parallel queries
   - Cache frequently accessed data
   - Minimize database round trips

3. **Check Network**:
   - Verify server has adequate bandwidth
   - Check for network latency

### High Memory Usage

**Symptoms**: Application uses too much memory.

**Solutions**:

1. **Check for Memory Leaks**:
   - Monitor memory usage over time
   - Use Node.js memory profiling

2. **Optimize Queries**:
   - Limit result set sizes
   - Use pagination
   - Avoid loading unnecessary relations

3. **Restart Application**:
   ```bash
   # PM2
   pm2 restart kabale-id
   
   # systemd
   sudo systemctl restart kabale-id
   ```

### Database Slowdown

**Symptoms**: Database queries are slow.

**Solutions**:

1. **Check Indexes**:
   ```sql
   -- Show missing indexes
   EXPLAIN SELECT * FROM User WHERE email = 'test@example.com';
   ```

2. **Optimize Queries**:
   - Use `select` instead of `*`
   - Add `where` clauses
   - Use appropriate indexes

3. **Check Table Sizes**:
   ```sql
   SELECT 
     table_name,
     ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
   FROM information_schema.TABLES
   WHERE table_schema = 'kabale_id'
   ORDER BY size_mb DESC;
   ```

4. **Clean Up Old Data**:
   - Archive old applications
   - Clean expired sessions
   - Remove unused data

## Deployment Issues

### Application Won't Start in Production

**Solutions**:

1. **Check Environment Variables**:
   ```bash
   # Verify all variables are set
   env | grep DB_
   env | grep SESSION_
   ```

2. **Check File Permissions**:
   ```bash
   # Ensure application can read files
   ls -la .output/server/
   ```

3. **Check Process Manager**:
   ```bash
   # PM2
   pm2 status
   pm2 logs
   
   # systemd
   sudo systemctl status kabale-id
   sudo journalctl -u kabale-id
   ```

### SSL Certificate Issues

**Symptoms**: HTTPS not working, certificate errors.

**Solutions**:

1. **Verify Certificate**:
   ```bash
   # Check certificate
   openssl x509 -in /etc/letsencrypt/live/domain.com/cert.pem -text -noout
   ```

2. **Renew Certificate**:
   ```bash
   sudo certbot renew
   ```

3. **Check Nginx Configuration**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Load Balancer Issues

**Symptoms**: Requests not distributed correctly.

**Solutions**:

1. **Check Load Balancer Configuration**:
   - Verify upstream servers are correct
   - Check load balancing method

2. **Verify All Instances Running**:
   ```bash
   # Check each instance
   curl http://localhost:3000/health
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   ```

3. **Check Session Affinity**:
   - Ensure sessions work across instances
   - Verify database-backed sessions

## Getting Help

### Debugging Steps

1. **Check Logs**: Always check application and server logs first
2. **Reproduce**: Try to reproduce the issue consistently
3. **Isolate**: Narrow down the problem to specific component/function
4. **Verify**: Check related configurations and dependencies

### Useful Commands

```bash
# Check application status
pm2 status
pm2 logs

# Check database
mysql -u user -p database_name

# Check environment
env | grep -E 'DB_|SESSION_|NODE_ENV'

# Check ports
netstat -tulpn | grep :3000

# Check processes
ps aux | grep node

# Check disk space
df -h

# Check memory
free -h
```

### Log Locations

- **PM2 Logs**: `~/.pm2/logs/`
- **systemd Logs**: `journalctl -u kabale-id`
- **Application Logs**: Check configured log directory
- **Nginx Logs**: `/var/log/nginx/`

## Related Documentation

- [Setup Guide](SETUP.md) - Installation and setup
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Developer Guide](DEVELOPER.md) - Development practices
- [Architecture Documentation](ARCHITECTURE.md) - System design

