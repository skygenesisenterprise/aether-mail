# 🌍 Internationalization (i18n) Structure

This directory contains translation files for the Aether Mail application, supporting multiple languages for better accessibility and user experience.

## 📁 **Directory Structure**

```
messages/
├── en.json          # English (Default)
├── fr.json          # Français
├── es.json          # Español
├── zh.json          # 简体中文 (Simplified Chinese)
├── ja.json          # 日本語 (Japanese)
├── ko.json          # 한국어 (Korean)
├── ru.json          # Русский (Russian)
├── ar.json          # العربية (Arabic)
├── hi.json          # हिन्दी (Hindi)
├── pt.json          # Português (Portuguese)
├── it.json          # Italiano (Italian)
├── tr.json          # Türkçe (Turkish)
├── de.json          # Deutsch (German)
├── zh-TW.json       # 繁體中文 (Traditional Chinese)
└── en-US.json       # English (US)
```

## 🏗️ **Translation Categories**

Each translation file is organized into logical categories:

### **common** - General UI elements

- Loading states, error messages, success notifications
- Common actions (save, delete, edit, search, etc.)
- Confirmation dialogs

### **navigation** - App navigation

- Main application names (Mail, Calendar, Contacts, etc.)
- Navigation labels

### **mail** - Email-specific terms

- Email folders (Inbox, Sent, Drafts, etc.)
- Email actions (Reply, Forward, Attach, etc.)
- Email status and notifications

### **auth** - Authentication

- Login/registration forms
- Password management
- Authentication errors and success messages

### **errors** - Error handling

- Network, server, and connection errors
- File handling errors
- General error messages

### **calendar** - Calendar functionality

- Date/time terms
- Event management
- Calendar navigation

### **contacts** - Contact management

- Contact form fields
- Contact actions
- Contact organization

### **notes** - Notes functionality

- Note creation and editing
- Note organization
- Note search

### **tasks** - Task management

- Task creation and editing
- Task priorities and status
- Task organization

### **drive** - File management

- File and folder operations
- File sharing and permissions
- File search and organization

## 🌐 **Supported Languages**

| Language     | Code    | Status      | Notes                |
| ------------ | ------- | ----------- | -------------------- |
| English      | `en`    | ✅ Complete | Default language     |
| Français     | `fr`    | ✅ Complete | French translations  |
| Español      | `es`    | ✅ Complete | Spanish translations |
| 简体中文     | `zh`    | ✅ Complete | Simplified Chinese   |
| 日本語       | `ja`    | ✅ Complete | Japanese             |
| 한국어       | `ko`    | ✅ Complete | Korean               |
| Русский      | `ru`    | ✅ Complete | Russian              |
| العربية      | `ar`    | ✅ Complete | Arabic (RTL)         |
| हिन्दी       | `hi`    | ✅ Complete | Hindi                |
| Português    | `pt`    | ✅ Complete | Portuguese           |
| Italiano     | `it`    | ✅ Complete | Italian              |
| Türkçe       | `tr`    | ✅ Complete | Turkish              |
| Deutsch      | `de`    | ✅ Complete | German               |
| 繁體中文     | `zh-TW` | ✅ Complete | Traditional Chinese  |
| English (US) | `en-US` | ✅ Complete | US English variant   |

## 🔧 **Usage in Application**

### **Loading Translations**

```typescript
import translations from "../messages/en.json";

// Access nested translations
const t = (key: string) => {
  const keys = key.split(".");
  let value: any = translations;

  for (const k of keys) {
    value = value[k];
  }

  return value as string;
};

// Usage
const loadingText = t("common.loading"); // "Loading..."
```

### **Language Detection**

The application should:

1. Detect user's browser language preference
2. Fall back to English if language not supported
3. Allow manual language selection
4. Store user's language preference

### **Dynamic Loading**

```typescript
const loadTranslations = async (locale: string) => {
  try {
    const translations = await import(`../messages/${locale}.json`);
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}:`, error);
    return await import("../messages/en.json"); // Fallback
  }
};
```

## 📝 **Adding New Translations**

1. **Add new keys** to all language files
2. **Maintain consistency** across all translations
3. **Follow the established structure** and naming conventions
4. **Test with RTL languages** (Arabic) for proper layout
5. **Update this README** when adding new languages

## 🎯 **Best Practices**

### **Translation Guidelines**

- **Keep it concise**: Use short, clear text for UI elements
- **Be consistent**: Use the same terminology across all languages
- **Consider context**: Translate meaning, not just words
- **Test in context**: Ensure translations fit in UI elements
- **Use gender-neutral language** where possible

### **Technical Guidelines**

- **JSON format**: All files must be valid JSON
- **UTF-8 encoding**: Ensure proper character encoding
- **No trailing commas**: Maintain valid JSON syntax
- **Consistent structure**: Follow the established category organization
- **Fallback values**: Always provide English fallbacks

### **RTL Support**

- **Arabic (ar.json)** uses right-to-left text direction
- **Test RTL layouts** with Arabic translations
- **Consider margin/padding adjustments** for RTL languages

## 🔄 **Maintenance**

### **Regular Updates**

- Review translations for accuracy and cultural appropriateness
- Add new keys when adding new features
- Update existing translations when UI text changes
- Test with native speakers when possible

### **Quality Assurance**

- Check for missing translations in all language files
- Validate JSON syntax for all files
- Test language switching functionality
- Ensure proper fallback behavior

## 🚀 **Implementation Notes**

### **Performance Considerations**

- Load translations dynamically to reduce bundle size
- Consider lazy loading for less common languages
- Implement proper caching strategies
- Use code splitting for language files

### **Accessibility**

- Ensure proper language declaration in HTML
- Support screen readers with proper language tags
- Test keyboard navigation with different languages
- Consider high contrast mode for all languages

### **Browser Compatibility**

- Test language detection across browsers
- Ensure proper fallback behavior
- Test localStorage for language preferences
- Validate RTL support in target browsers

## 📞 **Support**

For questions about translations or to contribute new languages:

1. Check existing issues for similar requests
2. Follow the contribution guidelines
3. Test thoroughly before submitting
4. Include context for translation decisions

---

_This structure supports 16 languages and provides a comprehensive foundation for internationalization in the Aether Mail application._
