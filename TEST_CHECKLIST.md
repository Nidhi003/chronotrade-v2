# ChronoTrade E2E Testing Checklist

## User Flows to Test

### 1. Landing Page
- [ ] Page loads without errors
- [ ] Hero section renders correctly
- [ ] Features section displays all features
- [ ] Pricing section shows correct tiers (Starter $0, Pro $14, Elite $29)
- [ ] CTA buttons navigate to /auth
- [ ] Footer links work

### 2. Authentication
- [ ] Sign up with new email
- [ ] Email verification (check inbox)
- [ ] Sign in with existing account
- [ ] Sign out works
- [ ] Password validation works
- [ ] Rate limiting kicks in after 5 failed attempts

### 3. Dashboard
- [ ] Stats cards show real data
- [ ] Charts render correctly (no width/height errors)
- [ ] Sidebar navigation works
- [ ] Theme toggle (dark/light) works
- [ ] Profile dropdown opens/closes
- [ ] Notifications bell works
- [ ] Add trade form opens

### 4. Trade Entry
- [ ] Can add new trade manually
- [ ] Trade saves to localStorage
- [ ] Free tier limits enforced (20 trades)
- [ ] All trade fields validate correctly

### 5. Premium Features (Pro/Elite only)
- [ ] AI Oracle - triggers AI analysis
- [ ] Market Regime - shows regime data
- [ ] PDF Reports - generates downloadable PDF
- [ ] Cloud Sync - syncs to Supabase
- [ ] Visual Playback - renders chart playback
- [ ] Shadow Simulator - shows what-if analysis

### 6. Subscription Flow
- [ ] Subscribe page loads
- [ ] Plan selection works
- [ ] Razorpay checkout opens
- [ ] Post-payment redirect works

### 7. Mobile
- [ ] Responsive sidebar collapse
- [ ] Charts resize correctly
- [ ] Touch interactions work

## Test Accounts (Supabase)
- Test Email: test@chronotrade.io
- Test Password: Test123!@#

## Test Trade Data
```json
{
  "symbol": "EUR/USD",
  "side": "long",
  "quantity": 1,
  "entryPrice": 1.0850,
  "exitPrice": 1.0900,
  "pnl": 50,
  "strategy": "trend",
  "status": "closed"
}
```

## Browser Console Check
- No Error level logs (warnings are OK)
- No failed network requests (except intentional 401s)
- No React errors

## Build Verification
```bash
cd frontend && npm run build
```
Should complete without errors.