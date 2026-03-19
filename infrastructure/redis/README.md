<div align="center">

# 🚀 Redis Configuration for Aether Vault

[![Redis](https://img.shields.io/badge/Redis-7.2-red?style=for-the-badge&logo=redis)](https://redis.io/) [![Configuration](https://img.shields.io/badge/Configuration-Optimized-green?style=for-the-badge)](https://redis.io/docs/) [![Environment](https://img.shields.io/badge/Environment-Multiple-blue?style=for-the-badge)](#-environment-configurations)

**🔥 High-Performance Redis Configuration for Modern Mail Server Infrastructure**

Optimized Redis configurations for Aether Mailer with environment-specific settings, security hardening, and enterprise-ready performance tuning.

[🚀 Quick Start](#-quick-start) • [⚙️ Configurations](#️-environment-configurations) • [🔧 Usage](#-usage) • [🛡️ Security](#️-security) • [📊 Performance](#-performance)

</div>

---

## 🌟 What is this?

**Redis Configuration for Aether Mailer** provides comprehensive, environment-specific Redis configurations optimized for modern mail server infrastructure. Each configuration is tailored for specific use cases from development to production deployment.

### 🎯 Features

- **🔒 Production-Ready Security** - Hardened configurations with command renaming
- **⚡ Performance Optimized** - Memory management and persistence tuning
- **🔄 Environment-Specific** - Dedicated configs for dev, test, and production
- **📊 Monitoring Ready** - Built-in metrics and health check support
- **🐳 Docker Integration** - Seamless container deployment support
- **🛡️ Security Hardened** - Production configs with enterprise security

---

## 📋 Configuration Status

> **✅ Production Ready**: All configurations tested and optimized for Aether Mailer workloads

### ✅ **Available Configurations**

- **🏗️ redis.conf** - Base configuration with environment variables
- **🛠️ redis-dev.conf** - Development optimized for speed and debugging
- **🚀 redis-prod.conf** - Production hardened for security and performance
- **🧪 redis-test.conf** - Testing isolated for CI/CD pipelines

### 🔄 **Optimization Areas**

- **Memory Management** - LRU policies and memory limits
- **Persistence** - AOF and RDB configurations
- **Security** - Command renaming and access control
- **Monitoring** - Metrics and health check endpoints
- **Performance** - Connection pooling and pipelining

---

## ⚙️ Environment Configurations

### 🏗️ **`redis.conf` - Base Configuration**

Universal configuration with environment variables for flexible deployment.

**🔧 Environment Variables:**

```bash
REDIS_PASSWORD=aether-redis-2025          # Redis authentication password
REDIS_MAX_MEMORY=512mb                   # Memory limit with LRU eviction
REDIS_SESSION_TTL=86400                   # Session TTL (24 hours)
REDIS_CACHE_TTL=3600                     # Cache TTL (1 hour)
REDIS_RATE_LIMIT_WINDOW=900              # Rate limiting window (15 minutes)
REDIS_RATE_LIMIT_MAX=100                 # Max requests per window
```

### 🛠️ **`redis-dev.conf` - Development Environment**

Optimized for local development with maximum performance and debugging capabilities.

**⚡ Features:**

- **No Protected Mode** - Easy local access
- **No Persistence** - Maximum speed for development
- **Short TTLs** - Quick data turnover
- **Verbose Logging** - Enhanced debugging
- **All Commands Enabled** - Full Redis feature access

### 🚀 **`redis-prod.conf` - Production Environment**

Enterprise-hardened configuration for production deployment with maximum security.

**🛡️ Security Features:**

- **Strong Authentication** - Password-protected access
- **Command Renaming** - Dangerous commands obfuscated
- **AOF Persistence** - Data durability with every-second sync
- **TLS Support** - Encrypted connections (ready to enable)
- **Monitoring Enabled** - Built-in metrics and health checks

### 🧪 **`redis-test.conf` - Testing Environment**

Isolated configuration for CI/CD pipelines and automated testing.

**🔬 Testing Features:**

- **Isolated Port** (6380) - Avoids conflicts with main Redis
- **No Persistence** - Clean state for each test run
- **Ultra-short TTLs** - Rapid data cleanup
- **Minimal Memory** (128mb) - Resource-efficient testing
- **Complete Isolation** - No interference with other environments

---

## 🗄️ Aether Mailer Data Architecture

### 📊 **Keyspaces & TTL Configuration**

| Data Type               | Key Pattern         | Production TTL | Development TTL | Test TTL |
| ----------------------- | ------------------- | -------------- | --------------- | -------- |
| **User Sessions**       | `session:*`         | 24h            | 1h              | 1min     |
| **API Cache**           | `cache:*`           | 1h             | 5min            | 30s      |
| **Rate Limiting**       | `rate-limit:*`      | 15min          | 1min            | 30s      |
| **2FA Tokens**          | `2fa:*`             | 5min           | 2min            | 30s      |
| **Email Verification**  | `email-verify:*`    | 1h             | 10min           | 30s      |
| **Password Reset**      | `password-reset:*`  | 30min          | 5min            | 1min     |
| **Notifications**       | `notifications:*`   | 24h            | 1h              | 1min     |
| **Metrics**             | `metrics:*`         | 5min           | 2min            | 30s      |
| **Security Events**     | `security-events:*` | 7d             | 30min           | 2min     |
| **Domain Verification** | `domain-verify:*`   | 24h            | 30min           | 1min     |
| **Audit Logs**          | `audit:*`           | 30d            | 1d              | 2min     |

### 🏗️ **Data Structures**

#### 👤 **User Sessions**

```typescript
// Key: session:{sessionId}
// Type: Hash
interface SessionData {
  userId: string;
  email: string;
  role: "admin" | "user" | "moderator";
  createdAt: number;
  lastAccessAt: number;
  ipAddress: string;
  userAgent: string;
  permissions: string[];
}
// TTL: 86400 (24h production)
```

#### 🚀 **API Response Cache**

```typescript
// Key: cache:{endpoint}:{params_hash}
// Type: String (JSON)
interface CacheEntry {
  data: any;
  timestamp: number;
  statusCode: number;
  headers: Record<string, string>;
}
// TTL: 3600 (1h production)
```

#### 🛡️ **Rate Limiting**

```typescript
// Key: rate-limit:{userId}:{endpoint}
// Type: String
// Value: "count:timestamp"
interface RateLimitData {
  count: number;
  windowStart: number;
  resetTime: number;
}
// TTL: 900 (15min production)
```

#### 📧 **Email Queue System**

```typescript
// Key: email-queue:{priority}
// Type: List
interface EmailJob {
  id: string;
  to: string[];
  from: string;
  subject: string;
  body: string;
  priority: "high" | "normal" | "low";
  attempts: number;
  scheduledAt: number;
  metadata: Record<string, any>;
}
// TTL: 86400 (24h)
```

#### ⚙️ **User Preferences**

```typescript
// Key: user-prefs:{userId}
// Type: Hash
interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
  };
  emailSettings: {
    signature: string;
    autoReply: boolean;
    filtering: boolean;
  };
  ui: {
    pageSize: number;
    layout: "compact" | "comfortable";
    sidebarCollapsed: boolean;
  };
}
// TTL: 604800 (7d)
```

---

## 🚀 Quick Start

### ⚡ **Environment-Based Startup**

```bash
# Development - Fast with debug features
redis-server redis/redis-dev.conf

# Production - Secure and optimized
redis-server redis/redis-prod.conf

# Testing - Isolated and lightweight
redis-server redis/redis-test.conf

# Default - Environment variable based
redis-server redis/redis.conf
```

### 🐳 **Docker Integration**

Add to your `docker-compose.yml`:

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: aether-redis
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - ./redis/redis-${NODE_ENV:-dev}.conf:/usr/local/etc/redis/redis.conf
      - redis_data:/data
    ports:
      - "6379:6379"
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD:-aether-redis-2025}
      - REDIS_MAX_MEMORY=${REDIS_MAX_MEMORY:-512mb}
      - REDIS_SESSION_TTL=${REDIS_SESSION_TTL:-86400}
      - REDIS_CACHE_TTL=${REDIS_CACHE_TTL:-3600}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 🔧 **Environment Configuration**

Create `.env` file:

```bash
# 🚀 Redis Configuration for Aether Mailer
REDIS_PASSWORD=your-super-secure-password-here
REDIS_MAX_MEMORY=2gb
REDIS_SESSION_TTL=86400
REDIS_CACHE_TTL=3600
REDIS_RATE_LIMIT_WINDOW=900
REDIS_RATE_LIMIT_MAX=100

# 🏗️ Environment
NODE_ENV=production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

### 🎯 **Quick Start with Make Commands**

```bash
# Start Redis with development config
make redis-dev

# Start Redis with production config
make redis-prod

# Start Redis for testing
make redis-test

# Check Redis status
make redis-status

# Connect to Redis CLI
make redis-cli
```

---

## 📊 Monitoring & Maintenance

### 🔍 **Health Checks**

```bash
# Basic connectivity test
redis-cli ping

# Configuration verification
redis-cli config get "*"

# Memory usage analysis
redis-cli info memory

# Connection and client info
redis-cli info clients
redis-cli info stats
```

### 💾 **Backup & Recovery**

```bash
# 🔥 Create snapshot backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis-$(date +%Y%m%d-%H%M%S).rdb

# 🔄 Restore from backup
redis-cli FLUSHALL
redis-cli --rdb /backup/redis-20231201-120000.rdb

# 📊 AOF backup for production
redis-cli BGREWRITEAOF
cp /var/lib/redis/appendonly.aof /backup/redis-aof-$(date +%Y%m%d).aof
```

### 📈 **Performance Monitoring**

```bash
# Real-time statistics
redis-cli --stat

# Slow query analysis
redis-cli slowlog get 10
redis-cli slowlog reset

# Latency monitoring
redis-cli latency latest
redis-cli latency doctor

# Memory usage details
redis-cli --memkeys --samples 100
redis-cli memory usage key_pattern
```

---

## 🛡️ Security

### ✅ **Production Security Checklist**

- [ ] **Strong Password** - Secure authentication configured
- [ ] **Command Renaming** - Dangerous commands obfuscated
- [ ] **TLS Encryption** - Secure connections enabled
- [ ] **Firewall Rules** - Network access restricted
- [ ] **Monitoring Active** - Security events tracked
- [ ] **Regular Backups** - Disaster recovery prepared
- [ ] **Audit Logging** - All actions logged
- [ ] **Network Isolation** - Redis in private network
- [ ] **Access Control** - Limited user permissions
- [ ] **Regular Updates** - Redis version current

### 🔒 **Hardened Command Set**

Production configuration renames/removes dangerous commands:

```bash
# ❌ Removed commands
FLUSHDB        # Clear database
FLUSHALL       # Clear all databases
KEYS           # Key enumeration (performance risk)
DEBUG          # Debug operations

# 🔐 Renamed commands (with secure suffix)
CONFIG      → CONFIG_b835c3f9a8
SHUTDOWN    → SHUTDOWN_b835c3f9a8
MODULE      → MODULE_b835c3f9a8
EVAL        → EVAL_b835c3f9a8
SCRIPT      → SCRIPT_b835c3f9a8
```

### 🚨 **Security Best Practices**

```bash
# Run as non-root user
useradd -r -s /bin/false redis

# Set appropriate file permissions
chmod 600 redis/redis-prod.conf
chmod 700 /var/lib/redis

# Enable protected mode
protected-mode yes

# Restrict client connections
bind 127.0.0.1 10.0.0.1

# Set maximum clients
maxclients 10000
```

---

## ⚡ Performance Optimization

### 🚀 **Optimization Features**

1. **🧠 Memory Management** - `allkeys-lru` policy for efficient eviction
2. **💾 Persistence Strategy** - AOF with `everysec` for durability
3. **🗜️ Compression** - RDB compression enabled for storage efficiency
4. **🔗 Connection Pooling** - Reusable connections for better throughput
5. **📦 Pipelining Support** - Batch operations for reduced network latency
6. **⚡ Lazy Loading** - On-demand data loading for memory efficiency

### 🏃 **Performance Benchmarks**

```bash
# Basic performance test
redis-benchmark -h localhost -p 6379 -c 50 -n 10000

# Authenticated benchmark
redis-benchmark -h localhost -p 6379 -a $REDIS_PASSWORD -c 50 -n 10000

# Pipeline benchmark
redis-benchmark -h localhost -p 6379 -P 16 -c 50 -n 10000

# Memory stress test
redis-benchmark -h localhost -p 6379 -d 1024 -c 50 -n 10000

# Latency-focused test
redis-benchmark -h localhost -p 6379 -t set,get -n 100000 -q
```

### 📊 **Performance Tuning**

```bash
# Optimize for high throughput
redis-cli config set tcp-keepalive 300
redis-cli config set timeout 0

# Memory optimization
redis-cli config set hash-max-ziplist-entries 512
redis-cli config set hash-max-ziplist-value 64

# Persistence tuning
redis-cli config set auto-aof-rewrite-percentage 100
redis-cli config set auto-aof-rewrite-min-size 64mb
```

---

## 🔧 Troubleshooting

### 🚨 **Common Issues & Solutions**

#### 1. **Memory Overflow**

```bash
# Emergency memory management
redis-cli config set maxmemory 1gb
redis-cli config set maxmemory-policy allkeys-lru

# Monitor memory usage
redis-cli info memory | grep used_memory_human
redis-cli --memkeys --samples 50
```

#### 2. **Slow Query Performance**

```bash
# Analyze slow queries
redis-cli slowlog get 10
redis-cli slowlog reset

# Adjust slow query threshold
redis-cli config set slowlog-log-slower-than 10000

# Monitor latency
redis-cli latency monitor
```

#### 3. **Connection Issues**

```bash
# Check client connections
redis-cli info clients

# Adjust connection limits
redis-cli config set maxclients 10000
redis-cli config set timeout 300

# Test connectivity
redis-cli ping
```

### 🐛 **Debug Mode**

Enable debug logging for development troubleshooting:

```bash
# Start with debug logging
redis-server redis/redis-dev.conf --loglevel debug

# Monitor debug output
tail -f /var/log/redis/redis-server.log
```

---

## 🔄 Migration Guide

### 📦 **Data Migration**

#### From Existing Redis Setup

```bash
# 1. Export current data
redis-cli --rdb /backup/old-redis-$(date +%Y%m%d).rdb

# 2. Backup configuration
cp /etc/redis/redis.conf /backup/redis-old.conf

# 3. Stop old instance
sudo systemctl stop redis

# 4. Start with new Aether config
redis-server redis/redis-prod.conf

# 5. Import data
redis-cli --rdb /backup/old-redis-20231201.rdb
```

#### Redis Version Upgrade

```bash
# 1. Backup everything
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis-pre-upgrade.rdb

# 2. Stop Redis service
sudo systemctl stop redis

# 3. Upgrade Redis binary/package
sudo apt-get update && sudo apt-get install redis-server

# 4. Start with new configuration
redis-server redis/redis-prod.conf

# 5. Verify data integrity
redis-cli info memory
redis-cli dbsize
```

---

## 🔗 Aether Mailer Integration

### 💻 **Client Configuration**

```typescript
// lib/redis-client.ts
import Redis from "ioredis";

class AetherRedisClient {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch {
      return false;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}

export const redisClient = new AetherRedisClient();
export default redisClient.getClient();
```

### 🎯 **Usage Patterns**

#### 1. **Session Management**

```typescript
import redisClient from "./redis-client";

export class SessionManager {
  async createSession(sessionId: string, userData: SessionData): Promise<void> {
    const client = redisClient.getClient();

    await client.hset(`session:${sessionId}`, {
      userId: userData.userId,
      email: userData.email,
      role: userData.role,
      createdAt: Date.now().toString(),
      lastAccessAt: Date.now().toString(),
      ipAddress: userData.ipAddress,
      userAgent: userData.userAgent,
    });

    await client.expire(`session:${sessionId}`, 86400); // 24h
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const client = redisClient.getClient();
    const session = await client.hgetall(`session:${sessionId}`);

    if (Object.keys(session).length === 0) {
      return null;
    }

    // Update last access
    await client.hset(
      `session:${sessionId}`,
      "lastAccessAt",
      Date.now().toString(),
    );

    return session as SessionData;
  }
}
```

#### 2. **API Response Caching**

```typescript
export class CacheManager {
  async getCachedResponse<T>(
    endpoint: string,
    params: Record<string, any>,
  ): Promise<T | null> {
    const client = redisClient.getClient();
    const paramsHash = this.hashParams(params);
    const cacheKey = `cache:${endpoint}:${paramsHash}`;

    const cached = await client.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  async setCachedResponse<T>(
    endpoint: string,
    params: Record<string, any>,
    data: T,
    ttl: number = 3600,
  ): Promise<void> {
    const client = redisClient.getClient();
    const paramsHash = this.hashParams(params);
    const cacheKey = `cache:${endpoint}:${paramsHash}`;

    await client.setex(cacheKey, ttl, JSON.stringify(data));
  }

  private hashParams(params: Record<string, any>): string {
    return btoa(JSON.stringify(params)).replace(/[+/=]/g, "");
  }
}
```

#### 3. **Rate Limiting**

```typescript
export class RateLimiter {
  async checkRateLimit(
    userId: string,
    endpoint: string,
    limit: number = 100,
    window: number = 900,
  ): Promise<boolean> {
    const client = redisClient.getClient();
    const rateLimitKey = `rate-limit:${userId}:${endpoint}`;

    const current = await client.incr(rateLimitKey);

    if (current === 1) {
      await client.expire(rateLimitKey, window);
    }

    return current <= limit;
  }

  async getRateLimitStatus(
    userId: string,
    endpoint: string,
  ): Promise<{ current: number; resetTime: number }> {
    const client = redisClient.getClient();
    const rateLimitKey = `rate-limit:${userId}:${endpoint}`;

    const current = parseInt((await client.get(rateLimitKey)) || "0");
    const ttl = await client.ttl(rateLimitKey);

    return {
      current,
      resetTime: ttl > 0 ? Date.now() + ttl * 1000 : 0,
    };
  }
}
```

---

## 🎯 Conclusion

This Redis configuration suite provides **production-ready**, **secure**, and **high-performance** caching and session management for Aether Mailer. Each environment is optimized for its specific use case while maintaining consistency in data structures and access patterns.

### 🔥 **Key Benefits**

- **🚀 Environment-Optimized** - Specific configs for dev, test, and production
- **🛡️ Security-First** - Hardened production configurations
- **⚡ Performance-Tuned** - Optimized for mail server workloads
- **🔧 Developer-Friendly** - Comprehensive debugging and monitoring
- **📊 Production-Ready** - Enterprise-grade reliability and security

<div align="center">

**Made with ❤️ for the Aether Mailer ecosystem**

</div>