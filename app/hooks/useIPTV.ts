'use client';
import { useState, useEffect } from 'react';
import { parse, Playlist } from 'iptv-playlist-parser';

export function useIPTV() {
  const [channels, setChannels] = useState<Playlist['items']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaylist() {
      try {
        const response = await fetch(
          'https://iptv-org.github.io/iptv/regions/arab.m3u',
        );
        const data = await response.text();
        const playlist = parse(data);

        // For now, we take 200 channels to keep development fast
        setChannels(playlist.items);
      } catch (error) {
        console.error('Failed to load IPTV list:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlaylist();
  }, []);

  return { channels, loading };
}
