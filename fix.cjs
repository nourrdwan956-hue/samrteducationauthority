const fs = require('fs');
const file = 'src/components/CourseDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">\n                  {currentCourse.originalPrice} ج.م\n                </span>',
  '<span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">\n                  {currentCourse.price} ج.م\n                </span>'
);

fs.writeFileSync(file, content);
