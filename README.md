<div align="center">

# 🚀 Aether Mail

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](https://github.com/skygenesisenterprise/aether-mail/blob/main/LICENSE) [![Go](https://img.shields.io/badge/Go-1.25+-blue?style=for-the-badge&logo=go)](https://golang.org/) [![Gin](https://img.shields.io/badge/Gin-1.12+-lightgrey?style=for-the-badge&logo=go)](https://gin-gonic.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/) [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2+-blue?style=for-the-badge&logo=react)](https://react.dev/) [![Electron](https://img.shields.io/badge/Electron-35+-green?style=for-the-badge&logo=electron)](https://www.electronjs.org/)

**🔒 Privacy-First Email Client - Built for Speed, Security, and Seamless Integration**

A lightweight, open-source email client built for privacy, speed, and seamless integration within the Aether Office ecosystem. Featuring a complete authentication system, hybrid Go/TypeScript architecture, and enterprise-ready monorepo design.

[🚀 Quick Start](#-quick-start) • [📋 What's New](#-whats-new) • [📊 Current Status](#-current-status) • [🛠️ Tech Stack](#️-tech-stack) • [📁 Architecture](#-architecture) • [🤝 Contributing](#-contributing)

[![GitHub stars](https://img.shields.io/github/stars/skygenesisenterprise/aether-mail?style=social)](https://github.com/skygenesisenterprise/aether-mail/stargazers) [![GitHub forks](https://img.shields.io/github/forks/skygenesisenterprise/aether-mail?style=social)](https://github.com/skygenesisenterprise/aether-mail/network) [![GitHub issues](https://img.shields.io/github/issues/github/skygenesisenterprise/aether-mail)](https://github.com/skygenesisenterprise/aether-mail/issues)

</div>

---

## 🌟 What is Aether Mail?

**Aether Mail** is a privacy-first email client designed for users who value security, speed, and seamless integration. Built as part of the Aether Office ecosystem, it offers a modern, feature-rich email experience with complete data ownership.

### 🎯 Our Vision

- **🚀 Hybrid Architecture** - Go 1.25+ backend + TypeScript 5 frontend
- **🔐 Complete Authentication System** - JWT-based system with login/register forms and context
- **⚡ High-Performance Backend** - Go-based server with Gin + Prisma + PostgreSQL
- **🎨 Modern Frontend** - Next.js 16 + React 19 + shadcn/ui component library
- **🏗️ Enterprise-Ready Design** - Scalable, secure, and maintainable architecture
- **📱 Cross-Platform** - Web, Desktop (Electron), Mobile (Capacitor)
- **🔒 Privacy-First** - Built with security and data ownership in mind
- **🛠️ Developer-Friendly** - Hot reload, TypeScript strict mode, pnpm workspaces

---

## 🆕 What's New - Recent Updates

### 🎯 **Major Additions in v1.0+**

#### 🏗️ **Core Foundation** (NEW)

- ✅ **Hybrid Monorepo Architecture** - Go backend + TypeScript frontend workspaces
- ✅ **Complete Authentication System** - JWT with login/register forms and React context
- ✅ **Go Backend API** - High-performance Gin API with Prisma + PostgreSQL
- ✅ **Next.js 16 Frontend** - Modern React 19 with shadcn/ui + Tailwind CSS
- ✅ **Database Layer** - Prisma ORM with PostgreSQL and user models

#### 📱 **Cross-Platform Support** (NEW)

- ✅ **Electron Desktop App** - Native desktop application
- ✅ **Capacitor Mobile Support** - Mobile companion app
- ✅ **VSCode Extension** - Email integration in VSCode
- ✅ **Browser Extension** - Chrome/Firefox extension
- ✅ **Snap Package** - Linux snap package

#### 🔐 **Security Features** (NEW)

- ✅ **JWT Authentication** - Complete implementation with refresh tokens
- ✅ **Password Security** - bcrypt hashing for secure storage
- ✅ **Protected Routes** - Route-based authentication guards
- ✅ **Session Management** - Secure token persistence

---

## 📊 Current Status

> **✅ In Development**: Privacy-first email client with complete authentication system.

### ✅ **Currently Implemented**

#### 🏗️ **Core Foundation**

- ✅ **Complete Authentication System** - JWT with login/register forms and React context
- ✅ **Hybrid Monorepo Architecture** - Go backend + TypeScript frontend workspaces
- ✅ **Go Backend Server** - High-performance Gin API with Prisma + PostgreSQL
- ✅ **Next.js 16 Frontend** - Modern React 19 with shadcn/ui + Tailwind CSS
- ✅ **Database Layer** - Prisma ORM with PostgreSQL and user models

#### 📱 **Cross-Platform**

- ✅ **Electron Desktop App** - Native desktop application framework
- ✅ **Node.js SDK Package** - Universal TypeScript SDK with examples
- ✅ **Message Handling** - Email message processing system

#### 🛠️ **Development Infrastructure**

- ✅ **Development Environment** - Hot reload, TypeScript strict mode, Go modules
- ✅ **Docker Support** - Container configuration for deployment
- ✅ **pnpm Workspaces** - Monorepo management

### 🔄 **In Development**

- **User Management Dashboard** - Complete CRUD interface for user administration
- **Email Client Features** - Compose, read, send emails
- **Folder Management** - Email organization and filtering
- **Contact Management** - Address book integration
- **Settings & Preferences** - User customization options

### 📋 **Planned Features**

- **SMTP/IMAP Integration** - Connect to external email providers
- **End-to-End Encryption** - Secure email content
- **Offline Support** - Local email storage and sync
- **Email Templates** - Reusable email templates
- **Advanced Search** - Full-text search capabilities
- **Calendar Integration** - CalDAV support

---

## 🚀 Quick Start

### 📋 Prerequisites

- **Go** 1.25.0 or higher (for backend)
- **Node.js** 18.0.0 or higher (for frontend)
- **pnpm** 8.0.0 or higher (recommended package manager)
- **PostgreSQL** 14.0 or higher (for database)
- **Docker** (optional, for deployment)
- **Make** (for command shortcuts - included with most systems)

### 🔧 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/skygenesisenterprise/aether-mail.git
   cd aether-mail
   ```

2. **Quick start (recommended)**

   ```bash
   # Install dependencies
   pnpm install

   # Setup environment
   cp .env.example .env

   # Start development servers
   pnpm dev
   ```

3. **Manual setup**

   ```bash
   # Install Go dependencies
   cd server && go mod download && cd ..

   # Install Node.js dependencies
   pnpm install

   # Environment setup
   cp .env.example .env

   # Database initialization
   pnpm db:generate && pnpm db:migrate

   # Start development servers
   pnpm dev
   ```

### 🌐 Access Points

Once running, you can access:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:8080](http://localhost:8080)
- **Health Check**: [http://localhost:8080/health](http://localhost:8080/health)
- **Prisma Studio**: [http://localhost:5556](http://localhost:5556)

### 🎯 **Available Commands**

```bash
# 🚀 Development
pnpm dev                  # Start all services (frontend + backend)
pnpm dev:frontend         # Frontend only (port 3000)
pnpm dev:backend         # Backend only (port 8080)
pnpm dev:electron        # Electron desktop app

# 🏗️ Building & Production
pnpm build                # Build all packages
pnpm build:frontend      # Frontend production build
pnpm build:electron     # Electron production build
pnpm build:backend       # Backend production build
pnpm start               # Start production servers

# 🗄️ Database
pnpm db:studio           # Open Prisma Studio
pnpm db:migrate          # Run migrations
pnpm db:generate        # Generate Prisma client
pnpm db:seed            # Seed development data

# 🔧 Code Quality & Testing
pnpm lint                # Lint all packages
pnpm lint:fix           # Auto-fix linting issues
pnpm typecheck          # Type check all packages
pnpm test               # Run all tests

# 🛠️ Utilities
pnpm clean               # Clean build artifacts
pnpm reset               # Reset project to clean state
```

---

## 🛠️ Tech Stack

### 🎨 **Frontend Layer**

```
Next.js 16 + React 19 + TypeScript 5
├── 🎨 Tailwind CSS + shadcn/ui (Styling & Components)
├── 🔐 JWT Authentication (Complete Implementation)
├── 🛣️ Next.js App Router (Routing)
├── 📝 TypeScript Strict Mode (Type Safety)
├── 🔄 React Context (State Management)
└── 🔧 ESLint + Prettier (Code Quality)
```

### ⚙️ **Backend Layer**

```
Go 1.25+ + Gin Framework
├── 🗄️ Prisma + PostgreSQL (Database Layer)
├── 🔐 JWT Authentication (Complete Implementation)
├── 🛡️ Middleware (Security, CORS, Logging)
├── 🌐 HTTP Router (Gin Router)
├── 📦 JSON Serialization (Native Go)
└── 📊 Structured Logging (Pino)
```

### 📱 **Cross-Platform Layer**

```
Electron + Capacitor + TypeScript
├── 💻 Electron Desktop App (Native)
├── 📱 Capacitor Mobile (iOS/Android)
├── 🔧 VSCode Extension
├── 🧩 Browser Extension
└── 🎯 Snap Package (Linux)
```

### 🗄️ **Data Layer**

```
PostgreSQL + Prisma
├── 🏗️ Schema Management (Auto-migration)
├── 🔍 Type-Safe Queries
├── 🔄 Connection Pooling (Performance)
├── 👤 User Models (Complete Implementation)
└── 📈 Seed Scripts (Development Data)
```

### 🏗️ **Monorepo Infrastructure**

```
pnpm Workspaces + Go Modules
├── 📦 app/ (Next.js Frontend - TypeScript)
├── ⚙️ server/ (Gin API - Go)
├── 💻 electron/ (Desktop App - TypeScript)
├── 🧩 package/ (Package Ecosystem - TypeScript)
│   ├── node/ (Node.js SDK)
│   ├── vscode/ (VSCode Extension)
│   ├── extension/ (Browser Extension)
│   └── snap/ (Snap Package)
├── 💬 messages/ (Message Handling - TypeScript)
└── 🐳 docker/ (Container Configuration)
```

---

## 📁 Architecture

### 🏗️ **Monorepo Structure**

```
aether-mail/
├── app/                     # Next.js 16 Frontend Application (TypeScript)
│   ├── components/         # React components with shadcn/ui
│   │   ├── ui/            # UI component library
│   │   ├── login-form.tsx # Authentication forms
│   │   └── Sidebar.tsx    # Navigation components
│   ├── context/           # React contexts
│   │   └── JwtAuthContext.tsx # Authentication state
│   ├── login/             # Authentication pages
│   ├── register/         # User registration
│   ├── inbox/            # Email inbox view
│   ├── compose/           # Email composition
│   ├── lib/              # Utility functions
│   └── styles/           # Tailwind CSS styling
├── server/                 # Go Backend Server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go    # CLI entry point
│   ├── src/
│   │   ├── config/       # Database and server configuration
│   │   ├── controllers/ # HTTP request handlers (auth, users, messages)
│   │   ├── middleware/   # Gin middleware (auth, validation, monitoring)
│   │   ├── models/       # Data models and structs
│   │   ├── routes/       # API route definitions
│   │   ├── services/    # Business logic (auth, users, messages)
│   │   └── tests/       # Unit and integration tests
│   ├── main.go           # Main server entry point
│   ├── go.mod           # Go modules file
│   └── go.sum          # Go modules checksum
├── electron/               # Electron Desktop App (TypeScript)
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   ├── renderer/   # Electron renderer process
│   │   └── preload/    # Preload scripts
│   └── package.json     # Electron-specific dependencies
├── package/              # Package Ecosystem
│   ├── node/            # Node.js/TypeScript SDK
│   │   ├── src/        # TypeScript source
│   │   ├── examples/   # Usage examples
│   │   └── README.md  # Package docs
│   ├── vscode/         # VSCode Extension
│   ├── extension/      # Browser Extension
│   └── snap/          # Snap Package
├── messages/              # Core Message Services (TypeScript)
├── prisma/               # Database Schema & Migrations
│   ├── schema.prisma    # Database schema definition
│   └── config.ts      # Prisma configuration
├── docker/               # Docker Configuration
├── public/               # Static Assets
├── docs/                 # Documentation
└── tests/               # Test Suites
```

### 🔄 **Data Flow Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Next.js App    │    │   Gin API         │    │   PostgreSQL    │
│  (Frontend)     │◄──►│   (Backend)       │◄──►│   (Database)    │
│  Port 3000      │    │  Port 8080        │    │  Port 5432       │
│  TypeScript     │    │  Go               │    │                  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
  JWT Tokens            API Endpoints            User/Message Data
  React Context       Authentication          Prisma ORM
  shadcn/ui Components Business Logic     Auto-migrations
        │                       │
        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Electron App   │    │   Email Servers   │
│  (Desktop)     │    │  (SMTP/IMAP)     │
│  Native UI     │    │  External Providers│
│  System Tray  │    │  Message Sync    │
└─────────────────┘    └──────────────────┘
```

---

## 🗺️ Development Roadmap

### 🎯 **Phase 1: Foundation (✅ Complete - Q1 2025)**

- ✅ **Hybrid Monorepo Setup** - Go backend + TypeScript frontend workspaces
- ✅ **Authentication System** - Complete JWT implementation with forms
- ✅ **Frontend Framework** - Next.js 16 + React 19 + shadcn/ui
- ✅ **Go Backend API** - Gin with authentication endpoints
- ✅ **Database Layer** - Prisma with PostgreSQL and user models
- ✅ **Development Environment** - TypeScript strict mode, Go modules, hot reload

### 🚀 **Phase 2: Core Features (🔄 In Progress - Q2 2025)**

- 🔄 **Email Client UI** - Inbox, compose, read, send emails
- 🔄 **Folder Management** - Email organization and filtering
- 🔄 **Contact Management** - Address book integration
- 🔄 **User Dashboard** - Complete user settings interface
- 📋 **Settings & Preferences** - User customization options
- 📋 **Search Functionality** - Email search and filtering

### ⚙️ **Phase 3: Integration (Q3 2025)**

- 📋 **SMTP/IMAP Integration** - Connect to external email providers
- 📋 **Email Sync** - Synchronization with external accounts
- 📋 **Multi-Account Support** - Multiple email accounts
- 📋 **Offline Support** - Local email storage and sync
- 📋 **Calendar Integration** - CalDAV support

### 🌟 **Phase 4: Security & Enterprise (Q4 2025)**

- 📋 **End-to-End Encryption** - Secure email content
- 📋 **Advanced Security** - Two-factor authentication
- 📋 **Audit Logging** - Security event logging
- 📋 **Enterprise Features** - Team management, shared folders
- 📋 **Mobile Application** - Native iOS/Android apps

---

## 💻 Development

### 🎯 **Development Workflow**

```bash
# New developer setup
pnpm install
cp .env.example .env
pnpm dev

# Daily development
pnpm dev                 # Start working (Go + TypeScript)
pnpm lint:fix           # Fix code issues
pnpm typecheck          # Verify types
pnpm test              # Run tests

# Before committing
pnpm format             # Format code
pnpm lint              # Check code quality
pnpm typecheck        # Verify types
```

### 🎯 **Backend Development (Go)**

```bash
cd server
go run main.go          # Start Go server
go test ./...          # Run Go tests
go fmt ./...           # Format Go code
go mod tidy           # Clean dependencies
```

### 🎯 **Frontend Development (TypeScript)**

```bash
pnpm dev:frontend     # Frontend only
pnpm lint             # Check code quality
pnpm typecheck       # Verify types
```

### 🎯 **Cross-Platform Development**

```bash
pnpm dev:electron     # Electron desktop app
pnpm build:electron   # Build Electron app
```

### 📋 **Development Guidelines**

- **TypeScript Strict Mode** - All frontend code must pass strict type checking
- **Go Best Practices** - Follow Go conventions for backend code
- **Conventional Commits** - Use standardized commit messages
- **Component Structure** - Follow established patterns for React components
- **API Design** - RESTful endpoints with proper HTTP methods
- **Error Handling** - Comprehensive error handling and logging
- **Security First** - Validate all inputs and implement proper authentication

---

## 🔐 Authentication System

### 🎯 **Complete Implementation**

The authentication system is fully implemented with Go backend and TypeScript frontend:

- **JWT Tokens** - Secure token-based authentication with refresh mechanism
- **Login/Register Forms** - Complete user authentication flow with validation
- **Auth Context** - Global authentication state management in React
- **Protected Routes** - Route-based authentication guards
- **Go API Endpoints** - Complete authentication API with Gin framework
- **Password Security** - bcrypt hashing for secure password storage
- **Session Management** - LocalStorage-based session persistence

### 🔄 **Hybrid Authentication Flow**

```go
// Go Backend Registration Process
1. User submits registration → API validation
2. Password hashing with bcrypt → Database storage
3. JWT tokens generated → Client receives tokens
4. Auth context updates → User logged in

// Go Backend Login Process
1. User submits credentials → API validation
2. Password verification → JWT token generation
3. Tokens stored → Auth context updated
4. Redirect to dashboard → Protected route access

// Token Refresh
1. Background token refresh → Automatic renewal
2. Invalid tokens → Redirect to login
3. Session expiration → Clean logout
```

---

## 🤝 Contributing

We're looking for contributors to help build this privacy-first email client! Whether you're experienced with Go, TypeScript, Electron, mobile development, or email protocols, there's a place for you.

### 🎯 **How to Get Started**

1. **Fork the repository** and create a feature branch
2. **Check the issues** for tasks that need help
3. **Join discussions** about architecture and features
4. **Start small** - Documentation, tests, or minor features
5. **Follow our code standards** and commit guidelines

### 🏗️ **Areas Needing Help**

- **Go Backend Development** - API endpoints, business logic, security
- **TypeScript Frontend Development** - React components, UI/UX design
- **Electron Development** - Desktop app features and native integration
- **Mobile Development** - Capacitor/iOS/Android apps
- **Database Design** - Schema development, migrations, optimization
- **Email Protocol Experts** - SMTP, IMAP implementation
- **Security Specialists** - Authentication, encryption
- **DevOps Engineers** - Docker, deployment, CI/CD
- **Documentation** - API docs, user guides, tutorials

### 📝 **Contribution Process**

1. **Choose an area** - Core app, frontend, or specific package
2. **Read the docs** - Understand project conventions
3. **Create a branch** with a descriptive name
4. **Implement your changes** following our guidelines
5. **Test thoroughly** in all relevant environments
6. **Submit a pull request** with clear description and testing
7. **Address feedback** from maintainers and community

---

## 📞 Support & Community

### 💬 **Get Help**

- 📖 **[Documentation](docs/)** - Comprehensive guides and API docs
- 🐛 **[GitHub Issues](https://github.com/skygenesisenterprise/aether-mail/issues)** - Bug reports and feature requests
- 💡 **[GitHub Discussions](https://github.com/skygenesisenterprise/aether-mail/discussions)** - General questions and ideas
- 📧 **Email** - support@skygenesisenterprise.com

### 🐛 **Reporting Issues**

When reporting bugs, please include:

- Clear description of the problem
- Steps to reproduce
- Environment information (Go version, Node.js version, OS, etc.)
- Error logs or screenshots
- Expected vs actual behavior

---

## 📊 Project Status

| Component                 | Status         | Technology                | Notes                             |
| ------------------------- | -------------- | ------------------------- | --------------------------------- |
| **Hybrid Architecture**  | ✅ Working     | Go + TypeScript           | Monorepo with pnpm workspaces      |
| **Authentication System** | ✅ Working     | JWT (Go/TS)               | Full implementation with forms    |
| **Go Backend API**        | ✅ Working     | Gin + Prisma              | High-performance with PostgreSQL  |
| **Frontend Framework**   | ✅ Working     | Next.js 16 + React 19    | shadcn/ui + Tailwind CSS          |
| **Electron Desktop**     | ✅ Working     | Electron + TypeScript     | Desktop application framework     |
| **Database Layer**       | ✅ Working     | Prisma + PostgreSQL       | Auto-migrations + user models      |
| **Node.js SDK**           | ✅ Working     | TypeScript                | Universal client with examples   |
| **Email Client UI**      | 🔄 In Progress | TypeScript               | Inbox, compose, read, send        |
| **Folder Management**   | 📋 Planned     | TypeScript               | Email organization               |
| **Contact Management**  | 📋 Planned     | TypeScript               | Address book integration         |
| **SMTP/IMAP Integration**| 📋 Planned     | Go                      | External email providers          |
| **End-to-End Encryption**| 📋 Planned     | Go/TypeScript            | Secure email content              |
| **Mobile App**           | 📋 Planned     | Capacitor               | Native iOS/Android              |

---

## 🏆 Sponsors & Partners

**Development led by [Sky Genesis Enterprise](https://skygenesisenterprise.com)**

We're looking for sponsors and partners to help accelerate development of this open-source email client project.

[🤝 Become a Sponsor](https://github.com/skygenesisenterprise)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Sky Genesis Enterprise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Sky Genesis Enterprise** - Project leadership
- **Go Community** - High-performance programming language and ecosystem
- **Gin Framework** - Lightweight HTTP web framework
- **Prisma Team** - Modern database toolkit
- **Next.js Team** - Excellent React framework
- **React Team** - Modern UI library
- **shadcn/ui** - Beautiful component library
- **Electron Team** - Cross-platform desktop app framework
- **pnpm** - Fast, disk space efficient package manager
- **Make** - Universal build automation and command interface
- **Docker Team** - Container platform and tools
- **Open Source Community** - Tools, libraries, and inspiration

---

<div align="center">

### 🚀 **Join Us in Building the Future of Privacy-First Email!**

[⭐ Star This Repo](https://github.com/skygenesisenterprise/aether-mail) • [🐛 Report Issues](https://github.com/skygenesisenterprise/aether-mail/issues) • [💡 Start a Discussion](https://github.com/skygenesisenterprise/aether-mail/discussions)

---

**🔒 Privacy-First Email Client - Built for Speed, Security, and Seamless Integration!**

**Made with ❤️ by the [Sky Genesis Enterprise](https://skygenesisenterprise.com) team**

_Building a privacy-first email client with complete authentication system and cross-platform support_

</div>