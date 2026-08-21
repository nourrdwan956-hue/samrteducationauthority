const fs = require('fs');

let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

code = code.replace("import {", "import { CheckCircle, CheckSquare, AlignLeft, ArrowUpDown, Headphones,");

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
