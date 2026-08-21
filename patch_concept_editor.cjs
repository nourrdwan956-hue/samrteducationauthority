const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/teacher/AssignmentsManager.tsx');
let code = fs.readFileSync(file, 'utf8');

const oldConceptSheetSection = `
                        <textarea
                          rows={4}
                          value={formConceptSheetContent}
                          onChange={(e) => setFormConceptSheetContent(e.target.value)}
                          placeholder="اكتب هنا القواعد، المعادلات، أو الملاحظات التي ستكون متاحة للطالب للاطلاع عليها أثناء الحل..."
                          className="w-full p-3 font-mono text-xs rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />`;

const newConceptSheetSection = `
                        <div className="relative rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-700/50 shadow-inner bg-amber-50/50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                          {/* Top toolbar simulator */}
                          <div className="flex items-center gap-2 p-2 border-b border-amber-200 dark:border-amber-800/50 bg-amber-100/50 dark:bg-slate-800/80">
                            <button type="button" className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400" title="خط عريض"><strong className="font-serif px-1">B</strong></button>
                            <button type="button" className="p-1.5 rounded-lg hover:bg-amber-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-400" title="قائمة نقطية"><span className="font-serif px-1">•</span></button>
                            <span className="h-4 w-px bg-amber-300 dark:bg-amber-700 mx-1"></span>
                            <span className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70">محرر ورقة المفاهيم الذكي</span>
                          </div>
                          <textarea
                            rows={8}
                            value={formConceptSheetContent}
                            onChange={(e) => setFormConceptSheetContent(e.target.value)}
                            placeholder="اكتب هنا القواعد، المعادلات، أو الملاحظات التي ستكون متاحة للطالب للاطلاع عليها أثناء الحل..."
                            className="w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-amber-950 dark:text-amber-100 focus:outline-none resize-y"
                            style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(245, 158, 11, 0.1) 31px, rgba(245, 158, 11, 0.1) 32px)', lineHeight: '32px' }}
                          />
                        </div>`;

code = code.replace(oldConceptSheetSection, newConceptSheetSection);
fs.writeFileSync(file, code);
