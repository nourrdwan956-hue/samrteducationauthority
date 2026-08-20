const fs = require('fs');
const file = 'src/components/PlatformDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<span className="text-lg font-black text-emerald-600 dark:text-emerald-400">\n                          {course.originalPrice || course.price} ج.م\n                        </span>',
  '<div className="flex items-baseline gap-1.5">\n                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">\n                            {course.price} ج.م\n                          </span>\n                          {course.originalPrice && (\n                            <span className="text-xs line-through text-slate-400 font-bold">\n                              {course.originalPrice} ج.م\n                            </span>\n                          )}\n                        </div>'
);

fs.writeFileSync(file, content);
