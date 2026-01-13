# Complete React Native Expo Setup - Installation Commands

## 1️⃣ Initial Project Setup

### One-Command Installation
```bash
npx create-expo-app@latest ReactNativeApp && cd ReactNativeApp
```

---

## 2️⃣ Install All Dependencies (Run these in order)

### Step 1: Core Packages
```bash
npm install expo-router expo-constants
```

### Step 2: Navigation Stack
```bash
npm install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack
```

### Step 3: Navigation Dependencies
```bash
npm install \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler
```

### Step 4: Styling with TailwindCSS
```bash
npm install nativewind tailwindcss
```

### Step 5: Storage Solution
```bash
npm install @react-native-async-storage/async-storage
```

### Step 6: HTTP Client
```bash
npm install axios
```

### Step 7: WebView for YouTube
```bash
npm install react-native-webview
```

### Step 8: Development Tools
```bash
npm install --save-dev \
  typescript \
  @types/react \
  @types/react-native \
  @babel/preset-typescript
```

---

## 3️⃣ All-in-One Installation Command

Run this single command to install everything at once:

```bash
npm install \
  expo-router \
  expo-constants \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  nativewind \
  tailwindcss \
  @react-native-async-storage/async-storage \
  axios \
  react-native-webview && npm install --save-dev \
  typescript \
  @types/react \
  @types/react-native \
  @babel/preset-typescript
```

---

## 4️⃣ Complete Dependency List

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ^51.0.0 | Framework |
| `react` | ^18.2.0 | UI Library |
| `react-native` | ^0.74.0 | Mobile Framework |
| `expo-router` | ^3.4.0 | File-based Routing |
| `expo-constants` | ^16.0.0 | App Constants |
| `expo-dev-client` | ^3.0.0 | Dev Client |
| `@react-navigation/native` | ^6.1.0 | Navigation Core |
| `@react-navigation/bottom-tabs` | ^6.5.0 | Tab Navigation |
| `@react-navigation/stack` | ^6.3.0 | Stack Navigation |
| `react-native-screens` | ^3.31.0 | Performance Optimization |
| `react-native-safe-area-context` | ^4.10.0 | Safe Area Handling |
| `react-native-gesture-handler` | ^2.15.0 | Gesture Detection |
| `nativewind` | ^2.0.11 | TailwindCSS for RN |
| `tailwindcss` | ^3.4.0 | Utility-First CSS |
| `@react-native-async-storage/async-storage` | ^1.23.0 | Local Storage |
| `axios` | ^1.6.0 | HTTP Client |
| `react-native-webview` | ^13.8.0 | WebView Component |
| `typescript` | ^5.3.0 | (Dev) Type Safety |
| `@types/react` | ^18.2.0 | (Dev) Type Defs |
| `@types/react-native` | ^0.74.0 | (Dev) Type Defs |
| `@babel/preset-typescript` | ^7.23.0 | (Dev) Babel Preset |

---

## 5️⃣ Configuration Files to Create

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      '@babel/preset-typescript',
    ],
    plugins: ['nativewind/babel'],
  };
};
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### input.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 6️⃣ Running the App

### Start Development Server
```bash
npx expo start
```

### Run on iOS (macOS only)
```bash
npx expo run:ios
```

### Run on Android
```bash
npx expo run:android
```

### Run Web Version
```bash
npx expo start --web
```

### Build for Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Both
eas build
```

---

## 7️⃣ Project Structure

```
ReactNativeApp/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← Tab navigation
│   │   ├── index.tsx            ← Home screen
│   │   └── profile.tsx          ← Profile screen
│   ├── details/
│   │   ├── _layout.tsx          ← Details stack
│   │   └── [id].tsx             ← Dynamic route
│   └── _layout.tsx              ← Root layout
├── components/
│   └── ThemedText.tsx           ← Reusable components
├── utils/
│   ├── api.ts                   ← Axios instance
│   └── storage.ts               ← AsyncStorage helpers
├── input.css                    ← Tailwind base styles
├── tailwind.config.js           ← Tailwind config
├── babel.config.js              ← Babel config
├── tsconfig.json                ← TypeScript config
├── app.json                     ← Expo config
├── package.json
└── .env                         ← Environment variables
```

---

## 8️⃣ Quick Reference - Common Tasks

### Add a new page/route
Create file: `app/newpage.tsx`

### Add a new tab
Add to: `app/(tabs)/_layout.tsx` with `<Tab.Screen />`

### Add AsyncStorage data
```typescript
import { storageService } from '@/utils/storage';
await storageService.setItem('key', value);
```

### Make API call with caching
```typescript
import api from '@/utils/api';
import { cacheService } from '@/utils/storage';

const data = await cacheService.get('items');
const response = await api.get('/items');
await cacheService.set('items', response.data, 10);
```

### Use TailwindCSS classes
```typescript
import { tw } from 'nativewind';
<View style={tw`flex-1 bg-blue-500 px-4 py-2`} />
```

### Embed YouTube video
```typescript
import { WebView } from 'react-native-webview';
<WebView source={{ html: youtubeEmbed }} />
```

---

## 9️⃣ Environment Setup

### Requirements
- Node.js 18+ (download from https://nodejs.org/)
- npm 9+ (comes with Node.js)
- Expo CLI (installed via npx)

### Verify Installation
```bash
node --version  # Should be v18 or higher
npm --version   # Should be 9 or higher
```

---

## 🔟 Troubleshooting

### Clear npm cache and reinstall
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Clear Expo cache
```bash
expo start --clear
```

### Rebuild native modules
```bash
npx expo prebuild --clean
```

### Reset entire project
```bash
rm -rf node_modules .expo
npm install
```

---

## 📝 Notes

- All `EXPO_PUBLIC_*` environment variables are accessible in the app
- Use `.env` file for sensitive data that shouldn't be public
- TypeScript provides type safety across the entire app
- NativeWind brings full Tailwind CSS to React Native
- Expo Router enables file-based routing like Next.js
- AsyncStorage is great for caching and user preferences
- Axios with interceptors handles API calls efficiently
- WebView enables embedding web content like YouTube videos

---

Last Updated: January 13, 2026
