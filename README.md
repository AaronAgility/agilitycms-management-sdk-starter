# Agility CMS Management SDK Starter

A comprehensive starter project for working with the Agility CMS Management SDK featuring authentication components, server-side route protection, and modern React components.

## LoginPanel Component
<img width="1873" height="780" alt="Screenshot 2025-08-20 at 8 50 13 AM" src="https://github.com/user-attachments/assets/75146fe1-316d-43f0-8171-faf49683d83e" />

## TopBar Component  
<img width="1870" height="784" alt="Screenshot 2025-08-20 at 8 50 03 AM" src="https://github.com/user-attachments/assets/8a9b92c1-7b6f-4fe2-b2dc-0e00c879d999" />

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure authentication with Agility CMS
- ⚛️ **React Components** - Pre-built authentication UI components
- 🎨 **Customizable Themes** - Dark, light, auto, and custom themes
- 🔗 **Management SDK Integration** - Direct integration with @agility/management-sdk
- 📱 **Responsive Design** - Works on all screen sizes
- 🛡️ **Server-side Route Protection** - Next.js middleware for secure routes
- 🍪 **HTTP-only Cookies** - Secure token storage
- 🛡️ **TypeScript Support** - Full TypeScript definitions included

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v9 or higher recommended)
- [TurboRepo](https://turbo.build/) (installed as a dev dependency)

## Quick Start

### 1. Install Dependencies

```bash
pnpm i
```

### 2. Start Development

```bash
turbo dev
```

This will start:
- Web app at `http://localhost:3000`
- Documentation at `http://localhost:3001`

### 3. Try the Authentication Flow

1. Navigate to `http://localhost:3000`
2. Click "Authenticate with Agility" 
3. Complete the OAuth flow in the popup
4. You'll be redirected to the protected dashboard

## Project Structure

```
agilitycms-management-sdk-starter/
├── apps/
│   ├── web/                    # Main Next.js application
│   └── docs/                   # Documentation site
├── packages/
│   ├── auth-tools/             # Authentication components & utilities
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
├── middleware.ts               # Server-side route protection
└── turbo.json                  # Turborepo configuration
```

## Authentication Components

### AuthProvider

Wrap your app with the AuthProvider to enable authentication context:

```tsx
// app/layout.tsx
import { AuthProvider } from '@agility/auth-tools/components';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

### LoginPanel

A clean, full-featured login panel for unauthenticated users:

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
            onSignIn: () => {
              router.push("/protected");
            }
          }}
        />
      </div>
    </div>
  );
}
```

### TopBar

A floating top bar for authenticated users:

```tsx
import { TopBar } from '@agility/auth-tools/components';
import { useRouter } from 'next/navigation';

function ProtectedPage() {
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
            console.log('Selected website:', website.websiteName);
          },
          onLocaleSelect: (locale) => {
            console.log('Selected locale:', locale.localeCode);
          }
        }}
      />
      
      <main className="pt-20 p-8">
        {/* Your protected content */}
      </main>
    </div>
  );
}
```

### AuthButton (Inline Button)

A simple authentication button for custom layouts:

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
          onSignOut: () => console.log("User signed out")
        }}
      />
    </div>
  );
}
```

## Server-side Route Protection

The project includes Next.js middleware for server-side route protection using HTTP-only cookies:

```tsx
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

const PROTECTED_ROUTES = ['/protected'];
const AUTH_ROUTES = ['/'];

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

function isAuthenticated(request: NextRequest): boolean {
  const tokens = cookieTokenStorage.getTokensFromRequest(request);
  return tokens?.accessToken ? isValidToken(tokens.accessToken) : false;
}
```

## Configuration & Theming

### Theme Options

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

### Complete Configuration

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

The main authentication hook:

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

Hook for managing website and locale selection:

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
    </div>
  );
}
```

## Management SDK Integration

### Direct SDK Usage

```tsx
import { configureSdkAdapter } from '@agility/auth-tools/adapters';
import { useAgilityAuth } from '@agility/auth-tools/components';
import * as ManagementSDK from '@agility/management-sdk';

// Configure the adapter (do this once in your app)
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

## API Routes

The project includes API routes for server-side token management:

### Token Exchange Endpoint

```tsx
// app/api/auth/callback/route.ts
export async function POST(request: NextRequest) {
  const { code, redirectUri, region } = await request.json();
  
  // Exchange code for tokens with Agility OAuth
  const tokenResponse = await fetch('https://mgmt.aglty.io/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });
  
  const tokens = await tokenResponse.json();
  const response = NextResponse.json({ success: true });
  
  // Store tokens in HTTP-only cookies
  cookieTokenStorage.setCookiesOnResponse({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
  }, response);
  
  return response;
}
```

### Authentication Status Endpoint

```tsx
// app/api/auth/status/route.ts
export async function GET(request: NextRequest) {
  const tokens = cookieTokenStorage.getTokensFromRequest(request);
  
  if (!tokens?.accessToken || (tokens.expiresAt && tokens.expiresAt <= Math.floor(Date.now() / 1000))) {
    return NextResponse.json({ authenticated: false });
  }
  
  return NextResponse.json({ 
    authenticated: true,
    expiresAt: tokens.expiresAt 
  });
}
```

## Development

### Running the Project

```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Building for Production

```bash
# Build all apps and packages
pnpm build

# Start production server
pnpm start
```

## License

MIT
