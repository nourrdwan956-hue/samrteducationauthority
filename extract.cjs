const fs = require('fs');

const code = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');

const getBlock = (startString, endString) => {
  const startIndex = code.indexOf(startString);
  const endIndex = code.indexOf(endString, startIndex);
  return code.substring(startIndex, endIndex);
};

const handleAddQuestionStr = getBlock('const handleAddQuestion = (type: QuestionType', 'const handleRemoveQuestion = (idx: number)');
const handleRemoveQuestionStr = getBlock('const handleRemoveQuestion = (idx: number)', 'const handleSaveExam =');

console.log("=== Add ===");
console.log(handleAddQuestionStr);
console.log("=== Remove ===");
console.log(handleRemoveQuestionStr);
