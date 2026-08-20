const fs = require('fs');
const file = 'src/components/teacher/CreateCourseModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state for hasDiscount
content = content.replace(
  'const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);',
  'const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);\n  const [hasDiscount, setHasDiscount] = useState<boolean>(false);'
);

// 2. Modify handleSubmit to respect hasDiscount
content = content.replace(
  'originalPrice: isFree ? undefined : originalPrice ? Number(originalPrice) : undefined,',
  'originalPrice: isFree ? undefined : (hasDiscount && originalPrice ? Number(originalPrice) : undefined),'
);

// 3. Update the UI for the original price input to include a toggle and luxury design
const oldUI = `              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>السعر قبل الخصم (اختياري للشطب)</span>
                  {isFree && (
                    <span className="text-[10px] text-slate-500">معطل</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isFree}
                    value={isFree ? '' : originalPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Math.max(0, parseInt(e.target.value, 10) || 0) : undefined;
                      setOriginalPrice(val);
                    }}
                    placeholder="مثال: 350"
                    className={\`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all \${
                      isFree
                        ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-300 focus:border-cyan-500 focus:outline-none'
                    }\`}
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
              </div>`;

const newUI = `              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>السعر قبل الخصم (للشطب)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">تفعيل الخصم</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isFree) setHasDiscount(!hasDiscount);
                      }}
                      className={\`w-8 h-4 rounded-full flex items-center transition-colors \${
                        hasDiscount && !isFree ? 'bg-cyan-500' : 'bg-slate-700'
                      } \${isFree ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`}
                    >
                      <div className={\`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform \${
                        hasDiscount && !isFree ? '-translate-x-1' : '-translate-x-4'
                      }\`} />
                    </button>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={isFree || !hasDiscount}
                    value={isFree || !hasDiscount ? '' : originalPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Math.max(0, parseInt(e.target.value, 10) || 0) : undefined;
                      setOriginalPrice(val);
                    }}
                    placeholder={hasDiscount ? "مثال: 350" : "الخصم غير مفعل"}
                    className={\`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all \${
                      isFree || !hasDiscount
                        ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-700 text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none'
                    }\`}
                  />
                  <span className={\`absolute left-3 top-2.5 text-xs font-bold \${isFree || !hasDiscount ? 'text-slate-600' : 'text-slate-400'}\`}>
                    ج.م
                  </span>
                </div>
              </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(file, content);
