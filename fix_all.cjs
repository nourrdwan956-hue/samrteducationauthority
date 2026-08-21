const fs = require('fs');
const examCode = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');

const getBlock = (code, startStr, endStr) => {
  const start = code.indexOf(startStr);
  if (start === -1) return null;
  const end = code.indexOf(endStr, start);
  if (end === -1) return null;
  return code.substring(start, end);
};

const qb = getBlock(examCode, '{/* Questions Section */}', '              {/* Submit & Quick Bar */}');
let assignCode = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');
assignCode = assignCode.replace("            {/* Modal Sticky Footer */}", qb + "\n            {/* Modal Sticky Footer */}");
fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', assignCode);
