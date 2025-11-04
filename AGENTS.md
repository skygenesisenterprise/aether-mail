# Aether Mail - Agent Guidelines

### 🚨 CRITICAL: Commit Approval Required

**NEVER create commits without explicit user approval.** Before any commit operation:

1. **Always show staged changes**: Use `git status` and `git diff --cached` to display what will be committed
2. **Always ask for permission**: Present the changes clearly and ask "Should I commit these changes?" or similar
3. **Wait for explicit confirmation**: Proceed only after receiving clear user consent (yes, go ahead, proceed, etc.)
4. **Never auto-commit**: Do not commit automatically after completing tasks, even if following conventional commit format

## Build/Lint/Test Commands

- **Build**: `pnpm build` (frontend + backend)
- **Lint**: `pnpm lint` (Biome linter + TypeScript check)
- **Format**: `pnpm format` (Biome formatter)
- **Test**: `pnpm test` (Jest watch mode)
- **Single test**: `jest path/to/test.test.js --watch`
- **Coverage**: `pnpm test:coverage`
- **Dev server**: `pnpm dev` (frontend on :4000, backend on :3000)

## Code Style Guidelines

### TypeScript/React (Frontend)

- Use Biome for formatting (2-space indentation, double quotes)
- Import organization: auto-organize on save
- React functional components with TypeScript interfaces
- Use Zustand for state management
- Tailwind CSS for styling with clsx/tailwind-merge utilities

### Rust (Backend API)

- Snake_case for variables/functions, PascalCase for types
- Use `tracing` for logging
- Axum framework with async handlers
- Diesel ORM for database operations
- Serde for serialization/deserialization

### General

- Strict TypeScript enabled
- No unused variables (warning level)
- Semicolons required
- Double quotes for strings
- Follow existing component patterns and naming conventions

### API Documentation 
- Data Source : https://github.com/skygenesisenterprise/api-service/tree/master/docs

## Commit Message Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must follow this format:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature or enhancement
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting, missing semicolons, etc. (no functional changes)
- `refactor`: Code refactoring that doesn't change functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, build process changes
- `ci`: CI/CD configuration changes
- `build`: Build system or dependency changes

### Examples

#### Good commit messages
```bash
feat(auth): add API key authentication middleware
fix(database): resolve connection pool timeout issue
docs(readme): update installation instructions
refactor(services): extract common validation logic
test(api): add integration tests for user endpoints
chore(deps): update prisma to v6.18.0
```

#### Commit with body and footer
```bash
feat(messaging): implement real-time chat functionality

Add WebSocket support for instant messaging between users.
Includes message history, typing indicators, and read receipts.

- Add WebSocket server configuration
- Implement message broadcasting
- Add client-side event handlers
- Update database schema for message status

Closes #123
```

### Guidelines
1. **Use imperative mood**: "add feature" not "added feature" or "adds feature"
2. **Keep description short**: Max 50 characters for the subject line
3. **Separate subject from body**: Use blank line between subject and body
4. **Explain what and why**: Focus on what the change does and why it's needed
5. **Reference issues**: Use `Closes #issue-number` or `Fixes #issue-number`
6. **One commit per feature**: Keep commits focused and atomic
7. **Avoid merge commits**: Use rebase to keep history clean
8. **CRITICAL: Always ask for approval**: NEVER create commits without explicit user permission. Always show staged changes and ask "Should I commit these changes?" before proceeding.

### Scope (optional)
Use parentheses to specify the scope of the change:
- `feat(auth):` - Authentication related changes
- `fix(database):` - Database related fixes
- `docs(api):` - API documentation changes
- `refactor(ui):` - UI component refactoring

### Breaking Changes
For breaking changes, add `!` after the type and include BREAKING CHANGE footer:
```bash
feat(api)!: remove deprecated user endpoints

BREAKING CHANGE: The /api/v1/users/legacy endpoints have been removed.
Use the new /api/v1/users endpoints instead.
```

## Environment Variables

Required environment variables:
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT secret (for legacy auth)

## Database Setup

1. Create PostgreSQL database
2. Run schema from `data/schema-pgsql.sql`
3. Set up environment variables
4. Run migrations if any

## API Key Authentication

All API requests require authentication via API keys:
- Header: `X-API-Key: your-key`
- Header: `Authorization: Bearer your-key`
- Query: `?api_key=your-key`

API keys are linked to organizations and have permissions.

## Common Patterns

### Service Layer
```typescript
export class ExampleService {
  static async exampleMethod(param: string): Promise<Result> {
    // Business logic here
  }
}
```

### Controller Pattern
```typescript
export const exampleController = async (req: Request, res: Response) => {
  try {
    const result = await ExampleService.exampleMethod(req.params.id);
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Middleware Usage
```typescript
router.use(authenticateApiKey);
router.get('/protected', requirePermission('read'), controller);
```

## Performance Considerations

- Use database indexes for frequently queried columns
- Implement pagination for list endpoints
- Cache frequently accessed data
- Monitor query performance
- Use connection pooling for database

## Deployment

- Use environment-specific configurations
- Set up proper logging
- Configure monitoring and alerts
- Use HTTPS in production
- Implement rate limiting