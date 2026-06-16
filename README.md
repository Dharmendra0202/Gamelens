# Gamelens

A modern cricket social platform built with React Native and Expo.

## Features

### 🔐 Authentication

- Splash screen with gradient design
- Login with social media integration
- User registration with cricket-themed UI

### 🏠 Home Dashboard

- Personal profile section
- Nearby matches discovery
- Popular cricketers showcase
- Cricket equipment store
- Social feed with posts

### 🔍 Looking (Match Discovery)

- Match recommendations
- Location-based filtering
- User profile management

### 🏏 My Cricket

- Personal cricket statistics
- Match history and performance
- Achievement system
- Career analytics

### 👥 Community

- Social feed with posts
- Cricket groups and clubs
- Events and tournaments
- Community interactions

### 🛒 Store

- Cricket equipment catalog
- Featured deals and discounts
- Category-based browsing
- Shopping cart functionality

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **UI**: Custom components with Ionicons
- **Styling**: StyleSheet with responsive design
- **State Management**: React useState
- **Gradients**: expo-linear-gradient

## Color Scheme

- Primary Red: #E63946
- Secondary Pink: #FF6B8A
- Purple Theme: #9D4EDD, #7209B7
- Cream Background: #FFF8E7, #FFFBF0
- Accent Gold: #FFD700

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/Dharmendra8202/crickbuz.git
cd crickbuz
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npx expo start
```

4. Run on device

- Scan QR code with Expo Go app (iOS/Android)
- Or press 'i' for iOS simulator, 'a' for Android emulator

## Project Structure

```
app/
├── index.tsx              # Authentication screens
├── _layout.tsx           # Root layout
└── (tabs)/
    ├── _layout.tsx       # Tab navigation
    ├── home.tsx          # Main dashboard
    ├── looking.tsx       # Match discovery
    ├── my-cricket.tsx    # Personal stats
    ├── community.tsx     # Social features
    └── store.tsx         # Equipment store
```

## Development Status

✅ Complete authentication flow  
✅ 5 fully functional app screens  
✅ Bottom tab navigation  
✅ Interactive modals and features  
✅ Responsive design  
✅ Cricket-themed UI/UX

## Future Enhancements

- [ ] Backend integration
- [ ] Real-time match updates
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Payment integration
- [ ] Advanced analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

**Built with ❤️ for cricket enthusiasts**
