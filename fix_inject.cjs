const fs = require('fs');

let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');
let qb = fs.readFileSync('patch_qb.txt', 'utf8');

// I need to find "{/* Modal Sticky Footer */}" and insert `qb` before it.
// Also, I need to make sure the closing tag is matched perfectly.

if (code.includes("{/* Modal Sticky Footer */}")) {
  code = code.replace("            {/* Modal Sticky Footer */}", qb + "\n            {/* Modal Sticky Footer */}");
  fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
  console.log("Injected");
} else {
  console.log("Not found");
}

