<div align="center">

# 🌐 Internationalization (i18n) Messages

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](https://github.com/skygenesisenterprise/aether-mailer/blob/main/LICENSE) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/) [![i18next](https://img.shields.io/badge/i18next-Latest-green?style=for-the-badge&logo=i18next)](https://www.i18next.com/)

**🌍 Complete Internationalization System for Aether Mailer**

Comprehensive internationalization message files with multi-language support, environment-aware routing, and scalable translation management.

[🚀 Quick Start](#-quick-start) • [📋 Supported Languages](#-supported-languages) • [🛠️ Message Format](#️-message-format) • [📁 File Structure](#-file-structure) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 What is the i18n Messages System?

The **i18n Messages System** provides comprehensive internationalization support for the Aether Mailer application. Featuring **multi-language support**, **environment-aware routing**, and **scalable translation management**, we're building a truly global mail server experience.

### 🎯 Our Vision

- **Multi-Language Support** - Complete translation system for global accessibility
- **Environment-Aware** - Development vs production routing behavior
- **Scalable Architecture** - Organized message structure for maintainability
- **Developer-Friendly** - Clear conventions and comprehensive documentation
- **Performance Optimized** - Lazy loading and efficient message delivery
- **Extensible Design** - Easy addition of new languages and features

---

## 📋 Supported Languages

> **✅ Active Development**: English (default) complete, French in progress, additional languages planned.

### ✅ **Currently Implemented**

- **English (en)** - Default language with complete message coverage
- **French (fr)** - In progress with core translations

### 🔄 **In Development**

- **Spanish (es)** - Core interface translations
- **German (de)** - Authentication and dashboard translations

### 📋 **Planned Languages**

- **Italian (it)** - Complete interface support
- **Portuguese (pt)** - Brazilian and European variants
- **Japanese (ja)** - Full localization support
- **Chinese (zh)** - Simplified and traditional variants

---

## 🚀 Quick Start

### 📋 Prerequisites

- **i18next** - Internationalization framework
- **react-i18next** - React integration
- **TypeScript** - Type-safe translation keys

### 🔧 Adding New Languages

1. **Create locale directory**

   ```bash
   mkdir messages/[locale]
   ```

2. **Copy structure from English**

   ```bash
   cp -r messages/en/* messages/[locale]/
   ```

3. **Translate all messages**

   ```bash
   # Edit all JSON files in messages/[locale]/
   ```

4. **Update configuration**

   ```typescript
   // Add to i18n config
   supportedLngs: ["en", "fr", "es", "de", "[locale]"];
   ```

5. **Test thoroughly**
   ```bash
   # Verify all translations work correctly
   make test-i18n
   ```

### 🎯 **Essential Commands**

```bash
# Development
make dev-i18n              # Start with i18n debugging
make extract-keys         # Extract translation keys from code
make validate-translations # Check for missing keys

# Translation Management
make add-locale LOCALE=es  # Add new language support
make sync-translations    # Sync keys across all locales
make compile-translations  # Compile for production

# Quality Assurance
make check-missing        # Find missing translations
make format-translations  # Format JSON files
make lint-i18n           # Lint translation files
```

---

## 🛠️ Message Format

### 🎨 **JSON Structure Standards**

```json
{
  "key": "Translation text",
  "nested": {
    "key": "Nested translation"
  },
  "withParams": "Hello {name}, you have {count} messages",
  "pluralization": {
    "zero": "No messages",
    "one": "One message",
    "other": "{count} messages"
  },
  "richText": "This is <strong>important</strong>",
  "linkText": "Visit our <a href=\"{url}\">website</a>"
}
```

### 🔐 **Key Naming Conventions**

- **camelCase** for all keys
- **Descriptive names** that reflect content
- **Feature grouping** with consistent prefixes
- **No abbreviations** unless widely understood

### 📝 **Examples**

```json
{
  // ✅ Good Practices
  "userProfileTitle": "User Profile",
  "loginButton": "Sign In",
  "errorMessage": "An error occurred",
  "dashboardWidgetTitle": "Activity Overview",

  // ❌ Avoid These
  "usrProf": "User Profile",
  "btn": "Sign In",
  "err": "Error",
  "dashWid": "Dashboard Widget"
}
```

---

## 📁 File Structure

### 🏗️ **Directory Organization**

```
messages/
├── README.md                 # This documentation
├── en/                       # English (Default)
│   ├── common.json          # Shared UI elements
│   ├── auth.json            # Authentication flows
│   ├── dashboard.json       # Dashboard interface
│   ├── errors.json          # Error messages
│   └── navigation.json      # Navigation and routing
├── fr/                       # French
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── errors.json
│   └── navigation.json
└── [locale]/                 # Additional languages
    ├── common.json
    ├── auth.json
    ├── dashboard.json
    ├── errors.json
    └── navigation.json
```

### 📋 **Standard Files**

| File              | Purpose              | Examples                        |
| ----------------- | -------------------- | ------------------------------- |
| `common.json`     | Shared UI elements   | buttons, labels, navigation     |
| `auth.json`       | Authentication flows | login, register, password reset |
| `dashboard.json`  | Main dashboard       | widgets, charts, overview       |
| `errors.json`     | Error messages       | validation, server errors       |
| `navigation.json` | Navigation routing   | menu items, breadcrumbs         |

---

## 🗺️ Translation Guidelines

### 🎯 **General Rules**

1. **Keep it simple** - Avoid complex sentence structures
2. **Be consistent** - Use same terminology across files
3. **Consider context** - Think about where text will appear
4. **Test lengths** - Ensure translations fit UI elements
5. **Use placeholders** - For dynamic content: `{variable}`

### 🔧 **Placeholders & Variables**

```json
{
  "welcomeMessage": "Welcome {username}!",
  "itemCount": "You have {count} {count, plural, one {item} other {items}}",
  "dateRange": "From {startDate} to {endDate}",
  "userAction": "{user} performed {action} on {target}"
}
```

### 🌐 **HTML & Rich Text**

```json
{
  "richText": "This is <strong>important</strong>",
  "lineBreak": "First line\nSecond line",
  "linkText": "Visit our <a href=\"{url}\">website</a>",
  "emphasis": "Please <em>read carefully</em> before proceeding"
}
```

### 📊 **Pluralization Rules**

```json
{
  "items": {
    "zero": "No items",
    "one": "One item",
    "two": "Two items",
    "few": "Few items",
    "many": "Many items",
    "other": "{count} items"
  },
  "messages": {
    "zero": "No messages",
    "one": "One message",
    "other": "{count} messages"
  }
}
```

---

## 💻 Development Integration

### 🎯 **Usage in React Components**

```typescript
import { useTranslation } from 'react-i18next';

function UserProfile() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('userProfileTitle')}</h1>
      <p>{t('welcomeMessage', { username: 'John' })}</p>
    </div>
  );
}
```

### 🔐 **Authentication Integration**

```typescript
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation('auth');

  return (
    <form>
      <button type="submit">
        {t('loginButton')}
      </button>
      <a href="/forgot">
        {t('forgotPasswordLink')}
      </a>
    </form>
  );
}
```

### 🛣️ **Navigation Integration**

```typescript
import { requiresAuthentication } from '../lib/navigation-config';
import { useTranslation } from 'react-i18next';

function ProtectedRoute({ children, path }) {
  const { t } = useTranslation('navigation');

  if (requiresAuthentication(path) && !isAuthenticated()) {
    return <Redirect to="/login" />;
  }

  return children;
}
```

---

## 🛠️ Tools & Resources

### 🎯 **Recommended Tools**

- **i18next** - Core internationalization framework
- **react-i18next** - React integration with hooks
- **i18next-scanner** - Auto-scan for translation keys
- **i18next-icu** - Advanced formatting and pluralization
- **i18next-browser-languagedetector** - Browser language detection

### 🌐 **Translation Services**

- **Crowdin** - Crowdsourced translation platform
- **Lokalise** - Translation management system
- **Phrase** - Localization platform
- **Google Translate API** - For initial translations (review required)

### 🔧 **Development Tools**

```bash
# Key extraction and management
npx i18next-scanner
npx i18next-conv

# Validation and linting
npx i18next-lingui
npx json-lint messages/**/*.json

# Translation compilation
npx i18next-compile
```

---

## 📊 Quality Assurance

### 🔍 **Validation Checks**

```bash
# Check for missing translations
make check-missing

# Validate JSON syntax
make validate-json

# Check key consistency across locales
make check-consistency

# Test pluralization rules
make test-pluralization
```

### 📏 **Quality Metrics**

| Metric                      | Target | Status         |
| --------------------------- | ------ | -------------- |
| **Translation Coverage**    | 100%   | ✅ English     |
| **Key Consistency**         | 100%   | 🔄 In Progress |
| **JSON Validation**         | 100%   | ✅ All Files   |
| **Pluralization Support**   | 100%   | 📋 Planned     |
| **Context Appropriateness** | 95%+   | 📋 In Review   |

---

## 🤝 Contributing

We're looking for contributors to help expand our internationalization support! Whether you're a native speaker, translation expert, or i18n developer, there's a place for you.

### 🎯 **How to Get Started**

1. **Choose a language** you want to contribute to
2. **Check existing translations** for consistency
3. **Follow our guidelines** for key naming and formatting
4. **Test thoroughly** in the application
5. **Submit pull request** with clear description

### 🏗️ **Areas Needing Help**

- **Native Speakers** - Review and improve translations
- **Translation Experts** - Ensure cultural appropriateness
- **i18n Developers** - Improve tooling and automation
- **QA Testers** - Verify translations in context
- **Documentation Writers** - Improve translation guides

### 📝 **Translation Process**

1. **Fork the repository** and create a feature branch
2. **Choose a locale** or create a new one
3. **Translate messages** following our conventions
4. **Test in application** to ensure proper display
5. **Validate JSON** syntax and structure
6. **Submit pull request** with translation details

---

## 📞 Support & Community

### 💬 **Get Help**

- 📖 **[i18next Documentation](https://www.i18next.com/)** - Comprehensive guides
- 🐛 **[GitHub Issues](https://github.com/skygenesisenterprise/aether-mailer/issues)** - Report translation bugs
- 💡 **[GitHub Discussions](https://github.com/skygenesisenterprise/aether-mailer/discussions)** - Translation questions
- 📧 **Email** - i18n@skygenesisenterprise.com

### 🐛 **Reporting Translation Issues**

When reporting translation issues, please include:

- Language code and specific key
- Current vs expected translation
- Context where translation appears
- Screenshot if applicable
- Cultural considerations if relevant

---

## 📊 Translation Status

| Language            | Coverage | Status         | Maintainer   |
| ------------------- | -------- | -------------- | ------------ |
| **English (en)**    | 100%     | ✅ Default     | Core Team    |
| **French (fr)**     | 75%      | 🔄 In Progress | Community    |
| **Spanish (es)**    | 30%      | 📋 Planned     | Seeking Help |
| **German (de)**     | 20%      | 📋 Planned     | Seeking Help |
| **Italian (it)**    | 0%       | 📋 Planned     | Seeking Help |
| **Portuguese (pt)** | 0%       | 📋 Planned     | Seeking Help |

---

## 🏆 Sponsors & Partners

**Translation support led by [Sky Genesis Enterprise](https://skygenesisenterprise.com)**

We're looking for translation partners and native speakers to help expand our global reach.

[🤝 Become a Translation Partner](https://github.com/sponsors/skygenesisenterprise)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **i18next Team** - Excellent internationalization framework
- **React i18next Community** - React integration and support
- **Translation Contributors** - Native speakers and experts
- **Open Source Community** - Tools and inspiration
- **Sky Genesis Enterprise** - Project leadership and development

---

<div align="center">

### 🌍 **Help Us Build a Truly Global Mail Server!**

[⭐ Star This Repo](https://github.com/skygenesisenterprise/aether-mailer) • [🌐 Contribute Translations](https://github.com/skygenesisenterprise/aether-mailer/issues) • [💡 Start a Discussion](https://github.com/skygenesisenterprise/aether-mailer/discussions)

---

**🔧 Active Development - Multi-Language Support in Progress!**

**Made with 🌍 by the [Sky Genesis Enterprise](https://skygenesisenterprise.com) team**

_Building a global mail server with comprehensive internationalization support_

</div>
