const fs = require('fs');
let bg = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx.bak', 'utf8');
fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', bg);
