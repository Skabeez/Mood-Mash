# ⚠️ First: Install Node.js

Before running the setup, you need to install Node.js (which includes npm).

## 1. Download Node.js
- Go to https://nodejs.org/
- Download LTS version (v20 or higher recommended)
- Run the installer and follow the prompts

## 2. Verify Installation
After installation, restart your terminal and run:
```bash
node --version
npm --version
```

## 3. Then Run This Setup Command

Once Node.js is installed, run this in the `ReactNativeApp` folder:

```bash
npm install expo-router expo-constants @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler nativewind tailwindcss @react-native-async-storage/async-storage axios react-native-webview
```

Followed by dev dependencies:
```bash
npm install --save-dev typescript @types/react @types/react-native @babel/preset-typescript
```

## 4. Create Configuration Files

Copy these into your `ReactNativeApp` folder:

### `babel.config.js`
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

### `tailwind.config.js`
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

### `input.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `tsconfig.json`
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

## 5. Start Development
```bash
npx expo start
```

See `INSTALLATION_COMMANDS.md` for complete reference!
