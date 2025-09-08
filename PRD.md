# BESTPOOL - Product Requirements Document

## Overview
BESTPOOL is an iOS mobile application that provides optimized liquidity pool recommendations for ORCA DEX on Solana, targeting DeFi traders, crypto investors, and liquidity providers.

## Target Audience
- DeFi traders seeking high-yield opportunities
- Crypto investors looking for liquidity provision strategies
- Liquidity providers wanting risk-optimized positions

## Core Value Proposition
Maximize LP fees while minimizing Impermanent Loss through intelligent pool recommendations based on:
- Opposite correlation balancing
- EURC hedge strategies
- Real-time macro and on-chain data analysis

## Key Features

### 1. Authentication & Onboarding
- Google OAuth login
- Phantom wallet integration (read-only)
- User preference storage

### 2. Strategy Configuration
- Total investment volume input
- 24-hour fee expectations
- Pool selection from 6 core pairs:
  - SOL/USDC
  - CBBTC/USDC
  - EURC/USDC
  - USDT/USDT
  - WETH/USDC
  - SOL/USDT

### 3. Recommendation Engine
- Detailed range and volume per pool
- IL and volatility risk analysis (+/-% per pool)
- Trend direction (Bull/Stable/Bear)
- Exit trigger alerts

### 4. Real-time Updates
- Macro trend analysis
- On-chain data integration
- Volatility event monitoring
- Live price and yield updates

### 5. Portfolio Tracking
- Wallet address monitoring
- Current vs recommended position comparison
- Change recommendations

### 6. Alert System
- iOS push notifications
- Custom trigger alerts per pool
- Risk threshold notifications

## Technical Requirements

### Performance
- Real-time data updates
- <3 second response times
- Offline capability for saved data

### Security
- Read-only wallet access
- Encrypted preference storage
- Secure API communications

### Integrations
- ORCA DEX API
- Phantom wallet SDK
- Macro trend data providers
- On-chain data services
- Push notification services

## Success Metrics
- User retention rate
- Recommendation accuracy
- IL reduction vs market average
- Fee generation optimization