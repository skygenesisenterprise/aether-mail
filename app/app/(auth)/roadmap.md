# @app/(auth) Authentication - API Roadmap

This document maps the authentication pages in `@app/app/(auth)/` to the required `@server/` API endpoints for full backend integration.

---

## Auth Pages Overview

| Page                 | Purpose                        | Status               |
| -------------------- | ------------------------------ | -------------------- |
| `login/page.tsx`     | User login with email/password | Mock (simulation)    |
| `register/page.tsx`  | User registration              | Mock (simulation)    |
| `authorize/page.tsx` | OAuth 2.0 authorization        | Empty (to implement) |
| `mfa/`               | MFA challenge flow             | Not implemented      |

### Components Used

- `components/auth/login-form.tsx` - Login form with email/password
- `components/auth/register-form.tsx` - Registration form
- `components/auth/register-form.tsx` - Already has TOTP support in design

---

## 1. Login Flow

### Current UI (`login/page.tsx`)

- Email + password form
- "Remember me" checkbox
- Forgot password link
- Social login buttons (future)
- Loading state simulation

### API Endpoints Required

```
POST   /api/v1/auth/login              - Authenticate with credentials
POST   /api/v1/auth/logout             - End session
POST   /api/v1/auth/refresh            - Refresh access token

# Password reset
POST   /api/v1/auth/request-password-reset   - Request password reset
POST   /api/v1/auth/confirm-password-reset   - Confirm password reset

# Social login
GET    /api/v1/auth/external/providers        - List enabled providers
GET    /api/v1/auth/external/:provider        - Initiate OAuth
GET    /api/v1/auth/external/:provider/callback - OAuth callback
```

### Server Controller

- `server/src/controllers/auth.go` ✅ Login, Logout, Refresh implemented
- `server/src/controllers/external_auth_controller.go` ✅ Social OAuth implemented

### Implementation

```typescript
// components/auth/login-form.tsx update
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // For cookies
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.requiresMfa) {
        // Redirect to MFA page
        router.push("/mfa?email=" + encodeURIComponent(email));
        return;
      }
      setError(data.message || "Authentication failed");
      return;
    }

    // Success - store tokens and redirect
    localStorage.setItem("accessToken", data.accessToken);
    router.push("/dashboard");
  } catch (err) {
    setError("Network error. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

---

## 2. Registration Flow

### Current UI (`register/page.tsx`)

- Full name, email, password, confirm password
- Terms acceptance checkbox
- Password strength indicator
- Success state after registration
- Email verification notice

### API Endpoints Required

```
POST   /api/v1/auth/register           - Register new user account
POST   /api/v1/auth/send-verification - Resend verification email
POST   /api/v1/auth/verify-email      - Verify email token

# Email verification flow
GET    /api/v1/auth/verify-email/:token - Email verification link (public)
```

### Server Controller

- `server/src/controllers/auth.go` ✅ Register implemented
- `server/src/controllers/email.go` ✅ Email sending implemented

### Implementation

```typescript
// components/auth/register-form.tsx update
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation ...

  try {
    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: fullName }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    setSuccess(true);
    // Show "check your email" message
  } catch (err) {
    setError("Network error. Please try again.");
  }
};
```

---

## 3. OAuth 2.0 Authorization Flow

### Current UI (`authorize/page.tsx`)

- Empty file - to be implemented
- This is the OAuth 2.0 consent screen

### Purpose

When a third-party application uses OAuth 2.0/OIDC to authenticate users, this page:

1. Displays the application requesting access
2. Shows requested permissions/scopes
3. Asks user to approve or deny
4. Redirects back to application with authorization code

### API Endpoints Required

```
GET    /api/v1/auth/authorize         - OAuth 2.0 authorization endpoint
POST   /api/v1/auth/authorize         - Submit consent

# OAuth 2.0 Token
POST   /api/v1/auth/token             - Exchange code for tokens

# OIDC Discovery
GET    /api/v1/oauth2/.well-known/openid-configuration - OIDC discovery
GET    /api/v1/oauth2/jwks           - JSON Web Key Set

# Userinfo
GET    /api/v1/oauth2/userinfo       - Get user info from token
```

### Server Controller

- `server/src/controllers/oauth_controller.go` ✅ OIDC implemented
- `server/src/controllers/auth.go` ✅ Authorization handler implemented
- `server/src/services/oauth.go` ✅ OAuth service implemented

### Implementation

```typescript
// app/(auth)/authorize/page.tsx
import { useSearchParams } from "next/navigation";

export default function AuthorizePage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type"); // 'code' or 'token'
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");

  // Fetch authorization details from server
  // Display consent screen
  // On approve: POST to /api/v1/auth/authorize with consent
  // On deny: redirect with error
}
```

---

## 4. MFA Challenge Flow

### Current UI

- No `mfa` folder implemented yet

### Purpose

When user has MFA enabled, after password login:

1. Display MFA challenge (TOTP code input)
2. Or redirect to passkey/WebAuthn
3. Verify code and issue tokens

### API Endpoints Required

```
# TOTP
POST   /api/v1/auth/totp/login        - Verify TOTP code during login
GET    /api/v1/auth/totp/setup        - Generate TOTP secret for enrollment
POST   /api/v1/auth/totp/verify       - Verify and enable TOTP
POST   /api/v1/auth/totp/disable      - Disable TOTP
GET    /api/v1/auth/totp/status      - Get TOTP enrollment status

# WebAuthn / Passkeys (future)
POST   /api/v1/auth/webauthn/register - Start passkey registration
POST   /api/v1/auth/webauthn/verify   - Verify passkey login

# Backup codes
POST   /api/v1/auth/mfa/backup-codes - Generate backup codes
```

### Server Controller

- `server/src/controllers/totp.go` ✅ TOTP implemented

### Implementation

```typescript
// app/(auth)/mfa/page.tsx
export default function MFAPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const method = searchParams.get("method"); // 'totp', 'webauthn', 'sms'

  const handleVerify = async (code: string) => {
    const response = await fetch("/api/v1/auth/totp/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, totpCode: code }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      router.push("/dashboard");
    }
  };
}
```

---

## 5. Token Management

### After Successful Authentication

The SDK should handle token storage:

- Access token (short-lived, in memory or httpOnly cookie)
- Refresh token (longer-lived, httpOnly cookie for SSR)
- Session cookie for SSR compatibility

### API Endpoints

```
POST   /api/v1/auth/refresh          - Refresh access token
POST   /api/v1/auth/revoke           - Revoke tokens
GET    /api/v1/auth/me               - Get current user info
```

### Token Response Format

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

---

## Integration with SDK

### Using `aether-identity` SDK

```typescript
import { CreateIdentityClient } from "aether-identity";

const client = CreateIdentityClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
});

// Login
await client.auth.login({ email, password });

// Register
await client.auth.register({ email, password, name: "John Doe" });

// Logout
await client.auth.logout();

// Check session
const session = await client.session.get();
```

### For Server-Side (SSR)

Use httpOnly cookies instead of localStorage:

```typescript
// Login handler returns tokens in cookies
// Client reads from cookies via useSession hook
```

---

## Server Implementation Status

| Endpoint                                     | Controller                  | Status  |
| -------------------------------------------- | --------------------------- | ------- |
| POST /auth/login                             | auth.go                     | ✅ Done |
| POST /auth/register                          | auth.go                     | ✅ Done |
| POST /auth/logout                            | auth.go                     | ✅ Done |
| POST /auth/refresh                           | auth.go                     | ✅ Done |
| POST /auth/token                             | auth.go                     | ✅ Done |
| GET /auth/authorize                          | auth.go                     | ✅ Done |
| GET /auth/external/:provider                 | external_auth_controller.go | ✅ Done |
| GET /auth/external/:provider/callback        | external_auth_controller.go | ✅ Done |
| POST /auth/totp/login                        | totp.go                     | ✅ Done |
| GET /auth/totp/setup                         | totp.go                     | ✅ Done |
| POST /auth/totp/verify                       | totp.go                     | ✅ Done |
| GET /auth/totp/status                        | totp.go                     | ✅ Done |
| POST /auth/request-password-reset            | auth.go                     | ✅ Done |
| POST /auth/confirm-password-reset            | auth.go                     | ✅ Done |
| GET /oauth2/.well-known/openid-configuration | oauth_controller.go         | ✅ Done |
| GET /oauth2/jwks                             | oauth_controller.go         | ✅ Done |
| GET /oauth2/userinfo                         | oauth_controller.go         | ✅ Done |
| POST /oauth2/revoke                          | oauth_controller.go         | ✅ Done |

---

## Next Steps for Implementation

### Phase 1: Core Auth (Priority)

1. **Update login-form.tsx** - Connect to `/api/v1/auth/login`
2. **Update register-form.tsx** - Connect to `/api/v1/auth/register`
3. **Handle MFA redirect** - Create `/auth/mfa` page
4. **Add token storage** - Use httpOnly cookies for SSR

### Phase 2: OAuth Flow

1. **Implement authorize/page.tsx** - OAuth 2.0 consent screen
2. **Add token exchange** - Handle callback from OAuth
3. **Add OIDC support** - UserInfo, JWKS endpoints

### Phase 3: Advanced

1. **Add WebAuthn/Passkeys** - FIDO2 support
2. **Add social login** - Google, GitHub, etc.
3. **Add passwordless** - Magic links, SMS

---

## Security Considerations

1. **CSRF Protection** - Add CSRF tokens for state-changing operations
2. **Rate Limiting** - Implement login attempt limiting
3. **Token Storage** - Use httpOnly, Secure, SameSite cookies
4. **MFA Enforcement** - Allow admins to enforce MFA
5. **Session Management** - Track device, location, suspicious activity
