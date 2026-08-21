const fs = require('fs');
const path = require('path');
const ceFile = path.join(__dirname, 'src/components/teacher/CourseExamsTab.tsx');
let ceCode = fs.readFileSync(ceFile, 'utf8');

const badChunk = `            <label className="block text-xs font-bold mb-2 mt-4 dark:text-slate-300">الوحدة الدراسية (اختياري)</label>
            <select
              value={duplicateTargetModuleId}
              onChange={(e) => setDuplicateTargetModuleId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- بدون وحدة (عام للكورس) --</option>
              {courses.find(c => c.id === duplicateTargetCourseId)?.modules?.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>`;

ceCode = ceCode.replace(badChunk, '');
fs.writeFileSync(ceFile, ceCode);
