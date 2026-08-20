import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Star,
  Users,
  BookOpen,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const PlatformMarketplace: React.FC = () => {
  const { platforms, setSelectedPlatformId, setCurrentView, theme } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const isLight = theme === 'light';

  const filteredPlatforms = (platforms || []).filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.subjectCategory === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 text-right">
      
      {/* Marketplace Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold ${
            isLight
              ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
              : 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>سوق منصات كبار معلمي الجمهورية المعتمدة من SEA</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          اختر مدرسك، وتصفح منصته الخاصة بمادته
        </h1>
        <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          جميع المنصات مجهزة بأحدث مشغلات الفيديو فائقة الأمان، بنوك الأسئلة الذكية، والامتحانات التفاعلية.
        </p>
      </div>

      {/* Filters & Search Bar */}
      <div
        className={`p-4 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        
        {/* Categories pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'جميع المواد' },
            { id: 'languages', label: 'اللغات (إنجليزي - عربي)' },
            { id: 'science', label: 'العلوم (فيزياء - كيمياء - أحياء)' },
            { id: 'humanities', label: 'الأدبي (جغرافيا - تاريخ - فلسفة)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ابحث عن مادة أو مدرس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-xs sm:text-sm focus:border-cyan-500 focus:outline-none text-right ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
            }`}
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPlatforms.map((plat) => {
          return (
            <div
              key={plat.id}
              className={`rounded-3xl border shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-slate-200/60'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={plat.bannerImage}
                    alt={plat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Subject Tag */}
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded-xl text-xs font-black shadow-lg backdrop-blur-md"
                    style={{ backgroundColor: `${plat.themeColor}dd`, color: '#ffffff' }}
                  >
                    {plat.subject}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{plat.rating}</span>
                  </div>

                  {/* Teacher Avatar Floating Overlap */}
                  <div className="absolute -bottom-5 right-6 w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-800 overflow-hidden shadow-2xl bg-slate-900">
                    <img
                      src={plat.teacherAvatar}
                      alt={plat.teacherName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 pt-8 space-y-3 text-right">
                  <div>
                    <h3
                      className={`text-lg font-black transition-colors line-clamp-1 ${
                        isLight ? 'text-slate-900 group-hover:text-cyan-700' : 'text-white group-hover:text-cyan-300'
                      }`}
                    >
                      {plat.name}
                    </h3>
                    <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {plat.teacherName} • {plat.teacherTitle}
                    </p>
                  </div>

                  <p className={`text-xs leading-relaxed line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {plat.teacherBio}
                  </p>

                  {/* Features List */}
                  <div className="space-y-1.5 pt-2">
                    {plat.features.slice(0, 3).map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs ${
                          isLight ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Stats & Button */}
              <div className="p-6 pt-0 space-y-4">
                <div
                  className={`flex items-center justify-between pt-4 border-t text-xs ${
                    isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-500" />
                    {plat.totalStudentsCount.toLocaleString()} طالب
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    {plat.totalCoursesCount} كورسات
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlatformId(plat.id);
                    setCurrentView('platform_detail');
                  }}
                  className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20 cursor-pointer"
                >
                  <span>الدخول لمنصة {plat.teacherName}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
