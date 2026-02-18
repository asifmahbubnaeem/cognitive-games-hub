import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { shouldShowAds, initAdSense, pushAd, shouldShowInterstitial, recordInterstitialShown, ADSENSE_PUBLISHER_ID, AD_UNITS } from '../../utils/ads';

/**
 * Interstitial Ad Component
 * Full-screen ad shown between game sessions
 * 
 * @param {boolean} show - Whether to show the ad
 * @param {function} onClose - Callback when ad is closed/dismissed
 */
export default function InterstitialAd({ show = false, onClose }) {
  const adRef = React.useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (show && shouldShowAds() && shouldShowInterstitial()) {
      initAdSense();
      setShouldShow(true);
      
      // Load ad after a short delay
      setTimeout(() => {
        if (adRef.current) {
          pushAd(adRef.current);
          setAdLoaded(true);
          recordInterstitialShown();
        }
      }, 500);
    } else if (!show) {
      setShouldShow(false);
      setAdLoaded(false);
    }
  }, [show]);

  if (!shouldShow || !show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close ad"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-white mb-4 text-sm">
          Advertisement
        </div>
        
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%', maxHeight: '600px' }}
          data-ad-client={ADSENSE_PUBLISHER_ID}
          data-ad-slot={AD_UNITS.interstitial}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        
        {adLoaded && (
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
