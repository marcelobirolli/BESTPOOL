# BESTPOOL - AI Development Rules

## Development Principles

### 1. DeFi Security First
- NEVER implement transaction signing capabilities
- READ-ONLY wallet access exclusively
- Validate all financial calculations thoroughly
- Implement comprehensive error handling for financial data

### 2. Code Quality Standards
- TypeScript strict mode enabled
- 100% type coverage for financial calculations
- Comprehensive unit tests for risk algorithms
- Integration tests for API endpoints

### 3. User Experience Priority
- <3 second response times for recommendations
- Offline capability for saved configurations
- Intuitive financial data visualization
- Clear risk communication

## Specific Implementation Rules

### 1. Pool Recommendations
- ALWAYS validate pool hashes against ORCA official data
- Implement fallback mechanisms for API failures
- Cross-validate recommendations with multiple data sources
- Include confidence intervals in recommendations

### 2. Risk Calculations
- Use conservative estimates for IL risk
- Implement circuit breakers for extreme volatility
- Validate correlation calculations with historical data
- Include disclaimer for all financial projections

### 3. Notification System
- Implement rate limiting for push notifications
- Allow user control over notification frequency
- Include context in all alert messages
- Provide clear action items in notifications

### 4. Data Management
- Implement data freshness indicators
- Cache critical data with appropriate TTL
- Provide manual refresh capabilities
- Log all API failures for monitoring

## Security Guidelines

### 1. Wallet Integration
```typescript
// CORRECT: Read-only access
const connection = new Connection(RPC_URL);
const publicKey = new PublicKey(walletAddress);
const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
  programId: TOKEN_PROGRAM_ID
});

// FORBIDDEN: Never implement signing
// wallet.signTransaction() - NEVER USE
```

### 2. API Security
- Store API keys in environment variables
- Implement request rate limiting
- Use HTTPS exclusively
- Validate all external data inputs

### 3. User Data Protection
- Minimize data collection
- Encrypt sensitive preferences
- Implement data retention policies
- Provide data export functionality

## Financial Calculation Standards

### 1. Precision Requirements
- Use decimal.js for financial calculations
- Implement rounding strategies consistently
- Validate calculations against known test cases
- Include calculation methodology in documentation

### 2. Risk Assessment
- Conservative IL estimates
- Include worst-case scenarios
- Provide historical performance context
- Clear risk level indicators

### 3. Yield Projections
- Base on historical averages
- Include volatility adjustments
- Provide confidence intervals
- Update projections regularly

## Error Handling Standards

### 1. API Failures
- Graceful degradation
- User-friendly error messages
- Automatic retry mechanisms
- Fallback data sources

### 2. Network Issues
- Offline mode capability
- Data synchronization on reconnect
- Progress indicators for updates
- Clear connectivity status

### 3. Calculation Errors
- Input validation
- Boundary condition checks
- Mathematical error handling
- Audit trail for debugging

## Performance Requirements

### 1. Response Times
- Recommendations: <3 seconds
- Data updates: <1 second
- Wallet sync: <5 seconds
- Alert processing: <500ms

### 2. Memory Management
- Efficient data structures
- Cleanup unused objects
- Monitor memory usage
- Implement garbage collection optimization

### 3. Battery Optimization
- Background processing limits
- Efficient polling strategies
- Optimize API call frequency
- Implement smart refresh logic

## Testing Requirements

### 1. Unit Tests
- All financial calculations
- Risk assessment algorithms
- Data validation functions
- Error handling scenarios

### 2. Integration Tests
- API connectivity
- Wallet integration
- Notification delivery
- Data synchronization

### 3. Security Tests
- API key protection
- Data encryption validation
- Access control verification
- Input sanitization testing