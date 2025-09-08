# BESTPOOL - Technical Documentation

## Architecture Overview

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper
- **State Management**: Context API + AsyncStorage
- **Wallet Integration**: Phantom wallet SDK

### Backend Architecture
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL (hosted on user's Digital Ocean VPS)
- **Authentication**: Supabase Auth
- **Real-time**: WebSockets
- **APIs**: RESTful with tRPC integration planned

### Key Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "@solana/web3.js": "^1.x",
  "@solana/wallet-adapter-phantom": "^0.x",
  "expo-notifications": "^0.x",
  "@react-navigation/native": "^6.x",
  "react-native-paper": "^5.x"
}
```

## Data Flow

### 1. Pool Data Pipeline
```
ORCA DEX API → Data Processing → Risk Analysis → Recommendation Engine → UI
```

### 2. User Flow
```
Login → Strategy Setup → Recommendation Display → Portfolio Sync → Alerts
```

## Core Algorithms

### 1. Correlation Analysis
- Calculate pair correlations
- Identify hedge opportunities with EURC
- Balance portfolio risk exposure

### 2. IL Risk Calculation
```typescript
ILRisk = (PriceRatio - 1) * LiquidityAmount * CorrelationFactor
```

### 3. Yield Optimization
```typescript
OptimalRange = {
  lower: CurrentPrice * (1 - VolatilityBuffer),
  upper: CurrentPrice * (1 + VolatilityBuffer)
}
```

## Security Considerations

### 1. Wallet Security
- Read-only access only
- No transaction signing
- Secure key storage

### 2. Data Protection
- Encrypted local storage
- HTTPS-only communications
- API key protection

### 3. User Privacy
- Minimal data collection
- Local preference storage
- Anonymous usage tracking

## API Integration Points

### 1. ORCA DEX
- Pool data retrieval
- Price feeds
- Liquidity metrics
- Yield calculations

### 2. Phantom Wallet
- Address reading
- Portfolio tracking
- Transaction history

### 3. External Data Sources
- Macro economic indicators
- Volatility indices
- Market sentiment data
- On-chain analytics

## Development Environment

### Setup Requirements
- Node.js 18+
- Expo CLI
- iOS Simulator (for testing)
- Digital Ocean VPS access
- Supabase project

### Build Process
```bash
npm run dev        # Development
npm run build      # Production build
npm run ios        # iOS simulator
npm run lint       # Code verification
npm run type-check # TypeScript verification
```

## Deployment Strategy

### 1. Development
- Local development with Expo Go
- Supabase development instance

### 2. Staging
- TestFlight distribution
- Supabase staging environment

### 3. Production
- App Store distribution
- Production VPS deployment
- Supabase production instance

## Performance Optimization

### 1. Data Caching
- AsyncStorage for user preferences
- Memory caching for frequent API calls
- Background refresh strategies

### 2. Network Optimization
- Request batching
- Connection pooling
- Retry mechanisms

### 3. UI Performance
- FlatList optimization
- Image lazy loading
- Animation performance