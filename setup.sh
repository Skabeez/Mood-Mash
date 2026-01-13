#!/bin/bash

# React Native Expo Setup Script
# This script initializes a new Expo project with TypeScript and all dependencies

PROJECT_NAME="ReactNativeApp"

echo "🚀 Creating React Native Expo app with TypeScript..."
npx create-expo-app@latest "$PROJECT_NAME"

cd "$PROJECT_NAME"

echo "📦 Installing core dependencies..."
npm install expo-router expo-constants

echo "📦 Installing navigation packages..."
npm install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler

echo "📦 Installing styling packages..."
npm install nativewind tailwindcss

echo "📦 Installing storage package..."
npm install @react-native-async-storage/async-storage

echo "📦 Installing HTTP client..."
npm install axios

echo "📦 Installing WebView..."
npm install react-native-webview

echo "📦 Installing development tools..."
npm install --save-dev \
  typescript \
  @types/react \
  @types/react-native \
  @babel/preset-typescript

echo "✅ Installation complete!"
echo ""
echo "📁 Project created at: ./$PROJECT_NAME"
echo ""
echo "🎯 Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. Create app directory structure"
echo "3. Set up configuration files"
echo "4. Run: npx expo start"
echo ""
