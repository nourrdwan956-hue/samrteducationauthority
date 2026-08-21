const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/teacher/AssignmentsManager.tsx');
let code = fs.readFileSync(file, 'utf8');

// 1. Add `courses` to useApp()
code = code.replace(
  '    addToast,\n  } = useApp();',
  '    addToast,\n    courses,\n  } = useApp();'
);

// 2. Add state for Duplicate Modal
code = code.replace(
  'const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);',
  'const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);\n  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);\n  const [duplicateTargetAssignment, setDuplicateTargetAssignment] = useState<Assignment | null>(null);\n  const [duplicateTargetCourseId, setDuplicateTargetCourseId] = useState<string>(course.id);'
);

// 3. Add `handleDuplicate` function right before `const handleCreateOrUpdate =`
const duplicateFunc = `
  const handleDuplicate = () => {
    if (!duplicateTargetAssignment || !duplicateTargetCourseId) return;
    const newAssignment = {
      ...duplicateTargetAssignment,
      id: crypto.randomUUID(),
      courseId: duplicateTargetCourseId,
      title: duplicateTargetAssignment.title + ' (نسخة)',
      createdAt: new Date().toISOString(),
      status: 'draft' as const,
      isPublished: false,
      questions: duplicateTargetAssignment.questions.map(q => ({
        ...q,
        id: crypto.randomUUID(),
        examId: '' // We don't use examId for assignments, but just in case
      }))
    };
    createAssignment(newAssignment);
    setIsDuplicateModalOpen(false);
    setDuplicateTargetAssignment(null);
    addToast('تم استنساخ التكليف بنجاح!', 'success');
  };
`;
code = code.replace(
  'const handleCreateOrUpdate =',
  duplicateFunc + '\n  const handleCreateOrUpdate ='
);

// 4. Add the duplicate icon to the assignment card (next to Edit)
const copyButton = `
                      <button
                        type="button"
                        onClick={() => {
                          setDuplicateTargetAssignment(assignment);
                          setDuplicateTargetCourseId(course.id);
                          setIsDuplicateModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                        title="نسخ / استنساخ الواجب"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
`;
code = code.replace(
  '<Edit className="w-4 h-4" />\n                      </button>',
  '<Edit className="w-4 h-4" />\n                      </button>' + copyButton
);

// 5. Add the Duplicate Modal to the JSX
const duplicateModalJSX = `
      {/* Modal: Duplicate Assignment */}
      {isDuplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-black mb-4 dark:text-white">استنساخ التكليف</h3>
            <p className="text-sm text-slate-500 mb-4">اختر الكورس الذي تريد نسخ هذا الواجب إليه. سيتم إنشاء نسخة جديدة بالكامل دون التأثير على الواجب الأصلي.</p>
            
            <label className="block text-xs font-bold mb-2 dark:text-slate-300">الكورس الوجهة</label>
            <select
              value={duplicateTargetCourseId}
              onChange={(e) => setDuplicateTargetCourseId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-cyan-500"
            >
              {courses.filter(c => c.platformId === course.platformId).map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setIsDuplicateModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleDuplicate}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20"
              >
                تأكيد النسخ
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{/* Modal: Create/Edit Specialized Assignment */}',
  duplicateModalJSX + '\n\n      {/* Modal: Create/Edit Specialized Assignment */}'
);

// We need to also import Layers if not already imported
// It's already in the lucide-react import

fs.writeFileSync(file, code);
