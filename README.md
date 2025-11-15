
<div align="center">

# 📧 Aether Mail


![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![Rust](https://img.shields.io/badge/Rust-2021-orange?logo=rust)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)

**A modern, open-source, and professional email client**

Developed by [Sky Genesis Enterprise](https://skygenesisenterprise.com)

[Documentation](#-documentation) • [Installation](#-installation) • [Features](#-features) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

---

## 🎯 About

**Aether Mail** is a modern, open-source, and professional email client designed to provide a user experience comparable to the best email clients on the market (Outlook, Gmail). It combines an intuitive and elegant user interface with advanced features for efficient email management.

### Key Features

- 🔐 **Enhanced Security** : End-to-end encryption and PGP/OpenPGP support
- 🎨 **Modern Interface** : Responsive and adaptive design (mobile, tablet, desktop)
- ⚡ **Optimal Performance** : Modular architecture with high-performance Rust backend
- 🔧 **Extensible** : Modular codebase allowing easy customization
- 🌐 **Multi-platform** : Available on Windows, macOS, Linux, and web version
- 🔌 **Open Standards** : IMAP/SMTP support for all email providers

---

## ✨ Features

### 📬 Email Management

- **Intuitive Inbox** : List view with email preview
- **Folder Navigation** : Inbox, Sent, Drafts, Trash, and custom folders
- **Advanced Search** : Real-time search in subject, sender, and email body
- **Filters and Sorting** : Filter by status (read/unread, favorites, etc.) and multi-criteria sorting
- **Bulk Actions** : Multiple selection and batch actions (delete, archive, mark)

### ✍️ Email Composition

- **Rich Editor** : Email composition with formatting support
- **Attachments** : Multiple file management with preview
- **CC/BCC** : Full support for copy and blind copy fields
- **Reply and Forward** : Replies and forwards with preserved history
- **Encryption** : Standard and end-to-end encryption options

### 🎯 Productivity

- **Keyboard Shortcuts** : Complete shortcuts for quick navigation
- **Conversation View** : Email grouping by thread (in development)
- **Favorite Marking** : Star system to mark important emails
- **Responsive Mode** : Adaptive mobile/desktop interface with optimized view

### 🔐 Security and Authentication

- **Secure Authentication** : Better Auth support with secure sessions
- **Server Configuration** : Custom IMAP/SMTP support for all providers
- **Session Management** : Active session tracking with security detection
- **PGP Encryption** : OpenPGP support for email encryption

### 🎨 User Interface

- **Customizable Theme** : Light/dark theme support
- **Modern Design** : Interface built with Tailwind CSS and Radix UI components
- **Accessibility** : Compliant with web accessibility standards (WCAG)
- **Smooth Animations** : Transitions and animations with Framer Motion

---

## 🛠️ Tech Stack

### Frontend

- **Framework** : React 18.3 with TypeScript
- **Build Tool** : Vite 6.3
- **Styling** : Tailwind CSS 3.4 with animate.css
- **State Management** : Zustand 5.0
- **Routing** : React Router DOM 7.9
- **UI Components** : Radix UI primitives
- **Icons** : Heroicons & Lucide React
- **Form Validation** : Express Validator

### Backend

- **Language** : Rust (Edition 2021)
- **Framework** : Axum (Async web framework)
- **Database** : PostgreSQL with Prisma ORM
- **Authentication** : Better Auth + JWT
- **Email Protocols** : IMAP/SMTP via node-imap and nodemailer
- **Security** : Helmet, CORS, Rate limiting

### Infrastructure

- **Containerization** : Docker & Docker Compose
- **Database Migrations** : Prisma Migrate
- **Package Manager** : pnpm 9.0
- **Linting** : Biome 2.2 + ESLint
- **Testing** : Jest + Vitest
- **Documentation** : Storybook 8.6

---

## 🚀 Installation

### Prerequisites

- **Node.js** : v18.x or higher
- **pnpm** : v9.0 or higher (`npm install -g pnpm`)
- **Rust** : Edition 2021 or higher (for backend)
- **PostgreSQL** : v14 or higher
- **Git** : To clone the repository

### Quick Installation

```bash
# 1. Clone the repository
git clone https://github.com/skygenesisenterprise/aether-mail.git
cd aether-mail

# 2. Install dependencies
pnpm install

# 3. Configure environment
pnpm env:setup

# 4. Configure database
# Create PostgreSQL database
createdb aethermail

# Run migrations
pnpm prisma migrate dev

# 5. Start development
pnpm dev
```

### Installation with Automated Script

```bash
# Make script executable
chmod +x install.sh

# Run installation
./install.sh
```

The application will be accessible at:
- **Frontend** : http://localhost:4000
- **Backend API** : http://localhost:3000

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file at the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aethermail"

# Authentication
JWT_SECRET="your-secret-key-here"
BETTER_AUTH_SECRET="your-better-auth-secret"

# Server
PORT=3000
NODE_ENV=development

# Email (IMAP/SMTP)
IMAP_HOST=imap.example.com
IMAP_PORT=993
SMTP_HOST=smtp.example.com
SMTP_PORT=587

# Security
CORS_ORIGIN=http://localhost:4000
```

### Database Configuration

The project uses Prisma for database management. Schemas are defined in `prisma/schema.prisma`.

**Available Migrations** :
- `schema-pgsql.sql` : PostgreSQL
- `schema-mysql.sql` : MySQL/MariaDB
- `schema-mariadb.sql` : MariaDB

### Environments

The project supports multiple environments:

- **Development** : Test data, local database, full debugging
- **Production** : Real API integration, production database, optimizations

See [README.environments.md](./README.environments.md) for more details.

---

## 🏗️ Architecture

### Project Structure

```
aether-mail/
├── app/                    # Frontend React/TypeScript
│   ├── components/         # React components
│   │   ├── auth/          # Authentication
│   │   ├── email/         # Email components
│   │   ├── layout/        # Main layout
│   │   └── ui/            # Reusable UI components
│   ├── store/             # State management (Zustand)
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React contexts
│   └── lib/               # Utilities and helpers
├── api/                    # Backend Rust
│   └── src/
│       ├── controllers/   # API controllers
│       ├── services/      # Business services
│       ├── models/        # Data models
│       ├── routes/        # API routes
│       └── middlewares/   # Middlewares
├── prisma/                 # Prisma schemas and migrations
├── docs/                   # Complete documentation
├── config/                 # Configuration files
└── docker/                 # Docker configuration
```

### Data Flow

```
Frontend (React) → REST API (Rust/Axum) → Database (PostgreSQL)
                  ↓
              IMAP/SMTP Services
```

### Frontend Architecture

- **Components** : Modular architecture with reusable components
- **State Management** : Zustand for global state management
- **Routing** : React Router with protected routes
- **Styling** : Tailwind CSS with consistent design system

### Backend Architecture

- **REST API** : RESTful endpoints with validation
- **Services** : Service layer for business logic
- **Models** : Data models with Prisma ORM
- **Security** : Authentication and authorization middlewares

---

## 📚 Documentation

### Complete Documentation

Complete documentation is available in the `docs/` folder:

- **[Architecture](./docs/architecture/)** : Frontend/backend architecture
- **[API](./docs/api/)** : API endpoints documentation
- **[Installation](./docs/installation/)** : Detailed installation guide
- **[Development](./docs/development/)** : Development guide
- **[Tests](./docs/tests/)** : Testing documentation
- **[FAQ](./docs/faq.md)** : Frequently asked questions

### API Documentation

Swagger/OpenAPI documentation is available:

- **Swagger UI** : http://localhost:3000/api-docs (in development)
- **JSON File** : `docs/swagger.json`

### Storybook Components

UI components are documented in Storybook:

```bash
# Launch Storybook
pnpm storybook

# Access Storybook
# http://localhost:6006
```

---

## 💻 Development

### Available Commands

```bash
# Development
pnpm dev              # Launch frontend + backend in dev mode
pnpm dev:frontend    # Launch frontend only
pnpm dev:backend      # Launch backend only

# Build
pnpm build            # Complete production build
pnpm build:frontend   # Frontend build only
pnpm build:backend    # Backend build only

# Tests
pnpm test             # Run all tests
pnpm test:coverage    # Tests with coverage
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests

# Code Quality
pnpm lint             # Lint code
pnpm format           # Format code
pnpm format:check     # Check formatting

# Docker
pnpm docker:dev       # Run with Docker (dev)
pnpm docker:prod      # Run with Docker (prod)
pnpm docker:build     # Build Docker image
```

### Code Standards

The project follows strict conventions:

- **TypeScript** : Strict mode enabled
- **Linting** : Biome + ESLint
- **Formatting** : Biome formatter (2 spaces, double quotes)
- **Commits** : Conventional Commits
- **Tests** : Minimum coverage required

See [docs/development/conventions.md](./docs/development/conventions.md) for more details.

### Contribution Workflow

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-feature`)
3. Use `pnpm pr` to easily create a PR
4. Commit changes (`git commit -m 'feat: add new feature'`)
5. Push to branch (`git push origin feature/my-feature`)
6. Open a Pull Request

See [docs/contribution/workflow.md](./docs/contribution/worflow.md) for the complete workflow.

---

## 🐳 Deployment

### Docker

The project is fully containerized with Docker:

```bash
# Build and launch in production
docker-compose -f docker-compose.prod.yml up -d

# Build and launch in development
docker-compose -f docker-compose.dev.yml up
```

### Docker Compose

The project includes multiple Docker Compose configurations:

- `docker-compose.yml` : Base configuration
- `docker-compose.dev.yml` : Development configuration
- `docker-compose.prod.yml` : Production configuration
- `docker-compose.traefik.yml` : Configuration with Traefik

### Manual Deployment

```bash
# Production build
pnpm build

# Start in production
pnpm prod:start
```

### Production Environment Variables

Make sure to configure appropriate environment variables for production:

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-production-secret"
CORS_ORIGIN="https://yourdomain.com"
```

---

## 🤝 Contributing

Contributions are welcome! The project follows the following contribution standards:

### How to Contribute

1. **Fork the project** and clone your fork
2. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`)
3. **Use the PR script** : `pnpm pr` to facilitate PR creation
4. **Commit your changes** following [Conventional Commits](https://www.conventionalcommits.org/)
5. **Push to branch** (`git push origin feature/AmazingFeature`)
6. **Open a Pull Request**

### Contribution Guidelines

- Follow the project's code conventions
- Add tests for new features
- Document significant changes
- Ensure all tests pass (`pnpm test`)
- Check linting (`pnpm lint`)

See [docs/contribution/](./docs/contribution/) for more details.

### Types of Contributions Sought

- 🐛 **Bug Fixes**
- ✨ **New Features**
- 📚 **Documentation Improvements**
- 🎨 **UI/UX Enhancements**
- ⚡ **Performance Optimizations**
- 🔒 **Security Improvements**

---

## 📞 Support

### Getting Help

- **Documentation** : Consult the [complete documentation](./docs/)
- **Issues** : Open a [GitHub issue](https://github.com/skygenesisenterprise/aether-mail/issues)
- **Email** : support@skygenesisenterprise.com
- **Website** : [Sky Genesis Enterprise](https://skygenesisenterprise.com)

### Reporting a Bug

If you encounter a bug, please:

1. Check that the bug hasn't already been reported
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Environment (OS, Node.js version, etc.)
   - Error logs if applicable

### Requesting a Feature

To suggest a new feature:

1. Check that it hasn't already been suggested
2. Create an issue with the "feature request" label
3. Describe the feature and its usefulness

---

## 📄 License

This project is licensed under the **Apache-2.0** license. See the [LICENSE](./LICENSE) file for more details.

---

## 🙏 Acknowledgments

- [Sky Genesis Enterprise](https://skygenesisenterprise.com) for development and support
- All [contributors](./CONTRIBUTORS.md) who have participated in the project
- The open-source community for the tools and libraries used

---

<div align="center">

**Made with ❤️ by [Sky Genesis Enterprise](https://skygenesisenterprise.com)**

[⭐ Star on GitHub](https://github.com/skygenesisenterprise/aether-mail) • [📖 Documentation](./docs/) • [🐛 Report a bug](https://github.com/skygenesisenterprise/aether-mail/issues)

</div>
