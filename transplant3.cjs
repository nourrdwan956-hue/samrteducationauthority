const fs = require('fs');
let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');
const examCode = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');

const getBlock = (code, startStr, endStr) => {
  const start = code.indexOf(startStr);
  if (start === -1) return null;
  const end = code.indexOf(endStr, start);
  if (end === -1) return null;
  return code.substring(start, end);
};

// Replace imports
code = code.replace('import { Assignment, AssignmentSubmission, Course, Question } from \'../../types\';', 'import { Assignment, AssignmentSubmission, Course, Question, QuestionType, MatchingPair, PassageSubQuestion } from \'../../types\';');

// Add QUESTION_TYPES
const qt = getBlock(examCode, 'const QUESTION_TYPES', '];') + '];\n';
if (!code.includes('const QUESTION_TYPES')) {
    code = code.replace('export const AssignmentsManager', qt + '\nexport const AssignmentsManager');
}

// Add state & helpers
const helpersStart = examCode.indexOf('  const handleAddQuestion =');
const helpersEnd = examCode.indexOf('  const handleSaveExamSubmit =');
const helpers = examCode.substring(helpersStart, helpersEnd);

const oldState = '  const [formSelectedBankQuestionIds, setFormSelectedBankQuestionIds] = useState<string[]>([]);';
const newState = `  const [questions, setQuestions] = useState<Question[]>([]);\n${helpers}`;
code = code.replace(oldState, newState);

// Update openCreateModal
code = code.replace('setFormSelectedBankQuestionIds([]);', 'setQuestions(existing.questions || []);');
code = code.replace('setFormSelectedBankQuestionIds(bankQuestions.slice(0, 3).map((q) => q.id));', 'setQuestions([]);');

// Replace handleSaveAssignment prep
const prepStart = '    // Prepare questions';
const prepEnd = '    let newStatus = formStatus;';
const prepBlock = getBlock(code, prepStart, prepEnd);
if (prepBlock) {
    code = code.replace(prepBlock, '    let questionsForAssignment: Question[] = questions;\n\n');
}

// Replace UI
const uiStart = '{/* Questions from Bank Selector */}';
const uiEnd = '{/* Modal Sticky Footer */}';
const uiBlock = getBlock(code, uiStart, uiEnd);

const qbStart = '{/* Questions Section */}';
const qbEnd = '              {/* Submit & Quick Bar */}';
let newUi = getBlock(examCode, qbStart, qbEnd);
newUi += `              {/* Submit & Quick Bar */}
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
              </div>
`;

if (uiBlock && newUi) {
    code = code.replace(uiBlock, newUi);
} else {
    console.log("UI block mismatch");
}

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
console.log("Done");
