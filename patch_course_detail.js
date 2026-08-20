const fs = require('fs');
const file = 'src/components/CourseDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{currentCourse.originalPrice || currentCourse.price} ج.م',
  '{currentCourse.price} ج.م'
).replace(
  '{currentCourse.price} ج.م\n                  </span>\n                )}',
  '{currentCourse.originalPrice} ج.م\n                  </span>\n                )}'
);

fs.writeFileSync(file, content);
