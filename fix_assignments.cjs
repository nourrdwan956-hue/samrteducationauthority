const fs = require('fs');

let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

// I also need to make sure the publish unpublish logic exists.
// Let's add a toggle button to the Assignment Card.
const cardFooterAction = `                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الواجب؟')) {
                            deleteAssignment(assignment.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="حذف الواجب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>`;
const newCardFooterAction = cardFooterAction + `
                      <button
                        type="button"
                        onClick={() => {
                           updateAssignment(assignment.id, { isPublished: !assignment.isPublished, status: assignment.isPublished ? 'draft' : 'published' });
                        }}
                        className={\`p-2 rounded-xl transition-colors cursor-pointer \${assignment.isPublished ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-600 dark:text-teal-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'}\`}
                        title={assignment.isPublished ? "إلغاء النشر" : "نشر الواجب"}
                      >
                        {assignment.isPublished ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                      </button>`;

if (code.includes(cardFooterAction)) {
   code = code.replace(cardFooterAction, newCardFooterAction);
}

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
