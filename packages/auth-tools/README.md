# @agility/auth-tools

Authentication components and utilities for Agility CMS Management SDK with server-side route protection.

## Installation

```bash
npm install @agility/auth-tools @agility/management-sdk
```

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure authentication with Agility CMS
- ⚛️ **React Components** - Pre-built authentication UI components
- 🎨 **Customizable Themes** - Dark, light, auto, and custom themes
- 🔗 **Management SDK Integration** - Direct integration with @agility/management-sdk
- 📱 **Responsive Design** - Works on all screen sizes
- 🛡️ **Server-side Route Protection** - Next.js middleware for secure routes
- 🍪 **HTTP-only Cookies** - Secure token storage
- 🛡️ **TypeScript Support** - Full TypeScript definitions included

## Quick Start

### 1. Configure SDK Adapter

First, configure the auth-tools to work with the Management SDK:

```tsx
// app/layout.tsx or your root component
import { configureSdkAdapter } from '@agility/auth-tools/adapters';
import * as ManagementSDK from '@agility/management-sdk';

// Configure the auth-tools SDK adapter with the management SDK
configureSdkAdapter(ManagementSDK);
```

### 2. Set up AuthProvider

Wrap your app with the AuthProvider:

```tsx
// app/layout.tsx
import { AuthProvider } from '@agility/auth-tools/components';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Server-side Route Protection (Optional)

Create middleware for server-side route protection:

```tsx
// middleware.ts (in your app root)
import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

// Define protected routes
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/protected'];
const AUTH_ROUTES = ['/login', '/'];

function isValidToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp > now;
  } catch (error) {
    return false;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  const tokens = cookieTokenStorage.getTokensFromRequest(request);
  return tokens?.accessToken ? isValidToken(tokens.accessToken) : false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  // Redirect unauthenticated users from protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect authenticated users from auth routes  
  if (AUTH_ROUTES.includes(pathname) && authenticated) {
    return NextResponse.redirect(new URL('/protected', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 4. API Routes for Token Management

Create API routes for server-side token exchange:

```tsx
// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri, region } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }
    
    // Exchange code for tokens using Agility's OAuth endpoint
    const tokenUrl = 'https://mgmt.aglty.io/oauth/token';
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenData,
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.json({ error: 'Token exchange failed', details: errorText }, { status: 400 });
    }
    
    const tokens = await tokenResponse.json();
    const response = NextResponse.json({ success: true });
    
    // Store tokens in HTTP-only cookies
    cookieTokenStorage.setCookiesOnResponse({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
      tokenType: tokens.token_type,
      scope: tokens.scope,
    }, response);
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    cookieTokenStorage.clearCookiesOnResponse(response);
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}
```

```tsx
// app/api/auth/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

export async function GET(request: NextRequest) {
  try {
    const tokens = cookieTokenStorage.getTokensFromRequest(request);
    
    if (!tokens?.accessToken) {
      return NextResponse.json({ authenticated: false });
    }
    
    if (tokens.expiresAt && tokens.expiresAt <= Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      expiresAt: tokens.expiresAt 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
```

## Components

### LoginPanel

A clean, full-featured login panel for unauthenticated users.

```tsx
import { LoginPanel } from '@agility/auth-tools/components';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <LoginPanel
          config={{
            title: "Agility CMS",
            subtitle: "Sign in to your account",
            buttonText: "Authenticate with Agility",
            theme: "dark",
            redirectUri: "http://localhost:3000/auth-callback.html",
            scope: "openid profile email offline_access",
            region: "usa", // or "eu"
            onSignIn: () => {
              router.push("/dashboard");
            },
            onError: (error) => {
              console.error("Authentication failed:", error);
            }
          }}
        />
      </div>
    </div>
  );
}
```

### TopBar

A floating top bar for authenticated users showing user info and sign-out.

```tsx
import { TopBar } from '@agility/auth-tools/components';
import { useRouter } from 'next/navigation';

function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <TopBar
        config={{
          theme: 'auto',
          showUserInfo: true,
          showWebsiteSelector: true,
          showLocaleSelector: true,
          showSignOutButton: true,
          onSignOut: () => {
            router.push('/');
          },
          onWebsiteSelect: (website) => {
            console.log('Website selected:', website.websiteName);
          },
          onLocaleSelect: (locale) => {
            console.log('Locale selected:', locale.localeCode);
          },
        }}
      />
      
      <main className="pt-20 p-8">
        {/* Your dashboard content */}
      </main>
    </div>
  );
}
```

### AuthButton (Inline Button)

A simple authentication button for custom layouts.

```tsx
import { AuthButton } from '@agility/auth-tools/components';

function CustomComponent() {
  return (
    <div className="flex items-center space-x-4">
      <h1>My App</h1>
      <AuthButton
        config={{
          buttonText: "Sign In",
          theme: "light",
          onSignIn: () => console.log("User signed in"),
          onSignOut: () => console.log("User signed out"),
        }}
      />
    </div>
  );
}
```

### AgilityAuth (All-in-One)

The main component that automatically switches between login and authenticated views.

```tsx
import { AgilityAuth } from '@agility/auth-tools/components';

function App() {
  return (
    <div className="min-h-screen">
      <AgilityAuth
        config={{
          title: "My CMS Dashboard",
          theme: "auto",
          mode: "panel", // "panel" | "button-only"
          showUserInfo: true,
          showWebsiteSelector: true,
          redirectUri: "http://localhost:3000/auth-callback.html",
          onSignIn: (user) => {
            console.log("Welcome,", user.emailAddress);
          },
          onSignOut: () => {
            console.log("User signed out");
          }
        }}
      />
    </div>
  );
}
```

## Configuration Options

### Theme Configuration

```tsx
const config = {
  theme: "dark", // "light" | "dark" | "auto" | "custom"
  
  // Custom theme colors (when theme: "custom")
  customColors: {
    primary: "#6366f1",
    secondary: "#8b5cf6", 
    background: "#1f2937",
    surface: "#374151",
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    border: "#4b5563",
    error: "#ef4444",
    success: "#10b981"
  }
};
```

### Complete Configuration Interface

```tsx
interface AgilityAuthConfig {
  // Basic settings
  title?: string;
  subtitle?: string;
  buttonText?: string;
  signOutText?: string;
  
  // OAuth settings
  redirectUri?: string;
  scope?: string;
  region?: 'usa' | 'eu';
  
  // UI settings
  theme?: 'light' | 'dark' | 'auto' | 'custom';
  mode?: 'panel' | 'button-only';
  className?: string;
  
  // Feature toggles
  showUserInfo?: boolean;
  showWebsiteSelector?: boolean;
  showLocaleSelector?: boolean;
  showSignOutButton?: boolean;
  showTokenInfo?: boolean;
  
  // Custom colors (when theme: "custom")
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
    error?: string;
    success?: string;
  };
  
  // Callbacks
  onSignIn?: (user: ServerUser) => void;
  onSignOut?: () => void;
  onWebsiteSelect?: (website: WebsiteAccess) => void;
  onLocaleSelect?: (locale: LocaleInfo) => void;
  onError?: (error: string) => void;
}
```

## Hooks

### useAgilityAuth

The main authentication hook providing state and methods.

```tsx
import { useAgilityAuth } from '@agility/auth-tools/components';

function MyComponent() {
  const {
    // Authentication state
    isAuthenticated,
    isLoading,
    error,
    user,
    websiteAccess,
    selectedWebsite,
    locales,
    selectedLocale,
    tokenInfo,
    
    // Methods
    authenticate,
    signOut,
    selectWebsite,
    selectLocale,
    clearError,
    
    // Computed values
    isAuthReady
  } = useAgilityAuth({
    redirectUri: "http://localhost:3000/auth-callback.html",
    scope: "openid profile email offline_access",
    region: "usa",
    autoCheckAuth: true
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  if (!isAuthenticated) {
    return <button onClick={authenticate}>Sign In</button>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.emailAddress}!</h1>
      <p>Websites: {websiteAccess.length}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### useWebsiteSelection

Hook for managing website and locale selection.

```tsx
import { useWebsiteSelection } from '@agility/auth-tools/components';

function WebsiteSelector() {
  const {
    websiteAccess,
    selectedWebsite,
    locales,
    selectedLocale,
    selectWebsite,
    selectLocale,
    isLoading,
    error
  } = useWebsiteSelection();

  return (
    <div>
      <select 
        value={selectedWebsite?.websiteGuid || ''} 
        onChange={(e) => {
          const website = websiteAccess.find(w => w.websiteGuid === e.target.value);
          if (website) selectWebsite(website);
        }}
      >
        <option value="">Select Website</option>
        {websiteAccess.map(website => (
          <option key={website.websiteGuid} value={website.websiteGuid}>
            {website.websiteName}
          </option>
        ))}
      </select>
      
      {locales.length > 0 && (
        <select 
          value={selectedLocale?.localeCode || ''} 
          onChange={(e) => {
            const locale = locales.find(l => l.localeCode === e.target.value);
            if (locale) selectLocale(locale);
          }}
        >
          <option value="">Select Locale</option>
          {locales.map(locale => (
            <option key={locale.localeCode} value={locale.localeCode}>
              {locale.displayName}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
```

## Advanced Usage

### Direct SDK Integration

```tsx
import { configureSdkAdapter } from '@agility/auth-tools/adapters';
import { useAgilityAuth } from '@agility/auth-tools/components';
import * as ManagementSDK from '@agility/management-sdk';

// Configure the adapter
configureSdkAdapter(ManagementSDK);

function ContentManager() {
  const { isAuthenticated, selectedWebsite } = useAgilityAuth();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (isAuthenticated && selectedWebsite) {
      fetchPages();
    }
  }, [isAuthenticated, selectedWebsite]);

  const fetchPages = async () => {
    try {
      const client = new ManagementSDK.ApiClient();
      const pagesResponse = await client.pageManagementMethods.getPages({
        websiteGuid: selectedWebsite.websiteGuid
      });
      setPages(pagesResponse.pages || []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  };

  return (
    <div>
      <h2>Pages ({pages.length})</h2>
      {pages.map(page => (
        <div key={page.pageID}>
          {page.name} - {page.path}
        </div>
      ))}
    </div>
  );
}
```

### Custom Authentication Flow

```tsx
import { AuthMethods } from '@agility/auth-tools/auth';

function CustomAuth() {
  const [authMethods] = useState(() => new AuthMethods());

  const handleLogin = async () => {
    try {
      // Generate auth URL
      const authUrl = authMethods.generateAuthUrl({
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email offline_access',
        state: authMethods.generateState()
      });

      // Redirect to auth URL
      window.location.href = authUrl;
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleCallback = async (code: string) => {
    try {
      await authMethods.exchangeCodeForToken({
        code,
        redirectUri: 'http://localhost:3000/callback'
      });
      
      const isAuth = await authMethods.isAuthenticated();
      console.log('Authenticated:', isAuth);
    } catch (error) {
      console.error('Token exchange failed:', error);
    }
  };

  return <button onClick={handleLogin}>Custom Login</button>;
}
```

## Styling

### CSS Classes

The components use Tailwind CSS classes that can be customized:

```css
/* Custom styles for auth components */
.agility-auth-panel {
  @apply bg-white dark:bg-gray-900 rounded-lg shadow-xl;
}

.agility-auth-button {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors;
}

.agility-auth-topbar {
  @apply fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50;
}
```

### Custom Theme Example

```tsx
const customTheme = {
  theme: "custom",
  customColors: {
    primary: "#6366f1",      // Indigo
    secondary: "#8b5cf6",    // Purple  
    background: "#1f2937",   // Gray-800
    surface: "#374151",      // Gray-700
    text: "#f9fafb",         // Gray-50
    textSecondary: "#d1d5db", // Gray-300
    border: "#4b5563",       // Gray-600
    error: "#ef4444",        // Red-500
    success: "#10b981"       // Emerald-500
  }
};

<LoginPanel config={customTheme} />
```

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  AgilityAuthConfig,
  ServerUser,
  WebsiteAccess,
  LocaleInfo,
  AuthTokens,
  UseAgilityAuthReturn 
} from '@agility/auth-tools/components';

import type {
  AuthMethods,
  OAuthTokenResponse,
  TokenExchangeRequest
} from '@agility/auth-tools/auth';
```

## License

MIT