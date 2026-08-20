const fs = require('fs');
const content = fs.readFileSync('src/components/PlatformDetail.tsx', 'utf8');

const badPartRegex = /<h2 className=\{`text-2xl font-black \$\{isLight \? 'text-slate-900' : 'text-white'\}`\}>\s*الكورسات والمناهج المتاحة \(\{platformCourses\.length\}\)\s*<\/h2>[\s\S]*?<\/button>\s*\}\)\s*<\/div>\s*<\/div>\s*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/;

const newPart = `<h2 className={\`text-2xl font-black \${isLight ? 'text-slate-900' : 'text-white'}\`}>
              الكورسات والمناهج المتاحة ({platformCourses.length})
            </h2>
            <p className={\`text-xs mt-1 \${isLight ? 'text-slate-500' : 'text-slate-400'}\`}>
              اختر الكورس المناسب لسنتك الدراسية وابدأ المشاهدة والحل فوراً
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'teacher' && (
              <button
                type="button"
                onClick={() => setIsCreateCourseModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إنشاء كورس جديد في هذه المنصة</span>
              </button>
            )}
            {currentUser?.role === 'teacher' && (
              <button
                type="button"
                onClick={() => setCurrentView('teacher_dashboard')}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>لوحة تحكم المعلم</span>
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;

const fixed = content.replace(badPartRegex, newPart);
fs.writeFileSync('src/components/PlatformDetail.tsx', fixed);
console.log('Fixed PlatformDetail.tsx');
