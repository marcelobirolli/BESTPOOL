# BESTPOOL - AI-Powered ORCA DEX Liquidity Optimizer

![React Native](https://img.shields.io/badge/React_Native-0.74-blue)
![Expo](https://img.shields.io/badge/Expo-SDK_53-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Solana](https://img.shields.io/badge/Solana-Mainnet-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Overview

BESTPOOL is an iOS mobile application that provides AI-powered liquidity pool recommendations for ORCA DEX on Solana. It helps DeFi traders, crypto investors, and liquidity providers maximize LP fees while minimizing impermanent loss through intelligent position optimization.

## ✨ Key Features

- **Real-time ORCA DEX Integration**: Live pool data and price feeds
- **Smart Recommendations**: AI-optimized pool allocations with hedge strategies
- **Risk Analysis**: Impermanent loss calculations and volatility monitoring
- **Portfolio Tracking**: Connect Phantom wallet for read-only portfolio monitoring
- **Push Notifications**: Real-time alerts for price movements and opportunities
- **EURC Hedge Strategy**: Automatic hedging against blue-chip volatility

## 📱 Supported Pools

| Pool | Address | Risk Level |
|------|---------|------------|
| SOL/USDC | `Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE` | High |
| cbBTC/USDC | `HxA6SKW5qA4o12fjVgTpXdq2YnZ5Zv1s7SB4FFomsyLM` | Medium |
| WETH/USDC | `AU971DrPyhhrpRnmEBp5pDTWL2ny7nofb5vYBjDJkR2E` | Medium |
| EURC/USDC | `ArisQNcbjXPJD7RgPRvysatX3xcfHPTbcTkfD8kDoZ9i` | Low |
| USDT/USDC | `4fuUiYxTQ6QCrdSq9ouBYcTM7bqSwYTSyLueGZLTy4T4` | Low |

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo + TypeScript
- **Blockchain**: Solana Web3.js
- **State Management**: React Context API
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper
- **Authentication**: Google OAuth + Phantom Wallet
- **Real-time Data**: WebSocket connections
- **Storage**: AsyncStorage for caching

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Expo Go app
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/BESTPOOL.git
cd BESTPOOL
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

4. **Start the development server**
```bash
npm run ios     # For iOS
npm run android # For Android
npm run web     # For web browser
```

## 🏗️ Project Structure

```
BESTPOOL/
├── src/
│   ├── config/          # Pool configurations and constants
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── strategy/    # Strategy setup screen
│   │   ├── recommendations/ # Pool recommendations
│   │   ├── portfolio/   # Portfolio tracking
│   │   └── alerts/      # Alert management
│   └── services/        # API and WebSocket services
│       └── orca/        # ORCA DEX integration
├── assets/              # Images and static files
├── App.tsx              # Main app component
└── package.json         # Dependencies
```

## 📊 Core Features

### 1. Strategy Configuration
- Set total investment volume
- Define expected daily fees target
- Select pools for consideration
- Choose risk tolerance level

### 2. Recommendation Engine
- Real-time pool analysis
- Optimal range calculations
- Impermanent loss estimation
- Correlation-based diversification

### 3. Hedge Optimization
- EURC as primary hedge asset
- Dynamic allocation adjustments
- Volatility-based rebalancing
- Risk mitigation strategies

### 4. Real-time Monitoring
- WebSocket price updates
- Volume tracking
- Volatility alerts
- Market trend analysis

## 🔐 Security

- **Read-only wallet access** - No transaction signing capabilities
- **Encrypted storage** - Sensitive data encrypted locally
- **Secure API communication** - HTTPS/WSS only
- **No private key storage** - Keys never stored or transmitted

## 📱 App Flow

1. **Login** → Google OAuth or Phantom Wallet
2. **Setup Strategy** → Configure investment parameters
3. **View Recommendations** → AI-optimized pool allocations
4. **Track Portfolio** → Monitor current positions
5. **Receive Alerts** → Push notifications for opportunities

## 🧪 Testing

```bash
npm run test        # Run unit tests
npm run lint        # Run linter
npm run type-check  # TypeScript validation
```

## 📈 Performance

- Pool data cached for 30 seconds
- Price updates every 5 seconds
- <3 second recommendation generation
- Automatic reconnection on network issues

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Documentation

- [Product Requirements Document](./PRD.md)
- [Technical Documentation](./TECHNICAL_DOCS.md)
- [Security Guidelines](./SECURITY.md)
- [AI Development Rules](./AI_RULES.md)

## 🚀 Deployment

### iOS App Store
1. Build production bundle: `expo build:ios`
2. Upload to App Store Connect
3. Submit for review

### Backend (Digital Ocean VPS)
- Node.js server for API endpoints
- PostgreSQL for data persistence
- WebSocket server for real-time updates

## 💰 Cost Analysis

- **Development**: Free (open source tools)
- **Production**: ~$80-310/month (APIs and infrastructure)
- **App Store**: $99/year (already paid)

## 🛣️ Roadmap

- [x] Core app structure and navigation
- [x] ORCA DEX API integration
- [x] Real-time price updates
- [x] Recommendation engine
- [ ] Google OAuth implementation
- [ ] Phantom wallet integration
- [ ] Push notifications
- [ ] Production deployment
- [ ] Advanced analytics dashboard
- [ ] Multi-chain support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ORCA DEX for providing liquidity pool infrastructure
- Solana blockchain for fast and cheap transactions
- React Native community for excellent mobile framework

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the DeFi community**