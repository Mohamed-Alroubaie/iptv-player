'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(url)}`;

    const config = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60,
    };

    if (Hls.isSupported()) {
      const hls = new Hls(config);
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Force play and catch errors if it's still blocked
        video.play().catch((e) => console.warn('Autoplay blocked:', e));
      });

      // Cleanup to prevent memory leaks on channel change
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxiedUrl;
    }
  }, [url]);

  return (
    <div className='w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl'>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted // CRITICAL: Fixes most "blank screen" autoplay blocks
        playsInline // Required for mobile/iOS
        crossOrigin='anonymous' // CRITICAL: Allows proxy data access
        className='w-full h-full'
      />
    </div>
  );
}
