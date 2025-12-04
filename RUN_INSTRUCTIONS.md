# How to View Your PromptPic App

## Step 1: Install Dependencies

First, make sure you have Node.js installed, then install the project dependencies:

```bash
cd /home/ubuntu/data5570_mycode/PromptPic-Frontend
npm install
```

## Step 2: Start the Development Server

After dependencies are installed, start the Expo development server:

```bash
npm start
```

or

```bash
npx expo start
```

This will open the Expo development tools in your terminal/browser.

## Step 3: View the App

You have several options to view your app:

### Option A: Expo Go (Easiest - Recommended for Testing)

1. **Install Expo Go** on your phone:
   - iOS: Download from the App Store
   - Android: Download from Google Play Store

2. **Scan the QR Code**:
   - The terminal will show a QR code after running `npm start`
   - **On iOS**: Open the Camera app and scan the QR code
   - **On Android**: Open the Expo Go app and tap "Scan QR code"

3. **Make sure your phone and computer are on the same WiFi network**

### Option B: iOS Simulator (Mac only)

1. Press `i` in the terminal where Expo is running
2. Or run: `npm run ios`

### Option C: Android Emulator

1. Set up Android Studio and create an emulator first
2. Press `a` in the terminal where Expo is running
3. Or run: `npm run android`

### Option D: Web Browser

1. Press `w` in the terminal where Expo is running
2. Or run: `npm run web`
3. The app will open in your default browser

## Troubleshooting

### If you see "Unable to connect to Metro bundler":
- Make sure the development server is running
- Check your firewall settings
- Try restarting the server

### If the app won't load:
- Make sure your backend is running (if testing API connections)
- Check that your EC2 IP is set correctly in `services/api.ts`
- Check the terminal for error messages

### To stop the development server:
- Press `Ctrl + C` in the terminal

## Next Steps

1. Update the API URL in `services/api.ts` with your EC2 IP
2. Make sure your backend is running on EC2
3. Test the app features!


