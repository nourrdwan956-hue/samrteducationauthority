import React, { useState } from 'react';
import { SupportTicket } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Trash2,
  Paperclip,
  CheckCircle2,
  Filter,
  Layers,
  Inbox,
  User,
  Ticket,
} from 'lucide-react';

interface AdminTicketsPanelProps {
  supportTickets: SupportTicket[];
  updateSupportTicketStatus: (id: string, status: SupportTicket['status'], adminResponse?: string) => void;
  deleteSupportTicket: (id: string) => void;
}

export const AdminTicketsPanel: React.FC<AdminTicketsPanelProps> = ({
  supportTickets,
  updateSupportTicketStatus,
  deleteSupportTicket,
}) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportTicket['category']>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | SupportTicket['severity']>('all');

  // Reply state
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [targetStatus, setTargetStatus] = useState<SupportTicket['status']>('resolved');

  // Stats
  const tickets = supportTickets || [];
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const progressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
  const financialCount = tickets.filter((t) => t.category === 'financial_withdrawal').length;

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchSeverity = severityFilter === 'all' || t.severity === severityFilter;
    return matchStatus && matchCategory && matchSeverity;
  });

  const handleStatusUpdate = (ticketId: string) => {
    if (!adminResponseText.trim()) {
      alert('الرجاء كتابة نص الرد الإداري أو قرار اللجنة المالية والفنية!');
      return;
    }
    updateSupportTicketStatus(ticketId, targetStatus, adminResponseText.trim());
    setReplyingTicketId(null);
    setAdminResponseText('');
  };

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

  const getCategoryColorClass = (cat: SupportTicket['category']) => {
    if (isLight) {
      switch (cat) {
        case 'financial_withdrawal':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        case 'server_upgrade':
          return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
        case 'student_issue':
          return 'bg-purple-50 text-purple-700 border border-purple-200';
        case 'feature_request':
          return 'bg-amber-50 text-amber-700 border border-amber-200';
        case 'technical_bug':
          return 'bg-rose-50 text-rose-700 border border-rose-200';
        default:
          return 'bg-slate-100 text-slate-700 border border-slate-200';
      }
    }
    switch (cat) {
      case 'financial_withdrawal':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      case 'server_upgrade':
        return 'bg-cyan-950 text-cyan-400 border border-cyan-800';
      case 'student_issue':
        return 'bg-purple-950 text-purple-400 border border-purple-800';
      case 'feature_request':
        return 'bg-amber-950 text-amber-400 border border-amber-800';
      case 'technical_bug':
        return 'bg-rose-950 text-rose-400 border border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  return (
    <div id="admin-tickets-panel-wrapper" className="space-y-6">
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>الطلبات المعلقة للرد</span>
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{pendingCount}</div>
          <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• تتطلب مراجعة أو قرار مالي فوري</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>قيد المعالجة حالياً</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{progressCount}</div>
          <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• جاري العمل عليها من الإدارة</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>طلبات السحب المالي</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{financialCount}</div>
          <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• سحوبات فودافون كاش / بنكية</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800/80 shadow-lg'}`}>
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 mb-1">
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>إجمالي الطلبات المنفذة</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{resolvedCount}</div>
          <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• تم تسليمها بنجاح للأساتذة</p>
        </div>

      </div>

      {/* Filter Options */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Filter className="w-4 h-4 text-cyan-500" />
          <span className={`text-xs font-black ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>أدوات الفلترة والفرز السريع:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <option value="all">كل الحالات ({tickets.length})</option>
              <option value="pending">قيد المراجعة والمعلقة ({pendingCount})</option>
              <option value="in_progress">تحت المعالجة ({progressCount})</option>
              <option value="resolved">تم التنفيذ والحل ({resolvedCount})</option>
              <option value="rejected">تم الرفض والاعتذار ({tickets.filter(t => t.status === 'rejected').length})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <option value="all">كل تصنيفات الطلبات ({tickets.length})</option>
              <option value="financial_withdrawal">💰 طلبات السحب المالي والعمولات</option>
              <option value="server_upgrade">🚀 طلبات زيادة السيرفر والطلاب</option>
              <option value="student_issue">👥 مشاكل حسابات الطلاب</option>
              <option value="technical_bug">⚠️ البلاغات والأعطال الفنية</option>
              <option value="feature_request">🛠️ طلبات ميزات مخصصة للمنصة</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <option value="all">كل مستويات الأهمية ({tickets.length})</option>
              <option value="high">عاجلة جداً 🔥 ({tickets.filter(t => t.severity === 'high').length})</option>
              <option value="medium">متوسطة الأهمية ⚠️ ({tickets.filter(t => t.severity === 'medium').length})</option>
              <option value="low">عادية / منخفضة 🟢 ({tickets.filter(t => t.severity === 'low').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Database Table / List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className={`p-12 rounded-3xl border text-center space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'
          }`}>
            <Inbox className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>لا توجد أي تذاكر مطابقة للفلاتر المحددة</h4>
            <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              جميع طلبات الدعم المالي والترقيات للمدرسين مستقرة وتمت معالجتها بنجاح!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => {
              const isHigh = ticket.severity === 'high';
              const isMedium = ticket.severity === 'medium';
              const isReplying = replyingTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className={`p-6 rounded-3xl border transition-all shadow-md relative overflow-hidden ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  {/* Left severity indicator */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 right-auto w-1.5 ${
                      isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />

                  <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="space-y-3 w-full">
                      
                      {/* Meta info header */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${getCategoryColorClass(ticket.category)}`}>
                          {getCategoryLabel(ticket.category)}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black ${
                          isHigh
                            ? isLight ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : isMedium
                            ? isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            : isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}>
                          أهمية: {ticket.severity === 'high' ? 'عاجلة 🔥' : ticket.severity === 'medium' ? 'متوسطة ⚠️' : 'عادية 🟢'}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {ticket.id}
                        </span>

                        <span className={`text-[11px] font-black mr-auto ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                          👤 {ticket.teacherName} • منصة {ticket.platformName}
                        </span>
                      </div>

                      {/* Ticket Title */}
                      <h4 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {ticket.title}
                      </h4>

                      {/* Message Content */}
                      <p className={`text-xs leading-relaxed font-medium p-4 rounded-2xl border whitespace-pre-line ${
                        isLight 
                          ? 'bg-slate-50 text-slate-700 border-slate-200' 
                          : 'bg-slate-950/80 text-slate-300 border border-slate-800'
                      }`}>
                        {ticket.message}
                      </p>

                      {/* Attachment Link */}
                      {ticket.attachmentUrl && (
                        <div className="flex items-center gap-2">
                          <a
                            href={ticket.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl border transition-colors ${
                              isLight 
                                ? 'text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100' 
                                : 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border-cyan-800/40'
                            }`}
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>عرض المرفق / المستندات المسلمة من المدرس</span>
                          </a>
                        </div>
                      )}

                      {/* Current response details if resolved/progress */}
                      {ticket.adminResponse ? (
                        <div className={`mt-4 p-4 rounded-2xl border space-y-1.5 ${
                          isLight ? 'bg-cyan-50/70 border-cyan-200' : 'bg-cyan-950/30 border-cyan-800/50'
                        }`}>
                          <div className="flex items-center justify-between text-[11px] font-black text-cyan-600 dark:text-cyan-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4 text-cyan-500" />
                              الرد الرسمي الصادر من الإدارة العليا للسيادة (SEA):
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(ticket.updatedAt).toLocaleDateString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className={`text-xs pr-2 border-r-2 border-cyan-500 font-bold leading-relaxed whitespace-pre-line ${
                            isLight ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {ticket.adminResponse}
                          </p>
                        </div>
                      ) : (
                        <div className={`mt-2 p-3 rounded-xl border text-[11px] font-black flex items-center gap-1.5 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>بانتظار مراجعة الإدارة والرد بقرار أو تفاصيل التنفيذ.</span>
                        </div>
                      )}

                      {/* Replying Action Form */}
                      {isReplying && (
                        <div className={`mt-4 p-5 rounded-2xl border space-y-4 animate-fade-in ${
                          isLight ? 'bg-slate-50 border-cyan-300 shadow-sm' : 'bg-slate-950 border-cyan-500/30'
                        }`}>
                          <div className={`border-b pb-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                            <h5 className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                              صياغة القرار الرسمي والرد المباشر للمدرس
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                                تحديد القرار الإداري / الحالة
                              </label>
                              <select
                                value={targetStatus}
                                onChange={(e) => setTargetStatus(e.target.value as SupportTicket['status'])}
                                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-cyan-500 ${
                                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                                }`}
                              >
                                <option value="resolved">🟢 تم التنفيذ والحل بنجاح (Resolved)</option>
                                <option value="in_progress">🔵 قيد العمل والمعالجة (In Progress)</option>
                                <option value="rejected">🔴 اعتذار أو رفض الطلب (Rejected)</option>
                                <option value="pending">🟡 إبقاء قيد الدراسة (Pending)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                              محتوى الرد أو تفاصيل التحويل المالي (مثال: تم إرسال 5000ج لرقم فودافون كاش الخاص بك، رقم العملية...)
                            </label>
                            <textarea
                              required
                              rows={3}
                              placeholder="اكتب هنا نص الرد المكتمل والمفهوم للمدرس..."
                              value={adminResponseText}
                              onChange={(e) => setAdminResponseText(e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed focus:border-cyan-500 focus:outline-none ${
                                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                              }`}
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTicketId(null);
                                setAdminResponseText('');
                              }}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                                isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(ticket.id)}
                              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-md"
                            >
                              اعتماد الرد والقرار فوراً 💾
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Status Badge & Actions column on the left (since Arabic) */}
                    <div className={`flex sm:flex-row lg:flex-col items-end lg:items-start justify-between lg:justify-start gap-4 shrink-0 w-full lg:w-fit border-t lg:border-t-0 lg:border-r pt-4 lg:pt-0 lg:pr-4 ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      
                      <div className="space-y-1 text-right lg:text-left">
                        <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>حالة الطلب الحالية</span>
                        <div>
                          {ticket.status === 'pending' && (
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-black inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> معلق 🟡
                            </span>
                          )}
                          {ticket.status === 'in_progress' && (
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[11px] font-black inline-flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> تحت المعالجة 🔵
                            </span>
                          )}
                          {ticket.status === 'resolved' && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-black inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> تم تنفيذه 🟢
                            </span>
                          )}
                          {ticket.status === 'rejected' && (
                            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-black inline-flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> مرفوض 🔴
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 block">
                        تاريخ التذكرة: {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-auto">
                        {!isReplying && (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTicketId(ticket.id);
                              setAdminResponseText(ticket.adminResponse || '');
                              setTargetStatus(ticket.status === 'pending' ? 'resolved' : ticket.status);
                            }}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>الرد واتخاذ الإجراء</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('هل تريد حذف هذه التذكرة نهائياً من سجلات الإدارة؟')) {
                              deleteSupportTicket(ticket.id);
                            }
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isLight 
                              ? 'bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border-slate-200' 
                              : 'bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border-slate-800'
                          }`}
                          title="حذف السجل نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
