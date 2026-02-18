# AdSense Configuration Guide

## Step 1: Get Your AdSense Account

1. **Sign up for AdSense**
   - Go to https://www.google.com/adsense/
   - Click "Get Started"
   - Sign in with your Google account
   - Add your website URL (e.g., `yourdomain.com`)

2. **Get Approved**
   - Google will review your site (usually takes 1-2 weeks)
   - Ensure your site has:
     - Original content
     - Privacy policy
     - Terms of service
     - At least some content/pages

## Step 2: Get Your Publisher ID

1. **Log into AdSense Dashboard**
   - Go to https://www.google.com/adsense/
   - Click on your account

2. **Find Your Publisher ID**
   - Look at the top of the dashboard
   - It looks like: `ca-pub-1234567890123456`
   - Copy this entire ID (starts with `ca-pub-`)

## Step 3: Create Ad Units

You need to create 3 different ad units:

### 3.1 Create Banner Ad Unit

1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **+ New ad unit**
3. Choose **Display ads**
4. Name it: `Cognitive Games Hub - Banner`
5. Ad size: Choose **Responsive** or **Auto**
6. Click **Create**
7. Copy the **Ad unit ID** (looks like: `1234567890`)

### 3.2 Create Interstitial Ad Unit

1. Click **+ New ad unit** again
2. Choose **Display ads**
3. Name it: `Cognitive Games Hub - Interstitial`
4. Ad size: Choose **Responsive** or **Auto**
5. Click **Create**
6. Copy the **Ad unit ID**

### 3.3 Create Rewarded Video Ad Unit (Optional)

**Note**: Rewarded video ads require additional setup. For now, you can use a display ad unit ID.

1. Click **+ New ad unit**
2. Choose **Display ads** (or Video ads if available)
3. Name it: `Cognitive Games Hub - Rewarded Video`
4. Ad size: Choose **Responsive**
5. Click **Create**
6. Copy the **Ad unit ID**

## Step 4: Configure in Your Code

### Option A: Quick Configuration (Recommended)

1. Open `src/utils/ads.js`
2. Find these lines (around line 9-16):

```javascript
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // Replace with your ID

export const AD_UNITS = {
  banner: '1234567890', // Banner ad unit ID
  interstitial: '0987654321', // Interstitial ad unit ID
  rewarded: '1122334455', // Rewarded video ad unit ID
};
```

3. Replace with your actual IDs:

```javascript
export const ADSENSE_PUBLISHER_ID = 'ca-pub-1234567890123456'; // Your publisher ID

export const AD_UNITS = {
  banner: '1234567890',        // Your banner ad unit ID
  interstitial: '0987654321',  // Your interstitial ad unit ID
  rewarded: '1122334455',     // Your rewarded video ad unit ID
};
```

### Option B: Use Environment Variables (Advanced)

If you want to keep IDs out of your code:

1. Create `.env` file in project root:
```bash
REACT_APP_ADSENSE_PUBLISHER_ID=ca-pub-1234567890123456
REACT_APP_AD_UNIT_BANNER=1234567890
REACT_APP_AD_UNIT_INTERSTITIAL=0987654321
REACT_APP_AD_UNIT_REWARDED=1122334455
```

2. Update `src/utils/ads.js`:
```javascript
export const ADSENSE_PUBLISHER_ID = process.env.REACT_APP_ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
export const AD_UNITS = {
  banner: process.env.REACT_APP_AD_UNIT_BANNER || '1234567890',
  interstitial: process.env.REACT_APP_AD_UNIT_INTERSTITIAL || '0987654321',
  rewarded: process.env.REACT_APP_AD_UNIT_REWARDED || '1122334455',
};
```

## Step 5: Test Your Configuration

1. **Start your development server:**
   ```bash
   npm start
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for any AdSense errors
   - Should see: "adsbygoogle.push()" messages

3. **Verify ads appear:**
   - Make sure you're NOT a premium user
   - Visit Home page - banner ads should appear
   - Play a game - rewarded video option should appear

4. **Test in Incognito:**
   - Sometimes ads don't show to logged-in AdSense users
   - Use incognito mode to see real ads

## Step 6: Deploy and Verify

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy to your domain**

3. **Submit site to AdSense** (if not already done):
   - AdSense dashboard → Sites → Add site
   - Enter your domain

4. **Wait for approval** (1-2 weeks typically)

5. **Check AdSense dashboard:**
   - Should see impressions/clicks after approval

## Troubleshooting

### Ads Not Showing?

1. **Check AdSense approval status**
   - Dashboard should show "Ready" status
   - If "Getting ready", wait for approval

2. **Verify IDs are correct**
   - Publisher ID format: `ca-pub-` followed by numbers
   - Ad unit IDs are just numbers

3. **Check browser console**
   - Look for AdSense errors
   - Common: "Invalid ad unit ID" or "Publisher ID not found"

4. **Test in incognito**
   - AdSense may block ads for account owners
   - Use incognito/private browsing

5. **Check premium status**
   - Premium users don't see ads
   - Clear localStorage: `localStorage.removeItem('cognitiveHub_premium')`

### Common Errors

- **"adsbygoogle.push() error"**: Usually means AdSense script not loaded or invalid IDs
- **"Invalid ad unit"**: Check ad unit ID is correct
- **"Publisher ID not found"**: Verify publisher ID format

## Quick Reference

**File to edit:** `src/utils/ads.js`

**What to replace:**
- Line 9: `ADSENSE_PUBLISHER_ID`
- Line 13: `banner` ad unit ID
- Line 14: `interstitial` ad unit ID  
- Line 15: `rewarded` ad unit ID

**Format:**
- Publisher ID: `ca-pub-1234567890123456` (keep the `ca-pub-` prefix)
- Ad Unit IDs: `1234567890` (just numbers, no prefix)

## Need Help?

- AdSense Help: https://support.google.com/adsense/
- AdSense Community: https://support.google.com/adsense/community
- Check `ADS_SETUP.md` for more technical details
