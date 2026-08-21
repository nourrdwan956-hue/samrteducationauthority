const fs = require('fs');

let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

// The file has multiple insertions of `{/* Questions Section */}` ... `              {/* Submit & Quick Bar */}`
// First, let's find the first instance of `{/* Questions Section */}` and the last instance of `              {/* Submit & Quick Bar */}`
const startToken = '{/* Questions Section */}';
const endToken = '            {/* Modal Sticky Footer */}';

const firstStart = code.indexOf(startToken);
const lastEnd = code.lastIndexOf(endToken);

if (firstStart !== -1 && lastEnd !== -1) {
  const before = code.substring(0, firstStart);
  const after = code.substring(lastEnd);
  
  // Now we need the proper question builder.
  // We'll read it from CourseExamsTab.tsx
  const examCode = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');
  const qbStart = examCode.indexOf('{/* Questions Section */}');
  const qbEnd = examCode.indexOf('{/* Submit & Quick Bar */}', qbStart);
  let qb = examCode.substring(qbStart, qbEnd);
  
  // We also need the helper functions!
  const helpersStart = examCode.indexOf('const handleMoveQuestionUp =');
  const helpersEnd = examCode.indexOf('const handleSaveExamSubmit =');
  const helpers = examCode.substring(helpersStart, helpersEnd);
  
  // Insert helpers before `return (` in before block
  let finalBefore = before;
  const returnIndex = finalBefore.lastIndexOf('  return (');
  if (returnIndex !== -1) {
    finalBefore = finalBefore.substring(0, returnIndex) + helpers + '\n' + finalBefore.substring(returnIndex);
  }
  
  const finalCode = finalBefore + qb + "              </div>\n" + after;
  fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', finalCode);
  console.log("Fixed!");
} else {
  console.log("Could not find tokens");
}

