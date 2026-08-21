const fs = require('fs');

const examCode = fs.readFileSync('src/components/teacher/CourseExamsTab.tsx', 'utf8');
let assignCode = fs.readFileSync('src/components/teacher/AssignmentsManager.tsx', 'utf8');

const getBlock = (code, startStr, endStr) => {
  const start = code.indexOf(startStr);
  if (start === -1) return null;
  const end = code.indexOf(endStr, start);
  if (end === -1) return null;
  return code.substring(start, end);
};

const questionTypes = getBlock(examCode, 'const QUESTION_TYPES', '];') + '];\n';
const questionBuilder = getBlock(examCode, '{/* Questions Section */}', '{/* Modal Sticky Footer */}');
const handleAdd = getBlock(examCode, 'const handleAddQuestion', 'const handleRemoveQuestion = (idx: number) => {');
const handleRemove = 'const handleRemoveQuestion = (idx: number) => {\n    setQuestions(questions.filter((_, i) => i !== idx));\n  };\n';

// Modify AssignCode
// Add types
assignCode = assignCode.replace('import { Assignment, AssignmentSubmission, Course, Question }', 'import { Assignment, AssignmentSubmission, Course, Question, QuestionType, MatchingPair, PassageSubQuestion }');

if (!assignCode.includes('const QUESTION_TYPES')) {
  assignCode = assignCode.replace('export const AssignmentsManager', questionTypes + '\nexport const AssignmentsManager');
}

// Add state
const oldState = "const [formSelectedBankQuestionIds, setFormSelectedBankQuestionIds] = useState<string[]>([]);";
const newState = `const [questions, setQuestions] = useState<Question[]>([]);\n  ${handleAdd}\n  ${handleRemove}`;
if(assignCode.includes(oldState)) {
  assignCode = assignCode.replace(oldState, newState);
}

// openCreateModal
assignCode = assignCode.replace('setFormSelectedBankQuestionIds([]);', 'setQuestions(existing.questions || []);');
assignCode = assignCode.replace('setFormSelectedBankQuestionIds(bankQuestions.slice(0, 3).map((q) => q.id));', 'setQuestions([]);');

// handleSaveAssignment questions
const oldQuestionsPrepare = `    // Prepare questions
    let questionsForAssignment: Question[] = [];
    if (editingAssignment && editingAssignment.questions.length > 0 && formSelectedBankQuestionIds.length === 0) {
      questionsForAssignment = editingAssignment.questions;
    } else if (formSelectedBankQuestionIds.length > 0) {
      const selectedBankQs = bankQuestions.filter((bq) => formSelectedBankQuestionIds.includes(bq.id));
      questionsForAssignment = selectedBankQs.map((bq, idx) => ({
        id: \`as_q_\${Date.now()}_\${idx}\`,
        examId: 'assignment_temp',
        type: bq.type,
        prompt: bq.prompt,
        options: bq.options,
        correctOptionIndex: bq.correctOptionIndex,
        correctBool: bq.correctBool,
        fillBlankAnswers: bq.fillBlankAnswers,
        sampleAnswer: bq.sampleAnswer,
        sentenceWithMistake: bq.sentenceWithMistake,
        targetMistake: bq.targetMistake,
        correction: bq.correction,
        hint: bq.hint,
        explanation: bq.explanation,
        points: bq.points || 2,
        allowHint: true,
      }));
    } else if (editingAssignment?.questions) {
      questionsForAssignment = editingAssignment.questions;
    } else {
      // Fallback sample question
      questionsForAssignment = [
        {
          id: \`as_q_\${Date.now()}_1\`,
          examId: 'assignment_temp',
          type: 'mcq',
          prompt: 'If you ________ harder in your previous semester, you would have passed with distinction.',
          options: ['had studied', 'studied', 'study', 'have studied'],
          correctOptionIndex: 0,
          points: 2,
          explanation: 'الحالة الشرطية الثالثة: If + had + p.p -> would have + p.p',
          allowHint: true,
        },
      ];
    }`;
const newQuestionsPrepare = "    let questionsForAssignment: Question[] = questions;";
if(assignCode.includes(oldQuestionsPrepare)) {
  assignCode = assignCode.replace(oldQuestionsPrepare, newQuestionsPrepare);
}

// Modal HTML
const oldModalHTML = getBlock(assignCode, '{/* Questions from Bank Selector */}', '{/* Modal Sticky Footer */}');
if (oldModalHTML) {
  assignCode = assignCode.replace(oldModalHTML, questionBuilder);
}

fs.writeFileSync('src/components/teacher/AssignmentsManager.tsx', assignCode);
