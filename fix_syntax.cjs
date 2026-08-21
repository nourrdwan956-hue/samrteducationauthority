const fs = require('fs');
let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

// There are multiple `<form onSubmit={handleSaveAssignment}` elements? Let's check!
let formCount = (code.match(/<form onSubmit=\{handleSaveAssignment/g) || []).length;
console.log("Forms count: " + formCount);
