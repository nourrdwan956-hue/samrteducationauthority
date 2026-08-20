import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  X,
  Bookmark,
  Plus,
  Lock,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
  Pin,
  Sparkles,
  Tag,
  Star,
  Info,
} from 'lucide-react';
import { isEnglishText } from '../../utils/langUtils';

export interface ConceptItem {
  id: string;
  title: string;
  content: string;
  category: 'formula' | 'rule' | 'warning' | 'general' | 'student';
  isPinned?: boolean;
  isStudentCustom?: boolean;
  addedAt?: string;
}

interface ConceptSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  rawContent?: string;
  subject?: string;
  storageKey?: string;
}

export const ConceptSheetModal: React.FC<ConceptSheetModalProps> = ({
  isOpen,
  onClose,
  title = 'ورقة المفاهيم والقواعد الاسترشادية',
  rawContent = '',
  subject = '',
  storageKey = 'sea_student_custom_concepts_default',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Student Custom Concepts
  const [studentConcepts, setStudentConcepts] = useState<ConceptItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'formula' | 'rule' | 'warning' | 'general'>('rule');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(studentConcepts));
    } catch {
      // quota safeguard
    }
  }, [studentConcepts, storageKey]);

  if (!isOpen) return null;

  // Parse raw text into structured official cards
  const parseOfficialContent = (text: string): ConceptItem[] => {
    if (!text.trim()) return [];
    
    // Split by headings or numbers
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const parsed: ConceptItem[] = [];

    let currentCardTitle = 'قاعدة استرشادية';
    let currentLines: string[] = [];
    let counter = 1;

    lines.forEach((line) => {
      if (line.startsWith('#') || line.startsWith('==') || /^\d+\./.test(line)) {
        if (currentLines.length > 0) {
          parsed.push({
            id: `off_${counter++}`,
            title: currentCardTitle.replace(/^[#=\d\.\s\*-]+/, '').trim() || `مفهوم #${counter}`,
            content: currentLines.join('\n'),
            category: currentCardTitle.includes('قانون') || currentCardTitle.includes('Formula') || currentCardTitle.includes('=')
              ? 'formula'
              : currentCardTitle.includes('تنبيه') || currentCardTitle.includes('Warning') || currentCardTitle.includes('ملاحظة')
              ? 'warning'
              : 'rule',
            isStudentCustom: false,
          });
          currentLines = [];
        }
        currentCardTitle = line;
      } else {
        currentLines.push(line);
      }
    });

    if (currentLines.length > 0 || currentCardTitle) {
      parsed.push({
        id: `off_${counter++}`,
        title: currentCardTitle.replace(/^[#=\d\.\s\*-]+/, '').trim() || 'مفهوم عام',
        content: currentLines.length > 0 ? currentLines.join('\n') : currentCardTitle,
        category: 'rule',
        isStudentCustom: false,
      });
    }

    return parsed;
  };

  const officialItems = parseOfficialContent(rawContent);

  const allItems: ConceptItem[] = [
    ...officialItems,
    ...studentConcepts,
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddStudentConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newItem: ConceptItem = {
      id: `std_${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      isPinned: true,
      isStudentCustom: true,
      addedAt: new Date().toLocaleDateString('ar-EG'),
    };

    setStudentConcepts([newItem, ...studentConcepts]);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const togglePin = (id: string) => {
    setStudentConcepts(
      studentConcepts.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  // Filter items
  const filteredItems = allItems.filter((item) => {
    const matchesCat =
      activeCategory === 'all'
        ? true
        : activeCategory === 'student'
        ? item.isStudentCustom
        : item.category === activeCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-2xl flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/90 border-b border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-[11px] border border-amber-500/30">
                  مرجع استرشادي أكاديمي 📖
                </span>
                {subject && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    مادة: {subject}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white line-clamp-1">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في القواعد والمعادلات..."
                className="w-full pr-10 pl-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: 'all', label: 'الكل', icon: BookOpen },
                { id: 'rule', label: '📌 قواعد', icon: Tag },
                { id: 'formula', label: '📐 معادلات', icon: Sparkles },
                { id: 'warning', label: '💡 تنبيهات', icon: Lightbulb },
                { id: 'student', label: `📓 ملاحظاتي (${studentConcepts.length})`, icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CARDS CONTENT AREA */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Add Student Note Button Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-transparent border border-teal-500/20">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                يمكنك كتابة ملاحظاتك وقواعدك الذهبية الخاصة لتثبيتها في مرجعك الأكاديمي دائماً.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ملحوظة شخصية</span>
            </button>
          </div>

          {/* Add Custom Concept Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddStudentConcept}
              className="p-4 sm:p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-3 animate-scale-up"
            >
              <h4 className="text-xs font-black text-teal-800 dark:text-teal-300">
                إضافة مفهوم جديد ورسخ القواعد الخاصة بك:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="عنوان المفهوم (مثال: قاعدة زمن الماضي التام المستمر)"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="rule">📌 قاعدة عامة</option>
                    <option value="formula">📐 معادلة / صيغة</option>
                    <option value="warning">💡 ملاحظة / تنبيه</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="اكتب التوضيح والقوانين هنا..."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md"
                >
                  حفظ وتثبيت المفهوم 📌
                </button>
              </div>
            </form>
          )}

          {/* Cards Display Grid */}
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <Info className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-slate-500">
                لا توجد مفاهيم مطابقة للبحث أو التصفية الحالية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isEnglish = isEnglishText(item.content, subject);
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative group ${
                      item.isStudentCustom
                        ? 'bg-teal-500/5 dark:bg-slate-800/90 border-teal-500/30'
                        : item.category === 'formula'
                        ? 'bg-cyan-500/5 dark:bg-slate-800/90 border-cyan-500/30'
                        : item.category === 'warning'
                        ? 'bg-amber-500/5 dark:bg-slate-800/90 border-amber-500/30'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 shadow-sm'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center gap-2">
                        {item.isStudentCustom ? (
                          <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                            📓 ملاحظتك الشخصية
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            رسمي معتمد
                          </span>
                        )}

                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.isStudentCustom && (
                          <button
                            type="button"
                            onClick={() => togglePin(item.id)}
                            className={`p-1 rounded-lg text-xs transition-colors ${
                              item.isPinned
                                ? 'text-amber-500'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title="تثبيت"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.content)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          title="نسخ النص"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div
                      className={`text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-line ${
                        isEnglish ? 'text-left dir-ltr' : 'text-right dir-rtl'
                      }`}
                      dir={isEnglish ? 'ltr' : 'rtl'}
                    >
                      {item.content}
                    </div>

                    {item.addedAt && (
                      <div className="text-[10px] text-slate-400 font-mono text-left pt-1">
                        تمت الإضافة: {item.addedAt}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>ورقة المفاهيم متاحة دائماً طوال مدة حل الامتحان أو الواجب.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md transition-all"
          >
            متابعة الحل 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
