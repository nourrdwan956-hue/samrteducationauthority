const fs = require('fs');
let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

const str = `                      <button
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
                      
console.log(code.includes(str));
