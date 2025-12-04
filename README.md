# PromptPic Frontend

A React Native mobile app built with Expo for sharing photos based on daily prompts.

## Features

- 📱 **Home Page**: View today's prompt, yesterday's prompt & winner
- 📷 **Camera**: Take photos based on daily prompts
- ❤️ **Voting**: Scroll through followers' posts and vote for your favorites
- 🏆 **Daily Prompts**: Automatically generated daily challenges

## Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (will be installed automatically)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API URL:
   - Open `services/api.ts`
   - Update the `API_BASE_URL` with your EC2 instance IP:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://localhost:8000/api'
     : 'http://YOUR_EC2_IP:8000/api';  // Update this!
   ```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## Project Structure

```
PromptPic-Frontend/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home page
│   │   ├── camera.tsx     # Camera page
│   │   └── voting.tsx     # Voting page
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   └── PromptPicLogo.tsx  # App logo component
├── services/              # API services
│   └── api.ts            # Backend API client
└── assets/               # Images and other assets
```

## Pages

### Home (`/`)
- Display PromptPic logo
- Show today's daily prompt
- Show yesterday's prompt & winner
- Button to navigate to camera
- Button to navigate to voting

### Camera (`/camera`)
- Take photos using device camera
- Add captions
- Upload photos to backend

### Voting (`/voting`)
- Scroll through posts from followed users
- Like/unlike posts
- View post details and like counts

## Backend Integration

This app connects to the PromptPic Backend API. Make sure:
- Backend is running on your EC2 instance
- CORS is properly configured
- Update the API_BASE_URL in `services/api.ts`

## Development

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## Notes

- Update `YOUR_EC2_IP` in the API service and voting page image URLs
- Camera permissions are required for taking photos
- Authentication will be handled via Django session cookies
