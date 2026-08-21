const fs = require('fs');
let assignCode = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

// The original file is pristine again? No, there is no .git
console.log(assignCode.length);
