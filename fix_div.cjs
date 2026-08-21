const fs = require('fs');
let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

code = code.replace("            {/* Modal Sticky Footer */}", "              </div>\n            {/* Modal Sticky Footer */}");

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
