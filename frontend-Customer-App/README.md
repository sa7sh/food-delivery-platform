# QuickBite - Food Delivery App

A production-ready food delivery mobile application built with React Native and Expo.

## 🚀 Features

- ✅ User Authentication (Login, Register, OTP, Forgot Password)
- ✅ Restaurant Discovery & Search
- ✅ Menu Browsing with Categories
- ✅ Cart Management
- ✅ Order Placement & Tracking
- ✅ Order History
- ✅ Profile Management
- ✅ Saved Addresses
- ✅ Real-time Cart Badge
- ✅ Pull-to-Refresh
- ✅ Offline Detection

## 🛠️ Tech Stack

- **Framework**: React Native (Expo)
- **Language**: JavaScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Styling**: NativeWind v2 (Tailwind CSS)
- **Storage**: Expo SecureStore
- **Animations**: React Native Animated API, Lottie

## 📁 Project Structure
```
src/
├── app/                    # App-level configuration
├── navigation/             # Navigation setup
├── components/             # Reusable components
│   ├── ui/                # UI components
│   └── layout/            # Layout components
├── features/              # Feature modules
│   ├── splash/           # Splash screen
│   ├── auth/             # Authentication
│   ├── home/             # Home & discovery
│   ├── restaurant/       # Restaurant details
│   ├── cart/             # Shopping cart
│   ├── orders/           # Order management
│   └── profile/          # User profile
├── services/             # API & storage services
├── store/                # Zustand stores
├── hooks/                # Custom hooks
├── utils/                # Utility functions
├── constants/            # App constants
└── theme/                # Theme configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd FoodDeliveryApp
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Run on device/simulator
- Press `i` for iOS
- Press `a` for Android
- Scan QR code with Expo Go app

## 📱 App Flow

1. **Splash Screen** → Animated delivery scooter
2. **Authentication** → Login/Register
3. **Home** → Browse restaurants
4. **Restaurant Detail** → View menu & add items
5. **Cart** → Review & checkout
6. **Orders** → Track order status
7. **Profile** → Manage account

## 🔑 Key Components

### State Management (Zustand)
- `authStore` - User authentication
- `cartStore` - Shopping cart
- `userStore` - User profile & addresses
- `ordersStore` - Order management
- `restaurantStore` - Restaurant data

### Navigation
- Root Navigator (Auth/Main)
- Auth Stack (Login, Register, OTP, Forgot Password)
- Main Tabs (Home, Search, Cart, Orders, Profile)
- Nested Stacks (Home, Orders, Profile)

## 🎨 Theming

The app uses a centralized theme system:
- Colors: `src/theme/colors.js`
- Spacing: `src/theme/spacing.js`
- Typography: `src/theme/typography.js`

## 🔌 API Integration

All API calls are abstracted in `src/services/api/`:
- Currently using mock data
- Ready for backend integration
- No API calls in UI components

To integrate with backend:
1. Update `src/config/env.js` with API URL
2. Replace mock responses in service files
3. No UI changes needed!

## 📦 Build for Production
```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🧪 Testing
```bash
# Run tests (when implemented)
npm test
```

## 🚧 Upcoming Features

- [ ] Payment Gateway Integration
- [ ] Real-time Order Tracking
- [ ] Push Notifications
- [ ] Dark Mode
- [ ] Multi-language Support
- [ ] Social Login
- [ ] Ratings & Reviews

## 📄 License

MIT License

## 👥 Contributors

Your Name - Developer

## 📞 Support

For support, email support@quickbite.com