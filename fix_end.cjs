const fs = require('fs');

let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

const str = `              {/* Submit & Quick Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 px-2 z-20">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black">
                    إجمالي الأسئلة: {questions.length}
                  </span>
                  <select
                    onChange={(e) => {
                      handleAddQuestion(e.target.value as QuestionType);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md focus:outline-none"
                  >
                    <option value="" disabled>+ إضافة سؤال فوري...</option>
                    {QUESTION_TYPES.map((qt) => (
                      <option key={qt.type} value={qt.type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        + {qt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>`;

code = code.replace('            {/* Modal Sticky Footer */}', str + '\n            {/* Modal Sticky Footer */}');

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
