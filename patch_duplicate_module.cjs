const fs = require('fs');
const path = require('path');

function patchFile(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  
  // Add state for module selection if missing
  if (!code.includes('const [duplicateTargetModuleId, setDuplicateTargetModuleId]')) {
    code = code.replace(
      'const [duplicateTargetCourseId, setDuplicateTargetCourseId] = useState<string>(course.id);',
      'const [duplicateTargetCourseId, setDuplicateTargetCourseId] = useState<string>(course.id);\n  const [duplicateTargetModuleId, setDuplicateTargetModuleId] = useState<string>("");'
    );
  }

  // Update duplicate function to use the moduleId
  if (filename.includes('AssignmentsManager')) {
    code = code.replace(
      'courseId: duplicateTargetCourseId,',
      'courseId: duplicateTargetCourseId,\n      moduleId: duplicateTargetModuleId || undefined,'
    );
  } else if (filename.includes('CourseExamsTab')) {
    code = code.replace(
      'courseId: duplicateTargetCourseId,',
      'courseId: duplicateTargetCourseId,\n      moduleId: duplicateTargetModuleId || undefined,'
    );
  }

  // Update JSX to include Module Select
  const moduleSelectJSX = `
            <label className="block text-xs font-bold mb-2 mt-4 dark:text-slate-300">الوحدة الدراسية (اختياري)</label>
            <select
              value={duplicateTargetModuleId}
              onChange={(e) => setDuplicateTargetModuleId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- بدون وحدة (عام للكورس) --</option>
              {courses.find(c => c.id === duplicateTargetCourseId)?.modules?.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
  `;

  if (!code.includes('الوحدة الدراسية (اختياري)')) {
    code = code.replace(
      '</select>',
      '</select>\n' + moduleSelectJSX
    );
  }

  fs.writeFileSync(filename, code);
}

patchFile(path.join(__dirname, 'src/components/teacher/AssignmentsManager.tsx'));
patchFile(path.join(__dirname, 'src/components/teacher/CourseExamsTab.tsx'));

