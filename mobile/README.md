# CallCRM Mobile App

A modern, professional CRM mobile application built with React Native (Expo).

## Features
- **Modern Dashboard**: View metrics and distributions on the go.
- **Client List**: Search, filter, and manage clients with color-coded statuses.
- **Click-to-Call**: Direct integration with the phone's native dialer.
- **Dark Mode**: Automatically respects your system's theme settings.
- **Secure Auth**: Persistent JWT authentication using AsyncStorage.

## Tech Stack
- **Framework**: React Native (Expo)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **Networking**: Axios
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage
- **Charts**: React Native Chart Kit

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Expo Go](https://expo.dev/client) app installed on your Android/iOS device.

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Configure API
Open `src/api/api.ts` and update the `BASE_URL`:
- For **Android Emulator**: `http://10.0.2.2:5000/api` (default)
- For **Physical Device**: Find your computer's local IP address (e.g., `192.168.1.10`) and use `http://192.168.1.10:5000/api`.

### 4. Run the App
```bash
npx expo start
```
Scan the QR code with your phone (using Expo Go) or press `a` to run on an Android emulator.

## APK Build Instructions
To generate a standalone APK:

1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Configure project: `eas build:configure`
4. Build APK:
```bash
eas build -p android --profile preview
```
This will generate a link to download the `.apk` file once the build is finished in the cloud.

## Mobile Specifics
- **Push Notifications**: Logic is prepared in the app structure. To enable fully, configure your Expo credentials in `app.json`.
- **Permissions**: This app requires Phone Dialer permissions (handled via Expo Linking).
