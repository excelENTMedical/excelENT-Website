'use client'

import Script from 'next/script'

interface TrackingPixelsProps {
  googleAnalyticsId?: string
  facebookPixelId?: string
  excelVoiceId?: string
}

export default function TrackingPixels({
  googleAnalyticsId,
  facebookPixelId,
  excelVoiceId,
}: TrackingPixelsProps) {
  return (
    <>
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* ExcelVOICE Tracking */}
      {excelVoiceId && (
        <Script id="excelvoice-tracking" strategy="afterInteractive">
          {`
            (function(e,x,c,v,o,i,ce){
              e.ExcelVOICE=o;e[o]=e[o]||function(){
              (e[o].q=e[o].q||[]).push(arguments)};e[o].l=1*new Date();
              i=x.createElement(c);ce=x.getElementsByTagName(c)[0];
              i.async=1;i.src=v;ce.parentNode.insertBefore(i,ce)
            })(window,document,'script','//tracking.excelvoice.com/ev.js','ev');
            ev('init', '${excelVoiceId}');
            ev('track', 'pageview');
          `}
        </Script>
      )}

      {/* Facebook Pixel noscript fallback */}
      {facebookPixelId && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  )
}
