import React, { useEffect, useRef, useState } from 'react';
import { shouldShowAds, initAdSense, pushAd, ADSENSE_PUBLISHER_ID, AD_UNITS } from '../../utils/ads';

/**
 * Banner Ad Component
 * Displays a responsive banner ad (top or bottom of page)
 * 
 * @param {string} position - 'top' or 'bottom'
 * @param {string} format - 'auto', 'horizontal', 'vertical', 'rectangle'
 */
export default function BannerAd({ position = 'top', format = 'auto' }) {
  const adRef = useRef(null);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (shouldShowAds()) {
      initAdSense();
      setShouldShow(true);
    }
  }, []);

  useEffect(() => {
    if (shouldShow && adRef.current) {
      // Small delay to ensure AdSense script is loaded
      const timer = setTimeout(() => {
        pushAd(adRef.current);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const formatClass = {
    auto: 'adsbygoogle',
    horizontal: 'adsbygoogle',
    vertical: 'adsbygoogle',
    rectangle: 'adsbygoogle',
  }[format] || 'adsbygoogle';

  return (
    <div className={`w-full flex justify-center ${position === 'top' ? 'mb-4' : 'mt-4'}`}>
      <ins
        ref={adRef}
        className={formatClass}
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={AD_UNITS.banner}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
