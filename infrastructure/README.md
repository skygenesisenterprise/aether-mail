<div align="center">

# 🏗️ Aether Identity Infrastructure

[![Infrastructure](https://img.shields.io/badge/Infrastructure-As_Code-blue?style=for-the-badge&logo=terraform)](https://www.terraform.io/) [![Docker](https://img.shields.io/badge/Docker-Containerization-blue?style=for-the-badge&logo=docker)](https://www.docker.com/) [![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-blue?style=for-the-badge&logo=kubernetes)](https://kubernetes.io/) [![Redis](https://img.shields.io/badge/Redis-Caching-red?style=for-the-badge&logo=redis)](https://redis.io/) [![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus_Grafana-orange?style=for-the-badge&logo=grafana)](https://grafana.com/)

**🔥 Complete Infrastructure Foundation for Aether Identity Platform**

Production-ready infrastructure configurations with Docker containerization, Kubernetes deployment, Redis caching, monitoring stack, and comprehensive deployment automation for the Aether Identity ecosystem.

[🚀 Quick Start](#-quick-start) • [📁 Components](#-components) • [🐳 Docker](#-docker-deployment) • [☸️ Kubernetes](#-kubernetes-deployment) • [🗄️ Redis](#-redis-caching) • [📊 Monitoring](#-monitoring-stack) • [🔧 Configuration](#-configuration-management)

</div>

---

## 🌟 What is Aether Identity Infrastructure?

**Aether Identity Infrastructure** provides a comprehensive, production-ready deployment foundation for the Aether Identity platform. This modular infrastructure package includes everything needed for development, staging, and production deployments with enterprise-grade reliability and security.

### 🎯 Key Features

- **🐳 Docker Containerization** - Production-ready containers with multi-stage builds
- **☸️ Kubernetes Orchestration** - Cloud-native deployment with auto-scaling
- **🗄️ Redis Caching Layer** - High-performance session and cache management
- **📊 Monitoring Stack** - Prometheus, Grafana, and Loki for observability
- **🌐 NGINX Reverse Proxy** - Load balancing and SSL termination
- **🔧 Environment Management** - Dev, test, and production configurations
- **🛡️ Security Hardening** - Production-ready security configurations
- **📋 Deployment Automation** - Terraform scripts and CI/CD integration

---

## 📊 Infrastructure Status

> **✅ Production Ready**: Complete infrastructure stack tested and deployed

### ✅ **Implemented Components**

| Component                | Status        | Technology                   | Purpose              |
| ------------------------ | ------------- | ---------------------------- | -------------------- |
| **Docker Configuration** | ✅ Working    | Multi-stage builds           | Container deployment |
| **Docker Compose**       | ✅ Working    | Development orchestration    | Local development    |
| **Redis Configuration**  | ✅ Working    | Environment-specific configs | Caching & sessions   |
| **Monitoring Stack**     | ✅ Working    | Prometheus + Grafana + Loki  | Observability        |
| **NGINX Proxy**          | ✅ Working    | Reverse proxy                | Load balancing       |
| **Kubernetes**           | 📋 Configured | Cloud deployment             | Production scaling   |
| **Terraform**            | 📋 Configured | Infrastructure as code       | Cloud resources      |

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Docker** 20.0+ and Docker Compose v2.0+
- **Node.js** 18.0+ for infrastructure scripts
- **Kubernetes** cluster (for production deployment)
- **Terraform** 1.6+ (for cloud resource management)
- **Make** (for command shortcuts)

### 🔧 Installation & Setup

1. **Infrastructure setup**

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Copy environment templates
cp .env.example .env.local
# Edit .env.local with your configuration
```

2. **Quick development deployment**

```bash
# One-command development setup
make dev-up

# Start all services
docker-compose -f docker/docker-compose.dev.yml up -d

# Check service health
make health-check
```

3. **Access points**

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8081](http://localhost:8081)
- **Redis**: [localhost:6379](localhost:6379)
- **Grafana**: [http://localhost:3000](http://localhost:3000) (admin/admin)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)

### 🎯 **Enhanced Make Commands**

```bash
# 🚀 Development & Deployment
make dev-up              # Start development environment
make dev-down            # Stop development environment
make dev-restart         # Restart development services
make dev-logs            # Show development logs

# 🐳 Docker Management
make docker-build        # Build all Docker images
make docker-up           # Start production containers
make docker-down         # Stop production containers
make docker-clean        # Clean Docker artifacts

# 🗄️ Redis Management
make redis-start         # Start Redis service
make redis-stop          # Stop Redis service
make redis-cli           # Connect to Redis CLI
make redis-backup        # Create Redis backup

# 📊 Monitoring
make monitoring-start    # Start monitoring stack
make monitoring-stop     # Stop monitoring stack
make grafana-dashboard   # Open Grafana dashboard

# ☸️ Kubernetes Deployment
make k8s-deploy          # Deploy to Kubernetes
make k8s-status          # Check cluster status
make k8s-logs            # Show pod logs
make k8s-cleanup         # Clean Kubernetes resources

# 🔧 Configuration
make dotenv              # Generate .env files
make validate            # Validate configurations
make security-audit      # Run security audit
```

---

## 📁 Components

### 🐳 **Docker Containerization**

Production-ready Docker configuration with multi-environment support:

```
docker/
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development setup
├── Dockerfile                  # Multi-stage application build
├── Dockerfile.dev              # Development configuration
└── .dockerignore              # Build exclusions
```

**Key Features**:

- ✅ Multi-stage builds for optimized images
- ✅ Environment-specific configurations
- ✅ Health checks and graceful shutdowns
- ✅ Volume mounting for persistent data
- ✅ Network isolation and service discovery

### 🗄️ **Redis Caching Layer**

High-performance Redis configuration with environment-specific optimizations:

```
redis/
├── redis.conf                  # Base configuration
├── redis-dev.conf             # Development setup
├── redis-prod.conf            # Production hardened
├── redis-test.conf            # Testing isolated
└── README.md                  # Comprehensive documentation
```

**Data Architecture**:

- **User Sessions**: `session:*` keys with 24h TTL
- **API Cache**: `cache:*` keys with 1h TTL
- **Rate Limiting**: `rate-limit:*` with 15min windows
- **Email Queue**: `email-queue:*` for mail processing
- **User Preferences**: `user-prefs:*` for settings storage

### 📊 **Monitoring Stack**

Complete observability solution with Prometheus, Grafana, and Loki:

```
monitoring/
├── docker-compose.monitoring.yml  # Monitoring services
├── prometheus.yml                # Prometheus configuration
├── loki.yml                      # Log aggregation
├── promtail.yml                  # Log collection
├── grafana/                      # Grafana dashboards
│   └── provisioning/
│       └── datasources/
│           └── datasources.yml
└── README.md                     # Monitoring guide
```

**Monitoring Components**:

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Loki**: Log aggregation and retention
- **Promtail**: Log collection and forwarding
- **Health Checks**: Service endpoint monitoring

### 🌐 **NGINX Reverse Proxy**

Load balancing and SSL termination configuration:

```
web/
└── nginx.conf                   # Production proxy config
```

**NGINX Features**:

- ✅ Load balancing across app instances
- ✅ SSL/TLS termination
- ✅ Static asset serving
- ✅ Request rate limiting
- ✅ Health check endpoints

### ☸️ **Kubernetes Deployment**

Cloud-native deployment manifests and configurations:

```
k8s/
├── namespace.yaml               # Namespace isolation
├── configmap.yaml              # Configuration management
├── secret.yaml                 # Secret management
├── deployment.yaml             # Application deployment
├── service.yaml                # Service exposure
├── ingress.yaml                # External routing
└── README.md                   # Deployment guide
```

**Kubernetes Features**:

- ✅ Horizontal Pod Autoscaling
- ✅ Rolling updates and rollbacks
- ✅ Health probes and liveness checks
- ✅ Resource limits and requests
- ✅ Network policies and security

---

## 🐳 Docker Deployment

### 🏗️ **Development Environment**

```bash
# Start development stack
docker-compose -f docker/docker-compose.dev.yml up -d

# Build and start specific service
docker-compose -f docker/docker-compose.dev.yml up -d aether-app

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f aether-app

# Stop all services
docker-compose -f docker/docker-compose.dev.yml down
```

### 🚀 **Production Environment**

```bash
# Production deployment
docker-compose -f docker/docker-compose.yml up -d

# Scale services
docker-compose -f docker/docker-compose.yml up -d --scale aether-app=3

# Health check
docker-compose -f docker/docker-compose.yml ps

# Cleanup
docker-compose -f docker/docker-compose.yml down -v
```

### 📋 **Docker Services**

| Service           | Port   | Description          | Health Check   |
| ----------------- | ------ | -------------------- | -------------- |
| **aether-app**    | 3001   | Frontend application | HTTP /         |
| **aether-server** | 8081   | Backend API          | HTTP /health   |
| **postgres**      | 5432   | Database             | pg_isready     |
| **redis**         | 6379   | Cache layer          | redis-cli ping |
| **nginx**         | 80/443 | Reverse proxy        | HTTP /         |

---

## 🗄️ Redis Caching

### ⚡ **Environment-Specific Configurations**

```bash
# Development - Fast with debugging
redis-server redis/redis-dev.conf

# Production - Secure and optimized
redis-server redis/redis-prod.conf

# Testing - Isolated and lightweight
redis-server redis/redis-test.conf
```

### 📊 **Data Structures & Patterns**

#### **Session Management**

```typescript
// Key: session:{sessionId}
// Type: Hash
// TTL: 86400 (24h production)
await client.hset(`session:${sessionId}`, {
  userId,
  email,
  role,
  createdAt,
  lastAccessAt,
  ipAddress,
  userAgent,
});
```

#### **API Response Caching**

```typescript
// Key: cache:{endpoint}:{params_hash}
// Type: String (JSON)
// TTL: 3600 (1h production)
await client.setex(cacheKey, 3600, JSON.stringify(data));
```

#### **Rate Limiting**

```typescript
// Key: rate-limit:{userId}:{endpoint}
// Type: String
// TTL: 900 (15min production)
await client.incr(rateLimitKey);
await client.expire(rateLimitKey, 900);
```

#### **Email Queue System**

```typescript
// Key: email-queue:{priority}
// Type: List
// Process with Go goroutines for high throughput
await client.lpush("email-queue:high", JSON.stringify(emailJob));
```

### 🛡️ **Security Features**

- **Authentication**: Password-protected Redis connections
- **Command Renaming**: Dangerous commands obfuscated in production
- **Network Isolation**: Redis in private network with firewall rules
- **TLS Support**: Encrypted connections ready to enable
- **Access Control**: Limited client connections and permissions

---

## 📊 Monitoring Stack

### 🔍 **Observability Components**

```bash
# Start monitoring stack
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Access dashboards
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# Loki: http://localhost:3100
```

### 📈 **Monitoring Capabilities**

#### **Application Metrics**

- Request throughput and response times
- Error rates and status codes
- Database connection pools and query performance
- Redis cache hit/miss ratios
- Memory and CPU utilization

#### **Infrastructure Metrics**

- Container resource usage
- Pod health and restart counts
- Network traffic and latency
- Disk I/O and storage utilization
- Load balancer performance

#### **Log Management**

- Structured logging with correlation IDs
- Centralized log aggregation
- Log retention and archival
- Real-time log streaming
- Alert-based log notifications

#### **Security Monitoring**

- Authentication failures and suspicious activities
- Rate limiting violations
- CORS and security header validation
- Network access patterns
- File system integrity monitoring

---

## ☸️ Kubernetes Deployment

### 🚀 **Production Deployment**

```bash
# Initialize Kubernetes cluster
make k8s-init

# Deploy application stack
make k8s-deploy

# Monitor deployment status
make k8s-status

# Access application
kubectl port-forward svc/aether-app 3001:80
```

### 📋 **Kubernetes Resources**

```yaml
# Namespace isolation
apiVersion: v1
kind: Namespace
metadata:
  name: aether-identity
  labels:
    name: aether-identity

# Application deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aether-app
  namespace: aether-identity
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aether-app
  template:
    metadata:
      labels:
        app: aether-app
    spec:
      containers:
      - name: aether-app
        image: aether-identity/app:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 🔄 **CI/CD Integration**

```yaml
# .github/workflows/kubernetes.yml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: "v1.24.0"

      - name: Configure kubectl
        run: |
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
          export KUBECONFIG=kubeconfig

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f infrastructure/k8s/
          kubectl rollout status deployment/aether-app -n aether-identity
```

---

## 🔧 Configuration Management

### 📋 **Environment Configuration**

```bash
# Development setup
make dotenv-dev

# Production setup
make dotenv-prod

# Validate configurations
make validate-config

# Security audit
make security-audit
```

### 🌐 **Environment Variables**

```bash
# .env.local template

# 🚀 Application Configuration
NODE_ENV=development
PORT=3000
HOSTNAME=0.0.0.0

# 🔐 Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
ACCESS_TOKEN_EXP=15
REFRESH_TOKEN_EXP=720

# 🗄️ Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aether_identity
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=aether_identity

# 🗄️ Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=aether-redis-2025
REDIS_DB=0
REDIS_MAX_MEMORY=512mb
REDIS_SESSION_TTL=86400
REDIS_CACHE_TTL=3600

# 📊 Monitoring Configuration
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3000
LOKI_URL=http://localhost:3100

# 🌐 Network Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
CORS_ORIGIN=http://localhost:3000

# 🐳 Docker Configuration
DOCKER_REGISTRY=ghcr.io/skygenesisenterprise
DOCKER_TAG=latest
```

### 🔧 **Terraform Configuration**

```bash
# Initialize Terraform
make terraform-init

# Plan infrastructure changes
make terraform-plan

# Apply infrastructure
make terraform-apply

# Destroy infrastructure
make terraform-destroy
```

---

## 🛡️ Security

### ✅ **Security Checklist**

- [ ] **Container Security** - Minimal base images and security scanning
- [ ] **Network Isolation** - Private networks and firewall rules
- [ ] **Secret Management** - Encrypted secrets and IAM roles
- [ ] **Access Control** - RBAC and principle of least privilege
- [ ] **Monitoring** - Security event logging and alerting
- [ ] **Backup Strategy** - Automated backups and disaster recovery
- [ ] **Compliance** - GDPR, SOC2, and industry standards
- [ ] **Regular Updates** - Container images and dependencies
- [ ] **Vulnerability Scanning** - Regular security assessments
- [ ] **Incident Response** - Security incident procedures

### 🔒 **Security Features**

#### **Container Security**

```dockerfile
# Multi-stage builds for minimal attack surface
FROM node:18-alpine AS builder
# Build process...

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
# Security configurations...
```

#### **Network Security**

```yaml
# Docker Compose network isolation
networks:
  aether-network:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

#### **Kubernetes Security**

```yaml
# Pod security policies
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: aether-app-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - "configMap"
    - "emptyDir"
    - "projected"
    - "secret"
    - "downwardAPI"
    - "persistentVolumeClaim"
```

---

## 🔧 Troubleshooting

### 🚨 **Common Issues**

#### 1. **Container Startup Failures**

```bash
# Check container logs
docker-compose logs aether-app

# Validate configuration
docker-compose config

# Health check status
docker-compose ps
```

#### 2. **Database Connection Issues**

```bash
# Test database connectivity
docker-compose exec postgres psql -U postgres -d aether_identity

# Check database logs
docker-compose logs postgres

# Restart database service
docker-compose restart postgres
```

#### 3. **Redis Connection Problems**

```bash
# Test Redis connectivity
docker-compose exec redis redis-cli ping

# Check Redis logs
docker-compose logs redis

# Monitor Redis metrics
docker-compose exec redis redis-cli info memory
```

#### 4. **Kubernetes Deployment Issues**

```bash
# Check pod status
kubectl get pods -n aether-identity

# View pod logs
kubectl logs -f deployment/aether-app -n aether-identity

# Describe pod issues
kubectl describe pod <pod-name> -n aether-identity
```

### 🐛 **Debug Mode**

```bash
# Enable debug logging
export DEBUG=aether:*
export NODE_ENV=development

# Start services with debug
docker-compose -f docker/docker-compose.dev.yml up

# Monitor in real-time
docker-compose logs -f --tail=100
```

---

## 📚 Documentation References

### 📖 **Component Documentation**

- **[Redis Configuration](redis/README.md)** - Comprehensive Redis setup and usage
- **[Docker Configuration](docker/README.md)** - Container deployment and management
- **[Kubernetes Guide](k8s/README.md)** - Cloud-native deployment instructions
- **[Monitoring Stack](monitoring/README.md)** - Observability and alerting setup
- **[Security Guidelines](SECURITY.md)** - Security best practices and policies

### 🔗 **External Resources**

- **[Docker Documentation](https://docs.docker.com/)** - Container platform documentation
- **[Kubernetes Documentation](https://kubernetes.io/docs/)** - Orchestration platform guides
- **[Redis Documentation](https://redis.io/documentation)** - In-memory data store docs
- **[Terraform Documentation](https://www.terraform.io/docs/)** - Infrastructure as code
- **[Prometheus Documentation](https://prometheus.io/docs/)** - Monitoring and alerting
- **[Grafana Documentation](https://grafana.com/docs/)** - Visualization platform

---

## 🎯 Conclusion

The **Aether Identity Infrastructure** package provides a comprehensive, production-ready foundation for deploying the Aether Identity platform across development, staging, and production environments. With Docker containerization, Kubernetes orchestration, Redis caching, and complete monitoring capabilities, this infrastructure stack ensures reliable, secure, and scalable deployments.

### 🔥 **Key Benefits**

- **🚀 Production Ready** - Enterprise-grade configurations and security
- **🐳 Container Native** - Modern deployment with Docker and Kubernetes
- **📊 Fully Observable** - Complete monitoring and alerting stack
- **🔄 Environment Management** - Consistent configs across all environments
- **🛡️ Security First** - Hardened configurations and best practices
- **🔧 Developer Friendly** - Comprehensive documentation and tooling

---

<div align="center">

### 🏗️ **Building the Foundation for Modern Identity Management**

[🐳 Docker Deployment](docker/) • [☸️ Kubernetes Orchestration](k8s/) • [🗄️ Redis Caching](redis/) • [📊 Monitoring Stack](monitoring/)

---

**Made with ❤️ for the Aether Identity ecosystem**

</div>
