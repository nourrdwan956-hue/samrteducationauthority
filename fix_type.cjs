const fs = require('fs');
let code = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

const importStr = "import { Assignment, AssignmentSubmission, Course, Question } from '../../types';";
const newImportStr = "import { Assignment, AssignmentSubmission, Course, Question, QuestionType, MatchingPair, PassageSubQuestion } from '../../types';";
code = code.replace(importStr, newImportStr);

const examCode = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');
const qtStart = examCode.indexOf('const QUESTION_TYPES');
const qtEnd = examCode.indexOf('];', qtStart) + 2;
const qt = examCode.substring(qtStart, qtEnd);

code = code.replace("export const AssignmentsManager", qt + "\n\nexport const AssignmentsManager");

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', code);
