# 🚀 Quick Start: Configure AdSense in 5 Minutes

## 📋 What You Need

1. ✅ AdSense account (sign up at https://www.google.com/adsense/)
2. ✅ Your Publisher ID (from AdSense dashboard)
3. ✅ 3 Ad Unit IDs (create them in AdSense)

---

## 🎯 Step-by-Step Configuration

### Step 1: Open the Configuration File

Open this file in your editor:
```
src/utils/ads.js
```

### Step 2: Find These Lines (Lines 9-16)

You'll see:
```javascript
// Google AdSense Publisher ID - Replace with your actual AdSense publisher ID
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // ← LINE 9

// Ad unit IDs - Replace with your actual ad unit IDs
export const AD_UNITS = {
  banner: '1234567890',        // ← LINE 13
  interstitial: '0987654321', // ← LINE 14
  rewarded: '1122334455',     // ← LINE 15
};
```

### Step 3: Get Your Publisher ID

1. Go to https://www.google.com/adsense/
2. Log in
3. Look at the **top of the dashboard**
4. You'll see something like: `ca-pub-1234567890123456`
5. **Copy the entire ID** (including `ca-pub-`)

**Replace LINE 9:**
```javascript
export const ADSENSE_PUBLISHER_ID = 'ca-pub-1234567890123456'; // ← Your actual ID
```

### Step 4: Create Ad Units

1. In AdSense dashboard, click **Ads** → **By ad unit**
2. Click **+ New ad unit**

#### Create Banner Ad:
- Name: `Cognitive Games Hub - Banner`
- Type: **Display ads**
- Size: **Responsive** or **Auto**
- Click **Create**
- **Copy the Ad unit ID** (just numbers, like `9876543210`)

#### Create Interstitial Ad:
- Name: `Cognitive Games Hub - Interstitial`
- Type: **Display ads**
- Size: **Responsive** or **Auto**
- Click **Create**
- **Copy the Ad unit ID**

#### Create Rewarded Video Ad:
- Name: `Cognitive Games Hub - Rewarded Video`
- Type: **Display ads** (or Video if available)
- Size: **Responsive**
- Click **Create**
- **Copy the Ad unit ID**

### Step 5: Replace the Ad Unit IDs

**Replace LINES 13-15:**
```javascript
export const AD_UNITS = {
  banner: '9876543210',        // ← Your Banner Ad Unit ID
  interstitial: '1234567890',  // ← Your Interstitial Ad Unit ID
  rewarded: '5555555555',      // ← Your Rewarded Video Ad Unit ID
};
```

### Step 6: Save and Test

1. **Save the file** (`src/utils/ads.js`)
2. **Restart your dev server:**
   ```bash
   npm start
   ```
3. **Open your app** in browser
4. **Check browser console** (F12) for any errors
5. **Verify ads appear** (make sure you're NOT a premium user)

---

## ✅ Final Result

Your `src/utils/ads.js` should look like this:

```javascript
// Google AdSense Publisher ID
export const ADSENSE_PUBLISHER_ID = 'ca-pub-1234567890123456'; // ✅ Your ID

// Ad unit IDs
export const AD_UNITS = {
  banner: '9876543210',        // ✅ Your Banner ID
  interstitial: '1234567890', // ✅ Your Interstitial ID
  rewarded: '5555555555',     // ✅ Your Rewarded Video ID
};
```

---

## 🔍 Where to Find IDs in AdSense

### Publisher ID Location:
```
AdSense Dashboard (top bar)
└── ca-pub-1234567890123456 ← Copy this
```

### Ad Unit IDs Location:
```
AdSense Dashboard
└── Ads
    └── By ad unit
        └── [Your Ad Unit]
            └── Ad unit ID: 9876543210 ← Copy this
```

---

## ⚠️ Important Notes

1. **Publisher ID Format**: Must include `ca-pub-` prefix
   - ✅ Correct: `ca-pub-1234567890123456`
   - ❌ Wrong: `1234567890123456`

2. **Ad Unit IDs Format**: Just numbers, no prefix
   - ✅ Correct: `9876543210`
   - ❌ Wrong: `ca-pub-9876543210`

3. **Testing**: Ads may not show if:
   - You're logged into AdSense (use incognito mode)
   - Your site isn't approved yet
   - You're a premium user (ads are disabled)

4. **Approval Time**: AdSense approval usually takes 1-2 weeks

---

## 🆘 Need Help?

- **Full Guide**: See `ADSENSE_CONFIG_GUIDE.md`
- **Technical Details**: See `ADS_SETUP.md`
- **AdSense Support**: https://support.google.com/adsense/

---

## 📝 Checklist

- [ ] Got AdSense account
- [ ] Got Publisher ID (`ca-pub-...`)
- [ ] Created Banner ad unit
- [ ] Created Interstitial ad unit
- [ ] Created Rewarded Video ad unit
- [ ] Replaced Publisher ID in `src/utils/ads.js`
- [ ] Replaced all 3 Ad Unit IDs in `src/utils/ads.js`
- [ ] Saved file
- [ ] Restarted dev server
- [ ] Tested in browser (incognito mode)
- [ ] Verified no console errors

---

**That's it! Your ads should now be configured.** 🎉
