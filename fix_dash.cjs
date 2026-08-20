const fs = require('fs');
const file = 'src/components/TeacherDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">\n                            {course.price} ج.م\n                          </span>',
  '<div className="flex flex-col items-end gap-1">\n                            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">\n                              {course.price} ج.م\n                            </span>\n                            {course.originalPrice && (\n                              <span className="text-[10px] line-through text-slate-400 font-bold ml-1">\n                                {course.originalPrice} ج.م\n                              </span>\n                            )}\n                          </div>'
);

fs.writeFileSync(file, content);
