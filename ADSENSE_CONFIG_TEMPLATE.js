/**
 * AdSense Configuration Template
 * 
 * COPY THIS FILE TO: src/utils/ads.js
 * Then replace the placeholder values with your actual AdSense IDs
 */

// ============================================
// STEP 1: Get your Publisher ID from AdSense
// ============================================
// 1. Log into https://www.google.com/adsense/
// 2. Look at the top of the dashboard
// 3. Copy your Publisher ID (starts with ca-pub-)
// 4. Replace the X's below:

export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // ← REPLACE THIS

// ============================================
// STEP 2: Create Ad Units in AdSense
// ============================================
// 1. In AdSense dashboard, go to Ads → By ad unit
// 2. Create 3 new ad units:
//    - Banner (Display ad, Responsive)
//    - Interstitial (Display ad, Responsive)  
//    - Rewarded Video (Display ad, Responsive)
// 3. Copy each Ad Unit ID (just numbers)
// 4. Replace the numbers below:

export const AD_UNITS = {
  banner: '1234567890',        // ← REPLACE with Banner Ad Unit ID
  interstitial: '0987654321', // ← REPLACE with Interstitial Ad Unit ID
  rewarded: '1122334455',    // ← REPLACE with Rewarded Video Ad Unit ID
};

// ============================================
// EXAMPLE (Don't copy this, just for reference):
// ============================================
/*
export const ADSENSE_PUBLISHER_ID = 'ca-pub-1234567890123456';

export const AD_UNITS = {
  banner: '9876543210',
  interstitial: '1234567890',
  rewarded: '5555555555',
};
*/

// ============================================
// After configuring, save this file and restart your dev server
// ============================================
