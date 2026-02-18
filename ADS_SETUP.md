# Ads Integration Setup Guide

## Overview
The Cognitive Games Hub now includes comprehensive ad integration with Google AdSense support. Ads are automatically hidden for premium users.

## Ad Types Implemented

### 1. Banner Ads
- **Location**: Top and bottom of Home page
- **Component**: `BannerAd`
- **Usage**: Automatically displayed for free users

### 2. Interstitial Ads
- **Location**: Between game sessions (full-screen)
- **Component**: `InterstitialAd`
- **Frequency**: Configurable (default: every 3 games, min 60s interval)
- **Usage**: Can be triggered after game over

### 3. Rewarded Video Ads
- **Location**: Game Over modal, Daily Limit modal
- **Component**: `RewardedVideoAd`
- **Reward**: Extra game play (bypasses daily limit)
- **Usage**: Users can watch ads to get extra plays

## Setup Instructions

### Step 1: Get Google AdSense Account
1. Sign up at https://www.google.com/adsense/
2. Get approved for your domain
3. Create ad units:
   - Banner ad unit
   - Interstitial ad unit
   - Rewarded video ad unit

### Step 2: Configure Ad Units
Edit `src/utils/ads.js`:

```javascript
// Replace with your AdSense Publisher ID
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';

// Replace with your ad unit IDs
export const AD_UNITS = {
  banner: '1234567890',        // Your banner ad unit ID
  interstitial: '0987654321', // Your interstitial ad unit ID
  rewarded: '1122334455',      // Your rewarded video ad unit ID
};
```

### Step 3: Enable AdSense Script (Optional)
If you want to load AdSense script in HTML instead of dynamically:
1. Uncomment the script tag in `public/index.html`
2. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID

### Step 4: Test Ads
1. Make sure you're not a premium user (or clear premium status)
2. Visit the Home page - banner ads should appear
3. Play a game and finish it - rewarded video option appears
4. Hit daily limit - rewarded video option appears

## Ad Display Logic

- **Premium Users**: No ads shown (all ad components check `shouldShowAds()`)
- **Free Users**: 
  - Banner ads on Home page
  - Rewarded video option in Game Over modal
  - Rewarded video option when daily limit reached
  - Interstitial ads can be triggered programmatically

## Adding Interstitial Ads to Games

To show interstitial ads between game sessions, add this to your game component:

```javascript
import InterstitialAd from '../components/ads/InterstitialAd';
import { shouldShowInterstitial } from '../utils/ads';

// In your component:
const [showInterstitial, setShowInterstitial] = useState(false);

// After game over:
useEffect(() => {
  if (gameState === 'gameover' && shouldShowInterstitial()) {
    setShowInterstitial(true);
  }
}, [gameState]);

// In render:
<InterstitialAd 
  show={showInterstitial} 
  onClose={() => setShowInterstitial(false)} 
/>
```

## Revenue Optimization Tips

1. **Placement**: Banner ads are placed at top and bottom of Home page for maximum visibility
2. **Frequency**: Interstitial ads respect minimum interval (60s) to avoid annoying users
3. **Value Exchange**: Rewarded video ads provide clear value (extra plays) encouraging engagement
4. **Premium Upsell**: Ads create natural upgrade path to premium (ad-free experience)

## Testing Without AdSense

The ad system works without actual AdSense integration:
- Components render but show no ads
- Rewarded video simulates 3-second ad and grants reward
- All premium checks work correctly

## Production Checklist

- [ ] Replace `ADSENSE_PUBLISHER_ID` with your actual ID
- [ ] Replace all `AD_UNITS` IDs with your actual ad unit IDs
- [ ] Test ads on staging environment
- [ ] Verify premium users see no ads
- [ ] Monitor ad performance in AdSense dashboard
- [ ] Adjust interstitial frequency if needed
- [ ] Consider A/B testing ad placements

## Support

For AdSense issues, refer to:
- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
