'use client';
import { useState, useMemo } from 'react';
import { useIPTV } from './hooks/useIPTV';
import VideoPlayer from './components/VideoPlayer';

// Comprehensive category translations
const CATEGORY_MAP: Record<string, string> = {
  All: 'الكل',
  Animation: 'رسوم متحركة',
  'Animation;Kids': 'أطفال وكرتون',
  Auto: 'سيارات',
  Business: 'أعمال',
  'Business;News': 'أخبار المال',
  Classic: 'كلاسيك',
  Comedy: 'كوميدي',
  Cooking: 'طبخ',
  Culture: 'ثقافة',
  'Culture;Documentary': 'وثائقي ثقافي',
  'Culture;Documentary;Travel': 'سفر ووثائقي',
  'Culture;Entertainment;News': 'منوعات وأخبار',
  'Culture;News': 'أخبار ثقافية',
  Documentary: 'وثائقي',
  'Documentary;Education': 'وثائقي تعليمي',
  'Documentary;Education;Outdoor;Relax': 'طبيعة واسترخاء',
  'Documentary;News': 'وثائقي وإخباري',
  Education: 'تعليم',
  'Education;News': 'تعليم وأخبار',
  Entertainment: 'ترفيه',
  'Entertainment;Series': 'مسلسلات ترفيهية',
  Family: 'عائلي',
  General: 'عامة',
  Kids: 'أطفال',
  'Kids;Religious': 'أطفال إسلامي',
  Legislative: 'قانونية',
  Lifestyle: 'نمط حياة',
  Movies: 'أفلام',
  Music: 'موسيقى',
  News: 'أخبار',
  'News;Public': 'أخبار عامة',
  'News;Sports': 'أخبار رياضية',
  'Relax;Travel': 'سياحة واسترخاء',
  Religious: 'ديني',
  Series: 'مسلسلات',
  Sports: 'رياضة',
  Undefined: 'غير محدد',
};

export default function Home() {
  const { channels, loading } = useIPTV();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [brokenLogos, setBrokenLogos] = useState<Record<number, boolean>>({});

  // Filter Logic
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch =
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (channel.group?.title || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || channel.group?.title === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [channels, searchQuery, selectedCategory]);

  // Unique Category List
  const categories = useMemo(() => {
    const groups = channels
      .map((channel) => channel.group?.title)
      .filter(Boolean);
    return ['All', ...Array.from(new Set(groups))].sort();
  }, [channels]);

  return (
    /* 
      LAYOUT FIXES:
      - dir="rtl" for Arabic flow.
      - h-screen for full height.
      - flex-col (Mobile: Player top, List bottom)
      - md:flex-row (PC: List right, Player left)
    */
    <main
      dir='rtl'
      className='flex flex-col md:flex-row h-screen w-full bg-[#0f0f0f] text-white font-sans overflow-hidden'
    >
      {/* 1. PLAYER SECTION (Flexible area) */}
      <section className='flex-grow bg-black relative flex items-center justify-center overflow-hidden order-1 md:order-1'>
        <div className='w-full aspect-video md:h-full flex items-center justify-center p-0 md:p-6 lg:p-10'>
          {selectedChannel ? (
            <VideoPlayer
              url={selectedChannel.url}
              title={selectedChannel.name}
            />
          ) : (
            <div className='text-center opacity-30'>
              <div className='text-5xl md:text-7xl mb-4'>📺</div>
              <p className='text-xs md:text-sm font-bold uppercase tracking-widest'>
                اختر قناة لبدء المشاهدة
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. SIDEBAR SECTION (Fixed width on PC) */}
      <aside className='flex flex-col w-full md:w-[380px] lg:w-[420px] h-[50vh] md:h-full border-t md:border-t-0 md:border-s border-white/10 bg-[#0f0f0f] z-30 order-2 md:order-2'>
        {/* SEARCH & CATEGORIES */}
        <div className='p-4 space-y-3 shrink-0 bg-[#0f0f0f] shadow-xl'>
          <div className='relative'>
            <input
              type='text'
              placeholder='بحث عن قنوات...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full bg-[#222] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600 transition placeholder:text-zinc-600 text-right'
            />
          </div>

          <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95
                ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-[#222] text-zinc-400 hover:bg-white/10'}`}
              >
                {CATEGORY_MAP[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE LIST */}
        <div className='flex-grow overflow-y-auto px-2 space-y-1 custom-scrollbar pb-10'>
          {loading ? (
            <div className='flex flex-col items-center justify-center h-40 gap-3'>
              <div className='w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
              <p className='text-[10px] font-bold text-zinc-500 uppercase'>
                جاري مزامنة القنوات
              </p>
            </div>
          ) : (
            filteredChannels.map((channel, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedChannel(channel);
                  // Scroll to top on mobile when a channel is clicked
                  if (window.innerWidth < 768)
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex gap-3 p-3 rounded-xl transition-all items-center text-right group
                  ${selectedChannel?.url === channel.url ? 'bg-white/10 border border-white/5' : 'hover:bg-white/5 border border-transparent'}`}
              >
                {/* LOGO */}
                <div className='w-20 h-12 bg-zinc-900 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-white/5'>
                  {channel.tvg.logo && !brokenLogos[index] ? (
                    <img
                      src={channel.tvg.logo}
                      alt=''
                      className='max-w-full max-h-full object-contain p-1 group-hover:scale-110 transition-transform'
                      onError={() =>
                        setBrokenLogos((p) => ({ ...p, [index]: true }))
                      }
                    />
                  ) : (
                    <span className='text-[10px] font-black opacity-20'>
                      {channel.name.substring(0, 2)}
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className='overflow-hidden flex-grow'>
                  <p
                    className={`text-sm font-bold truncate ${selectedChannel?.url === channel.url ? 'text-red-500' : 'text-zinc-200'}`}
                  >
                    {channel.name}
                  </p>
                  <p className='text-[10px] text-zinc-500 mt-0.5 font-bold flex items-center gap-1.5'>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${selectedChannel?.url === channel.url ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}
                    />
                    {CATEGORY_MAP[channel.group?.title] ||
                      channel.group?.title ||
                      'بث مباشر'}
                  </p>
                </div>
              </button>
            ))
          )}

          {filteredChannels.length === 0 && !loading && (
            <div className='text-center p-10 opacity-30 text-xs font-bold'>
              لا توجد قنوات مطابقة للبحث
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
