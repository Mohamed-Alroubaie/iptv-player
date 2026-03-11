'use client';
import { useState, useMemo } from 'react';
import { useIPTV } from './hooks/useIPTV';
import VideoPlayer from './components/VideoPlayer';

export default function Home() {
  const { channels, loading } = useIPTV();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [brokenLogos, setBrokenLogos] = useState<Record<number, boolean>>({});

  // CATEGORY + SEARCH FILTER LOGIC
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch =
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (channel.group?.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' ||
        (channel.group?.title || '')
          .toLowerCase()
          .includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);
  const categories = useMemo(() => {
    const groups = channels
      .map((channel) => channel.group?.title)
      .filter(Boolean);
    // 'Set' removes duplicates, then we turn it back into an array
    return ['All', ...Array.from(new Set(groups))].sort();
  }, [channels]);

  return (
    /* 
       LAYOUT HEIGHT: 
       - h-[100dvh] on Mobile (Full screen)
       - md:h-[80vh] on PC (80% height)
    */
    <main className='flex flex-col md:flex-row h-[100dvh] md:h-[80vh] w-full bg-[#0f0f0f] text-white font-sans overflow-hidden transition-all duration-500'>
      {/* 1. PLAYER SECTION */}
      <section className='flex-none md:flex-grow bg-black relative z-20 shadow-2xl overflow-hidden'>
        <div className='w-full aspect-video md:h-full flex items-center justify-center p-0 md:p-6 lg:p-10'>
          {selectedChannel ? (
            <VideoPlayer
              url={selectedChannel.url}
              title={selectedChannel.name}
            />
          ) : (
            <div className='text-center opacity-30 py-8 md:py-0'>
              <div className='text-4xl md:text-5xl mb-2 md:mb-4'>📺</div>
              <p className='uppercase tracking-widest text-[10px] md:text-xs font-bold'>
                Select a Broadcast
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. SIDEBAR SECTION */}
      <aside className='flex flex-col w-full md:w-[380px] lg:w-[420px] h-full border-t md:border-t-0 md:border-l border-white/10 bg-[#0f0f0f] overflow-hidden'>
        {/* SEARCH & CATEGORIES */}
        <div className='p-4 space-y-3 shrink-0 bg-[#0f0f0f] z-10 shadow-lg'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search channels...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-[#222] border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-600 transition outline-none placeholder:text-zinc-600'
            />
          </div>

          <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 transition-all active:scale-95
        ${
          selectedCategory === cat
            ? 'bg-red-600 text-white'
            : 'bg-[#222] text-zinc-400 hover:bg-white/10'
        }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE LIST */}
        <div className='flex-grow overflow-y-auto px-2 space-y-1 custom-scrollbar pb-24 md:pb-6'>
          {loading ? (
            <div className='flex flex-col items-center justify-center h-40 gap-3'>
              <div className='w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
              <p className='text-[10px] font-bold text-zinc-500 uppercase tracking-widest'>
                Syncing Feed
              </p>
            </div>
          ) : (
            filteredChannels.map((channel, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedChannel(channel);
                  if (window.innerWidth < 768)
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex gap-3 p-2 rounded-xl transition-all duration-200 items-center text-left group
                  ${
                    selectedChannel?.url === channel.url
                      ? 'bg-white/10 border border-white/5'
                      : 'hover:bg-white/5 active:bg-white/20 border border-transparent'
                  }`}
              >
                {/* LOGO */}
                <div className='w-20 md:w-24 aspect-video bg-zinc-900 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner'>
                  {channel.tvg.logo && !brokenLogos[index] ? (
                    <img
                      src={channel.tvg.logo}
                      alt=''
                      className='w-full h-full object-contain p-1 group-hover:scale-110 transition-transform'
                      onError={() =>
                        setBrokenLogos((p) => ({ ...p, [index]: true }))
                      }
                    />
                  ) : (
                    <span className='text-[10px] font-black opacity-20'>
                      {channel.name.substring(0, 3)}
                    </span>
                  )}
                </div>

                {/* CHANNEL INFO */}
                <div className='overflow-hidden pr-2'>
                  <p
                    className={`text-xs md:text-sm font-bold truncate leading-tight transition-colors 
                    ${selectedChannel?.url === channel.url ? 'text-red-500' : 'text-zinc-200'}`}
                  >
                    {channel.name}
                  </p>
                  <p className='text-[9px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter flex items-center gap-1'>
                    <span
                      className={`w-1 h-1 rounded-full ${selectedChannel?.url === channel.url ? 'bg-red-500' : 'bg-zinc-700'}`}
                    />
                    {channel.group?.title || 'Live Broadcast'}
                  </p>
                </div>
              </button>
            ))
          )}

          {filteredChannels.length === 0 && !loading && (
            <div className='text-center p-10 opacity-30 text-[10px] font-bold uppercase tracking-widest'>
              No matches found
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
