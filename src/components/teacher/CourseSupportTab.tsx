import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupportTicket } from '../../types';
import {
  Ticket,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MessageSquare,
  DollarSign,
  ChevronLeft,
  Trash2,
  Paperclip,
} from 'lucide-react';

interface CourseSupportTabProps {
  platformId: string;
  platformName: string;
  teacherName: string;
}

export const CourseSupportTab: React.FC<CourseSupportTabProps> = ({
  platformId,
  platformName,
  teacherName,
}) => {
  const { supportTickets, createSupportTicket, deleteSupportTicket } = useApp();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<SupportTicket['category']>('technical_bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SupportTicket['severity']>('low');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Filter tickets to only show those belonging to this teacher's platform
  const myTickets = (supportTickets || []).filter(
    (t) => t.platformId === platformId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    createSupportTicket({
      platformId,
      platformName,
      teacherName,
      category,
      title: title.trim(),
      message: message.trim(),
      severity,
      attachmentUrl: attachmentUrl.trim() || undefined,
    });

    // Reset Form
    setTitle('');
    setMessage('');
    setSeverity('low');
    setCategory('technical_bug');
    setAttachmentUrl('');
    setIsCreateOpen(false);
  };

  // Helper: category label
  const getCategoryLabel = (cat: SupportTicket['category']) => {
    switch (cat) {
      case 'financial_withdrawal':
        return 'طلب سحب الأرباح 💰';
      case 'server_upgrade':
        return 'ترقية الخادم والطلاب 🚀';
      case 'student_issue':
        return 'مشكلة حساب طالب 👥';
      case 'feature_request':
        return 'طلب ميزة مخصصة 🛠️';
      case 'technical_bug':
        return 'خلل فني بالمنصة ⚠️';
      default:
        return 'أخرى 🎫';
    }
  };

  // Helper: category badge classes
  const getCategoryBadgeClass = (cat: SupportTicket['category']) => {
    switch (cat) {
      case 'financial_withdrawal':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'server_upgrade':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'student_issue':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'feature_request':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'technical_bug':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div id="course-support-tab-container" className="space-y-6">
      
      {/* Header Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-500" />
            الدعم الفني والطلبات الإدارية لـ SEA
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            من هنا يمكنك التواصل مع الإدارة العليا للمنصة لطلب سحب الأرباح، ترقية السعة السحابية، الإبلاغ عن مشاكل تقنية أو اقتراح مزايا جديدة.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setIsCreateOpen(!isCreateOpen)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>فتح تذكرة دعم / طلب جديد</span>
        </button>
      </div>

      {/* Grid of Tickets / Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Creation / Info Column */}
        {isCreateOpen && (
          <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-500/30 dark:border-cyan-400/30 shadow-2xl h-fit space-y-5 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-500" />
                تذكرة جديدة ومباشرة للإدارة
              </h4>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black p-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تصنيف ونوع الطلب
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="technical_bug">⚠️ خلل فني في المنصة / الموقع</option>
                  <option value="financial_withdrawal">💰 طلب سحب الأرباح والمستحقات</option>
                  <option value="server_upgrade">🚀 طلب ترقية الخادم وزيادة سعة الطلاب</option>
                  <option value="student_issue">👥 مشكلة في حساب طالب معين</option>
                  <option value="feature_request">🛠️ طلب ميزة أو تطوير مخصص</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان الطلب / التذكرة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طلب سحب مستحقات شهر فبراير 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  مستوى الأهمية والاستعجال
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'منخفضة 🟢', color: 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' },
                    { id: 'medium', label: 'متوسطة ⚠️', color: 'border-amber-500/20 text-amber-600 bg-amber-500/5' },
                    { id: 'high', label: 'عاجلة جداً 🔥', color: 'border-rose-500/20 text-rose-600 bg-rose-500/5' },
                  ].map((lvl) => {
                    const isSelected = severity === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSeverity(lvl.id as SupportTicket['severity'])}
                        className={`py-2 rounded-xl border text-[11px] font-black transition-all ${
                          isSelected
                            ? 'ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تفاصيل ووصف الطلب بشكل كامل
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="اكتب هنا كافة تفاصيل طلبك (رقم فودافون كاش للسحب، تفاصيل المشكلة التقنية، سعة الطلاب المطلوبة، إلخ...)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200 leading-relaxed"
                />
              </div>

              {/* Attachment URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رابط ملف مرفق أو لقطة شاشة (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://example.com/screenshot.jpg"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200 font-mono"
                  />
                  <Paperclip className="absolute left-auto right-2.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white dark:text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/25 flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-4 h-4" />
                <span>إرسال الطلب للإدارة فوراً</span>
              </button>
            </form>
          </div>
        )}

        {/* Tickets List Column(s) */}
        <div className={`space-y-4 ${isCreateOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              تاريخ طلباتك وتذاكر الدعم ({myTickets.length})
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              محدثة فورياً مع خادم الإدارة العليا
            </span>
          </div>

          {myTickets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto text-2xl">
                🎫
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-black text-slate-800 dark:text-slate-200">لا توجد طلبات أو تذاكر سابقة</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  منصتك التعليمية تعمل بشكل مثالي! عندما تحتاج إلى ترقية السيرفر، سحب أرباح أو أي استفسار تقني، افتح تذكرة جديدة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-black transition-colors"
              >
                افتح تذكرة دعمك الأولى الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myTickets.map((ticket) => {
                const isHigh = ticket.severity === 'high';
                const isMedium = ticket.severity === 'medium';
                return (
                  <div
                    key={ticket.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* Severity colored left indicator */}
                    <div
                      className={`absolute top-0 bottom-0 right-auto left-0 w-1.5 ${
                        isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="space-y-2">
                        {/* Meta Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${getCategoryBadgeClass(ticket.category)}`}>
                            {getCategoryLabel(ticket.category)}
                          </span>

                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                            isHigh
                              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              : isMedium
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          }`}>
                            الأهمية: {ticket.severity === 'high' ? 'عاجلة جداً 🔥' : ticket.severity === 'medium' ? 'متوسطة ⚠️' : 'عادية 🟢'}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            TID: {ticket.id}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {ticket.title}
                        </h5>

                        {/* Message details */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 whitespace-pre-line">
                          {ticket.message}
                        </p>

                        {/* Attachment Link */}
                        {ticket.attachmentUrl && (
                          <a
                            href={ticket.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-black bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>عرض الملف المرفق بالتذكرة</span>
                          </a>
                        )}

                        {/* Official Response from Administrator */}
                        {ticket.adminResponse ? (
                          <div className="mt-4 p-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border-2 border-dashed border-cyan-500/30 text-slate-800 dark:text-slate-100 text-xs leading-relaxed space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                الرد الرسمي والقرار المباشر من الإدارة العليا:
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                {new Date(ticket.updatedAt).toLocaleDateString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="font-bold pr-2 border-r-2 border-cyan-500/50 whitespace-pre-line">
                              {ticket.adminResponse}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>الطلب قيد المراجعة الفنية والدراسة المالية من قبل مسؤولي SEA وسنقوم بالرد قريباً.</span>
                          </div>
                        )}
                      </div>

                      {/* Status / Delete Section */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 shrink-0">
                        {/* Status badge */}
                        <div className="flex items-center gap-1.5">
                          {ticket.status === 'pending' && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-black flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> قيد المراجعة 🟡
                            </span>
                          )}
                          {ticket.status === 'in_progress' && (
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 text-xs font-black flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> قيد المعالجة 🔵
                            </span>
                          )}
                          {ticket.status === 'resolved' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> تم التنفيذ والحل 🟢
                            </span>
                          )}
                          {ticket.status === 'rejected' && (
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-black flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> تم الاعتذار / الرفض 🔴
                            </span>
                          )}
                        </div>

                        {/* Date Created */}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block sm:text-right mt-1">
                          {new Date(ticket.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {/* Cancel / Delete Ticket button (allowed for pending/resolved/rejected) */}
                        {ticket.status !== 'in_progress' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً وسحبه؟')) {
                                deleteSupportTicket(ticket.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 transition-colors border border-slate-100 dark:border-slate-800/80 cursor-pointer sm:mt-auto"
                            title="سحب وحذف هذا الطلب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
