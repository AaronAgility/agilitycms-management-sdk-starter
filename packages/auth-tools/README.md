# @agility/auth-tools

Authentication components and utilities for Agility CMS Management SDK.

## Installation

```bash
npm install @agility/auth-tools @agility/management-sdk
```

## Quick Start

### React Components

```tsx
import { AuthProvider, AgilityAuth, useAgilityAuth } from '@agility/auth-tools/components';

function App() {
  return (
    <AuthProvider>
      <AgilityAuth config={{
        title: 'My CMS',
        mode: 'panel',
        showUserInfo: true
      }} />
    </AuthProvider>
  );
}

function MyComponent() {
  const auth = useAgilityAuth();
  
  if (!auth.isAuthenticated) {
    return <button onClick={auth.authenticate}>Sign In</button>;
  }
  
  return <div>Welcome, {auth.user?.emailAddress}!</div>;
}
```

### Direct API Usage

```tsx
import { configureSdkAdapter } from '@agility/auth-tools/adapters';
import * as ManagementSDK from '@agility/management-sdk';

// Configure the adapter
configureSdkAdapter(ManagementSDK);

// Use the management SDK with authentication
const client = new ManagementSDK.ApiClient();
await client.auth();
```

## Features

- 🔐 **OAuth 2.0 Authentication** - Secure authentication with Agility CMS
- ⚛️ **React Components** - Pre-built authentication UI components
- 🎨 **Customizable Themes** - Dark, light, auto, and custom themes
- 🔗 **Management SDK Integration** - Direct integration with @agility/management-sdk
- 📱 **Responsive Design** - Works on all screen sizes
- 🛡️ **TypeScript Support** - Full TypeScript definitions included

## License

MIT
