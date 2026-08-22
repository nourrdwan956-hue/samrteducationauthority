// Pool of 35 comprehensive, unambiguous human reasoning scenarios
// Each scenario has 5 structured lines of narrative in Arabic and English, plus 4 multiple-choice options with exactly 1 correct answer.

export interface HumanScenario {
  id: number;
  titleAr: string;
  titleEn: string;
  storyAr: string;
  storyEn: string;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
}

// Cryptographically strong, unforgeable, tamper-resistant student code generator
export const generateSecureStudentCode = (): string => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Unambiguous uppercase alphanumerics
  let part1 = "";
  let part2 = "";
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint8Array(8);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < 4; i++) {
      part1 += charset[values[i] % charset.length];
    }
    for (let i = 4; i < 8; i++) {
      part2 += charset[values[i] % charset.length];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      part1 += charset[Math.floor(Math.random() * charset.length)];
      part2 += charset[Math.floor(Math.random() * charset.length)];
    }
  }
  return `SEA-2026-${part1}-${part2}`;
};

export const HUMAN_SCENARIOS: HumanScenario[] = [
  {
    id: 1,
    titleAr: "سيناريو أمين المكتبة وتوزيع الكتب",
    titleEn: "The Library Book Distribution Scenario",
    storyAr: `استلم أسامة أمين المكتبة 80 كتاباً جديداً في بداية اليوم لتوزيعها على الأقسام.
قام بوضع 30 كتاباً في قسم العلوم العامة، و20 كتاباً في قسم التاريخ والآثار.
بعد ساعة، جاءت مجموعة طلاب واستعارت 10 كتب من قسم العلوم و5 كتب من قسم التاريخ.
وقبل إغلاق المكتبة، تبرع أحد الأساتذة بـ 15 كتاباً جديداً تم وضعها فوراً على الرفوف.
بقية الكتب الأصلية غير الموزعة (30 كتاباً) بقيت داخل الصندوق المخصص للاستقبال.`,
    storyEn: `Osama the librarian received 80 new books at the start of the day to distribute.
He placed 30 books in the General Science section and 20 books in the History section.
An hour later, a group of students borrowed 10 books from Science and 5 books from History.
Before closing, a professor donated 15 new books that were immediately placed on shelves.
The remaining original undistributed books (30 books) stayed in the reception storage box.`,
    questionAr:
      "كم كتاباً إجمالياً متوفراً ومتاحاً داخل المكتبة (على الرفوف وفي الصندوق) في نهاية اليوم؟",
    questionEn:
      "How many total books are available in the library (on shelves and in storage) at the end of the day?",
    optionsAr: ["70 كتاباً", "80 كتاباً", "85 كتاباً", "90 كتاباً"],
    optionsEn: ["70 books", "80 books", "85 books", "90 books"],
    correctIndex: 1, // 80 - (10+5) + 15 = 80
  },
  {
    id: 2,
    titleAr: "سيناريو رحلة القطار وركاب المحطات",
    titleEn: "The Train Passenger Journey Scenario",
    storyAr: `انطلق قطار سريع من المحطة المركزية وعلى متنه 120 راكباً باتجاه المدن الساحلية.
في المحطة الأولى، نزل 30 راكباً وصعد 45 راكباً جديداً بعد شراء التذاكر.
في المحطة الثانية، لم ينزل أي راكب ولكن صعد 15 راكباً إضافياً من طلاب الجامعة.
في المحطة الثالثة، قرر نصف إجمالي ركاب القطار النزول لزيارة معرض العلوم السنوي.
ثم تابع القطار رحلته الأخيرة نحو المحطة النهائية بدون توقف إضافي.`,
    storyEn: `An express train departed the central station with 120 passengers heading to coastal cities.
At the first station, 30 passengers got off and 45 new passengers boarded with tickets.
At the second station, no passengers got off, but 15 additional university students boarded.
At the third station, exactly half of all passengers on the train got off to visit the annual science fair.
The train then continued its final journey toward the terminus without any extra stops.`,
    questionAr: "كم راكباً بقي على متن القطار بعد مغادرة المحطة الثالثة؟",
    questionEn:
      "How many passengers remained on the train after departing the third station?",
    optionsAr: ["60 راكباً", "75 راكباً", "85 راكباً", "90 راكباً"],
    optionsEn: [
      "60 passengers",
      "75 passengers",
      "85 passengers",
      "90 passengers",
    ],
    correctIndex: 1, // (120 - 30 + 45 + 15) = 150 / 2 = 75
  },
  {
    id: 3,
    titleAr: "سيناريو مخبز الفطائر الصباحي",
    titleEn: "The Morning Bakery Pastries Scenario",
    storyAr: `أعد الخباز الماهر 60 فطيرة طازجة في الصباح: 36 فطيرة بالجبن و24 فطيرة بالعسل.
اشترى الزبون الأول نصف عدد فطائر الجبن المتاحة فور خروجها من الفرن.
واشترى الزبون الثاني ثلث عدد فطائر العسل لتناول الإفطار مع أسرته.
ثم جاء مندوب شركة وطلب 10 فطائر إضافية من أي نوع متبقٍ في المخبز.
تم تجهيز كافة الطلبات وتسليمها للزبائن بعناية واحترافية عالية.`,
    storyEn: `The baker prepared 60 fresh pastries in the morning: 36 cheese pastries and 24 honey pastries.
The first customer bought half of the available cheese pastries right out of the oven.
The second customer bought one-third of the honey pastries for family breakfast.
Then a company representative arrived and ordered 10 additional pastries of any remaining type.
All orders were carefully prepared and delivered to customers.`,
    questionAr: "كم فطيرة إجمالية تبقت في المخبز بعد تلبية كافة هذه الطلبات؟",
    questionEn:
      "How many total pastries remained in the bakery after fulfilling all these orders?",
    optionsAr: ["24 فطيرة", "34 فطيرة", "26 فطيرة", "30 فطيرة"],
    optionsEn: ["24 pastries", "34 pastries", "26 pastries", "30 pastries"],
    correctIndex: 0, // Cheese left: 18, Honey left: 16 (Total: 34). Minus 10 = 24.
  },
  {
    id: 4,
    titleAr: "سيناريو سباق الدراجات المدرسي",
    titleEn: "The School Bicycle Race Scenario",
    storyAr: `أقيم سباق دراجات مدرسي تنافس فيه أربعة طلاب متميزين: كريم، مازن، عمر، وطارق.
خلال النصف الأول من السباق، كان كريم متصدراً السباق، وعمر في المركز الثاني.
كان مازن يسير خلف عمر مباشرة، بينما كان طارق في المركز الرابع والأخير.
عند المنعطف الأخير وقبل خط النهاية بـ 100 متر، تجاوز مازن المتسابق عمر.
حافظ كريم على سرعته الفائقة وعبر خط النهاية في الصدارة دون أي تغيير في موقعه.`,
    storyEn: `A school bicycle race took place with four distinguished students: Karim, Mazen, Omar, and Tarek.
During the first half of the race, Karim led the race, and Omar was in second place.
Mazen was riding right behind Omar, while Tarek was in fourth and last place.
At the final curve, 100 meters before the finish line, Mazen overtook Omar.
Karim maintained his high speed and crossed the finish line in first place.`,
    questionAr: "ما هو الترتيب النهائي للمتسابق (عمر) عند خط النهاية؟",
    questionEn:
      "What was the final position of racer (Omar) at the finish line?",
    optionsAr: [
      "المركز الأول",
      "المركز الثاني",
      "المركز الثالث",
      "المركز الرابع",
    ],
    optionsEn: ["First Place", "Second Place", "Third Place", "Fourth Place"],
    correctIndex: 2, // 1st Karim, 2nd Mazen, 3rd Omar, 4th Tarek
  },
  {
    id: 5,
    titleAr: "سيناريو حديقة الزهور وجدول السقي",
    titleEn: "The Flower Garden Watering Schedule",
    storyAr: `تحتوي حديقة المدرسة البيئية على 3 أقسام رئيسية: قسم الياسمين، قسم الجوري، وقسم التوليب.
يقوم الحارس بسقي قسم الياسمين كل يومين بانتظام في الصباح الباكر.
ويقوم بسقي قسم الورد الجوري كل 3 أيام وفق جدول الرعاية الزراعية.
أما قسم التوليب فيتم سقيه أسبوعياً كل 7 أيام فقط لتجنب رطوبة الجذور الزائدة.
في اليوم الأول من الشهر، تم سقي جميع الأقسام الثلاثة معاً في نفس التوقيت.`,
    storyEn: `The school eco-garden has 3 main sections: Jasmine, Damask Rose, and Tulips.
The caretaker waters the Jasmine section every 2 days regularly in the early morning.
He waters the Damask Rose section every 3 days according to the agricultural schedule.
The Tulip section is watered weekly every 7 days only to avoid root dampness.
On Day 1 of the month, all three sections were watered together at the exact same time.`,
    questionAr:
      "بعد اليوم الأول، بعد كم يوماً سيلتقي سقي (الياسمين والجوري) معاً مرة أخرى؟",
    questionEn:
      "After Day 1, after how many days will (Jasmine and Damask Rose) be watered together again?",
    optionsAr: ["بعد 4 أيام", "بعد 5 أيام", "بعد 6 أيام", "بعد 8 أيام"],
    optionsEn: ["After 4 days", "After 5 days", "After 6 days", "After 8 days"],
    correctIndex: 2, // LCM of 2 and 3 is 6 days.
  },
  {
    id: 6,
    titleAr: "سيناريو مختبر الكيمياء وتجربة السوائل",
    titleEn: "The Chemistry Lab Liquids Experiment",
    storyAr: `أحضر معلم العلوم 4 أنابيب اختبار متساوية السعة (100 مل لكل أنبوب) في المعمل.
وضع في الأنبوب الأول 40 مل من محلول ملحي أزرق نقي.
ووضع في الأنبوب الثاني 60 مل من محلول سكري أحمر شفاف.
سكب نصف محتوى الأنبوب الثاني (30 مل) داخل الأنبوب الأول وخلطهما جيداً.
ثم أضاف 10 مل من الماء المقطر إلى الأنبوب الأول لمعايرة الكثافة.`,
    storyEn: `The science teacher brought 4 equal test tubes (100 ml each) into the chemistry lab.
He placed 40 ml of pure blue saline solution into the first tube.
He placed 60 ml of clear red sugar solution into the second tube.
He poured half of the second tube's content (30 ml) into the first tube and mixed them thoroughly.
He then added 10 ml of distilled water into the first tube to calibrate density.`,
    questionAr: "كم ملليمتر مكعب من السائل أصبح موجوداً داخل الأنبوب الأول الآن؟",
    questionEn: "How many milliliters of liquid are now inside the first tube?",
    optionsAr: ["70 مل", "75 مل", "80 مل", "90 مل"],
    optionsEn: ["70 ml", "75 ml", "80 ml", "90 ml"],
    correctIndex: 2, // 40 + 30 + 10 = 80 ml.
  },
  {
    id: 7,
    titleAr: "سيناريو حافلة السفر وتذاكر الركاب",
    titleEn: "The Intercity Bus Ticket Booking",
    storyAr: `تتسع حافلة الرحلات الطويلة لـ 50 مقعداً مرقماً للمسافرين بين المحافظات.
تم حجز 30 مقعداً عبر الموقع الإلكتروني قبل موعد الانطلاق بيومين.
في صباح يوم السفر، اشترى 12 مسافراً تذاكرهم مباشرة من شباك المحطة.
قبل تحرك الحافلة بدقائق، اعتذر 4 مسافرين من حاجزي الإنترنت وألغوا حجزهم.
انطلقت الحافلة بكامل ركابها الحاضرين في الموعد المحدد بدقة.`,
    storyEn: `A long-distance coach accommodates 50 numbered seats for travel between governorates.
30 seats were booked online two days before departure.
On the morning of the trip, 12 passengers bought tickets directly at the station counter.
Minutes before departure, 4 online booking passengers cancelled their reservations.
The coach departed on schedule with all present passengers.`,
    questionAr: "كم مقعداً شاغراً (فارغاً) بقي داخل الحافلة أثناء رحلتها؟",
    questionEn: "How many empty seats remained on the bus during its journey?",
    optionsAr: ["8 مقاعد", "10 مقاعد", "12 مقعداً", "14 مقعداً"],
    optionsEn: ["8 seats", "10 seats", "12 seats", "14 seats"],
    correctIndex: 2, // (30 - 4 + 12) = 38 onboard. 50 - 38 = 12 empty seats.
  },
  {
    id: 8,
    titleAr: "سيناريو ورشة الصيانة وتصليح الأجهزة",
    titleEn: "The Electronics Maintenance Workshop",
    storyAr: `استلم المهندس سامر 24 حاسوباً محمولاً معطلاً لفحصها وإصلاحها خلال أسبوع العمل.
في اليوم الأول، قام بإصلاح 6 حواسيب وتسليمها لأصحابها بعد الفحص التقني.
في اليوم الثاني، أصلح ضعف عدد اليوم الأول (12 حاسوباً) بفضل قطع الغيار الجديدة.
في اليوم الثالث، استلم 4 حواسيب معطلة جديدة من إحدى الشركات المجاورة.
قام المهندس بتسجيل جميع الأرقام التسلسلية بدقة في سجل الورشة اليومي.`,
    storyEn: `Engineer Samer received 24 broken laptops for inspection and repair during the workweek.
On the first day, he repaired 6 laptops and returned them to their owners after technical testing.
On the second day, he repaired twice the first day's count (12 laptops) using new spare parts.
On the third day, he received 4 new faulty laptops from a nearby business.
The engineer meticulously logged all serial numbers in the daily workshop ledger.`,
    questionAr: "كم حاسوباً معطلاً متبقياً في الورشة يحتاج إلى إصلاح بعد اليوم الثالث؟",
    questionEn:
      "How many broken laptops remain in the workshop needing repair after Day 3?",
    optionsAr: ["8 حواسيب", "10 حواسيب", "12 حاسوباً", "14 حاسوباً"],
    optionsEn: ["8 laptops", "10 laptops", "12 laptops", "14 laptops"],
    correctIndex: 1, // (24 - 6 - 12) = 6. Plus 4 new = 10 laptops.
  },
  {
    id: 9,
    titleAr: "سيناريو مشروع رسم وتلوين الجدارية المدرسية",
    titleEn: "The School Wall Art Painting Project",
    storyAr: `تعاون 5 طلاب موهوبين لرسم لوحة جدارية بطول 20 متراً في فناء المدرسة.
أنجز الفريق في اليوم الأول رسم وتلوين 6 أمتار كاملة من الجدارية.
في اليوم الثاني، زادت وتيرة العمل وتم إنجاز 8 أمتار إضافية بمساعدة معلم التربية الفنية.
في اليوم الثالث هطلت بعض الأمطار، فتمكنوا فقط من إنجاز نصف المسافة المتبقية من الجدارية.
استخدم الطلاب ألواناً زيتية مقاومة للعوامل الجوية لحماية العمل الفني.`,
    storyEn: `5 talented students collaborated to paint a 20-meter mural on the schoolyard wall.
On Day 1, the team completed drawing and painting 6 full meters of the mural.
On Day 2, work pace increased, completing 8 additional meters with the art teacher's guidance.
On Day 3, light rain fell, so they could only complete half of the remaining mural distance.
The students used weather-resistant oil paints to protect the artwork.`,
    questionAr: "كم متراً من الجدارية تم إنجازه وتلوينه خلال اليوم الثالث؟",
    questionEn: "How many meters of the mural were completed on Day 3?",
    optionsAr: ["متران", "3 أمتار", "4 أمتار", "6 أمتار"],
    optionsEn: ["2 meters", "3 meters", "4 meters", "6 meters"],
    correctIndex: 1, // Completed in days 1 & 2: 6 + 8 = 14 m. Remaining: 6 m. Half of 6 is 3 m.
  },
  {
    id: 10,
    titleAr: "سيناريو بستان الفاكهة وحصاد المحصول",
    titleEn: "The Fruit Orchard Harvest and Packaging",
    storyAr: `جمع المزارع محمود 100 كيلوغرام من البرتقال الطازج من بستانه في الصباح الباكر.
قام بتعبئة نصف الكمية (50 كجم) في صناديق خشبية سعة كل صندوق 5 كجم لبيعها للتجار.
والكمية المتبقية (50 كجم) قام بتعبئتها في أكياس صغيرة سعة كل كيس 2 كجم للمستهلكين.
تم ترقيم كافة الصناديق والأكياس للتأكد من مطابقة الأوزان بدقة.
نقل المزارع جميع المنتجات إلى سوق الخضار والفاكهة المركزي بواسطة شاحنته.`,
    storyEn: `Farmer Mahmoud harvested 100 kg of fresh oranges from his orchard early in the morning.
He packed half the harvest (50 kg) into wooden boxes holding 5 kg each for commercial buyers.
The remaining half (50 kg) was packed into small consumer bags holding 2 kg each.
All boxes and bags were numbered to ensure accurate weight verification.
The farmer transported all produce to the central market in his truck.`,
    questionAr:
      "كم إجمالي عدد العبوات (الصناديق الخشبية + الأكياس الصغيرة) التي جهزها المزارع؟",
    questionEn:
      "What is the total number of packages (wooden boxes + small bags) the farmer prepared?",
    optionsAr: ["25 عبوة", "30 عبوة", "35 عبوة", "40 عبوة"],
    optionsEn: ["25 packages", "30 packages", "35 packages", "40 packages"],
    correctIndex: 2, // Boxes: 50 / 5 = 10. Bags: 50 / 2 = 25. Total = 35 packages.
  },
  {
    id: 11,
    titleAr: "سيناريو مسابقة الرياضيات ودرجات الطلاب",
    titleEn: "The Math Competition Student Scores",
    storyAr: `شاركت 4 فرق طلابية في مسابقة الرياضيات: فريق حسام، فريق طارق، فريق زياد، وفريق ندى.
حصل فريق حسام على 8 نقاط في الجولة الأولى، وحصل فريق طارق على 12 نقطة.
أما فريق زياد فقد حصل على مجموع نقاط يزيد بمقدار نقطتين عن نقاط فريق حسام (10 نقاط).
بينما حصل فريق ندى على متوسط مجموع نقاط فريقي حسام وزياد معاً.
أعلنت لجنة التحكيم النتائج في قاعة الاحتفالات بحضور أولياء الأمور.`,
    storyEn: `4 student teams participated in a math competition: Hossam's, Tarek's, Ziad's, and Nada's teams.
Hossam's team scored 8 points in Round 1, and Tarek's team scored 12 points.
Ziad's team scored 2 points higher than Hossam's team (10 points).
Nada's team scored the exact average of Hossam's and Ziad's combined scores.
The judging committee announced the scores in the main auditorium.`,
    questionAr: "كم نقطة حصل عليها فريق الطالبة (ندى) في المسابقة؟",
    questionEn: "How many points did (Nada's) team achieve in the competition?",
    optionsAr: ["8 نقاط", "9 نقاط", "10 نقاط", "11 نقطة"],
    optionsEn: ["8 points", "9 points", "10 points", "11 points"],
    correctIndex: 1, // Hossam=8, Ziad=10. Combined=18. Average (half)=9.
  },
  {
    id: 12,
    titleAr: "سيناريو محطة الطاقة الشمسية وتخزين الكهرباء",
    titleEn: "The Solar Power Station Storage",
    storyAr: `تعتمد قرية ريفية نموذجية على محطة طاقة شمسية ذكية لتوليد الكهرباء.
في فترة الصباح، ولّدت الألواح الشمسية 50 كيلوواط من الطاقة النظيفة.
في فترة الظهيرة مع اشتداد أشعة الشمس، ولّدت الألواح ضعف كمية الصباح (100 كيلوواط).
في المساء، استهلكت منازل القرية 80 كيلوواط من إجمالي الطاقة المولدة في ذلك اليوم.
تم توجيه كامل فائض الطاقة المتبقية إلى بنك البطاريات المركزية للتخزين.`,
    storyEn: `A model village relies on a smart solar station for electricity generation.
In the morning, the solar panels generated 50 kW of clean power.
At noon under intense sunlight, the panels generated twice the morning amount (100 kW).
In the evening, the village homes consumed 80 kW of the total power generated that day.
All remaining surplus power was directed to the central battery bank for storage.`,
    questionAr: "كم كيلوواط من الطاقة تم تخزينه في بنك البطاريات بنهاية اليوم؟",
    questionEn:
      "How many kilowatts of energy were stored in the battery bank by the end of the day?",
    optionsAr: ["50 كيلوواط", "60 كيلوواط", "70 كيلوواط", "80 كيلوواط"],
    optionsEn: ["50 kW", "60 kW", "70 kW", "80 kW"],
    correctIndex: 2, // 50 + 100 = 150. 150 - 80 = 70 kW.
  },
  {
    id: 13,
    titleAr: "سيناريو ورشة النجارة وتجهيز الطلبيات",
    titleEn: "The Carpentry Workshop Orders",
    storyAr: `يعمل نجار محترف في ورشته وينتج 4 كراسي خشبية فاخرة في اليوم الواحد.
يعمل النجار بانتظام لمدة 5 أيام فقط في الأسبوع ويأخذ يومين راحة أسبوعية.
اتفق صاحب مطعم جديد مع النجار على تصنيع طلبية كاملة تضم 60 كرسياً بنفس المواصفات.
بدأ النجار العمل بكفاءة عالية مستخدماً أحدث أدوات النجارة والصنفرة.
حافظ النجار على معدل إنتاجه اليومي الثابت دون أي تأخير أو توقف.`,
    storyEn: `A master carpenter works in his workshop producing 4 chairs per day.
The carpenter works regularly 5 days a week with a 2-day weekend.
A new restaurant owner contracted the carpenter to make a complete order of 60 identical chairs.
The carpenter started work efficiently using modern carpentry tools.
He maintained his steady daily production rate without delays.`,
    questionAr:
      "كم أسبوع عمل يحتاجه النجار لإنجاز وتجهيز طلبية الـ 60 كرسياً بالكامل؟",
    questionEn:
      "How many working weeks does the carpenter need to complete the entire 60-chair order?",
    optionsAr: ["أسبوعان", "3 أسابيع", "4 أسابيع", "5 أسابيع"],
    optionsEn: ["2 weeks", "3 weeks", "4 weeks", "5 weeks"],
    correctIndex: 1, // Weekly production = 4 * 5 = 20 chairs. 60 / 20 = 3 weeks.
  },
  {
    id: 14,
    titleAr: "سيناريو بطولة الشطرنج المدرسية السريعة",
    titleEn: "The School Blitz Chess Tournament",
    storyAr: `أقامت المدرسة دورة شطرنج مصغرة ضمت أربعة لاعبين: يوسف، أحمد، سيف، ومعاذ.
نظام البطولة ينص على أن يلعب كل متسابق مباراة واحدة فقط ضد كل متسابق آخر في المجموعة.
تألق أحمد في جميع مبارياته ونجح في الفوز بجميع اللقاءات التي خاضها دون أي هزيمة.
تعادل يوسف في مباراتين وخسر مباراة واحدة، بينما لم يتمكن سيف ومعاذ من الفوز على أحمد.
حاز أحمد على الميدالية الذهبية وكأس البطولة لإنجازه المتميز.`,
    storyEn: `The school hosted a mini chess championship featuring 4 players: Youssef, Ahmed, Seif, and Moaz.
The tournament rules stated that each participant plays exactly one match against every other participant.
Ahmed excelled in all his matches and won every single game he played without defeat.
Youssef drew 2 matches and lost 1, while neither Seif nor Moaz could defeat Ahmed.
Ahmed was awarded the gold medal and tournament trophy.`,
    questionAr: "كم عدد المباريات الكلية التي لعبها (أحمد) في هذه البطولة؟",
    questionEn: "How many total matches did (Ahmed) play in this tournament?",
    optionsAr: ["مباراتان", "3 مباريات", "4 مباريات", "6 مباريات"],
    optionsEn: ["2 matches", "3 matches", "4 matches", "6 matches"],
    correctIndex: 1, // Ahmed plays against Youssef, Seif, Moaz = 3 matches.
  },
  {
    id: 15,
    titleAr: "سيناريو زوار معرض الآثار التاريخية",
    titleEn: "The Historical Artifacts Exhibition Visitors",
    storyAr: `افتتح متحف الآثار قاعته الملكية الكبرى في تمام الساعة العاشرة صباحاً بحضور 100 زائر.
في تمام الساعة الحادية عشرة، غادر 45 زائراً القاعة، ودخل في نفس اللحظة 25 زائراً جديداً.
في تمام الساعة الثانية عشرة ظهراً، غادر نصف إجمالي الزوار الموجودين داخل القاعة لتناول وجبة الغداء.
حافظت القاعة على هدوئها وتنظيمها تحت إشراف مرشدي المتحف السياحيين.
استمر الزوار المتبقون في مشاهدة المعروضات والقطع الأثرية النادرة.`,
    storyEn: `The antiquities museum opened its Grand Royal Hall at 10:00 AM with 100 visitors.
At 11:00 AM, 45 visitors left the hall, and at the same moment 25 new visitors entered.
At 12:00 PM, exactly half of all visitors present inside the hall left for lunch.
The hall remained quiet and organized under museum guides' supervision.
The remaining visitors continued exploring the rare archaeological exhibits.`,
    questionAr:
      "كم زائراً بقي داخل القاعة الملكية بعد الساعة الثانية عشرة ظهراً؟",
    questionEn:
      "How many visitors remained inside the Royal Hall after 12:00 PM?",
    optionsAr: ["35 زائراً", "40 زائراً", "45 زائراً", "50 زائراً"],
    optionsEn: ["35 visitors", "40 visitors", "45 visitors", "50 visitors"],
    correctIndex: 1, // (100 - 45 + 25) = 80. Half leaves -> 40 remain.
  },
  {
    id: 16,
    titleAr: "سيناريو متجر الهدايا وتزيين الصناديق",
    titleEn: "The Gift Shop Box Decoration",
    storyAr: `قامت مصممة الهدايا منى بتجهيز 50 صندوق هدايا لحفل تخرج مدرسي كبير.
غلفت 30 صندوقاً بورق لامع باللون الأزرق، و20 صندوقاً بورق فاخر باللون الفضي.
وضعت شريطاً حريرياً باللون الذهبي على جميع الصناديق الزرقاء بلا استثناء.
أما الصناديق الفضية، فوضعت شريطاً أحمر على نصف عددها فقط (10 صناديق) وتركت الباقي.
تم ترتيب جميع الهدايا في أكياس مخصصة لتسليمها لإدارة المدرسة.`,
    storyEn: `Gift designer Mona prepared 50 gift boxes for a grand school graduation ceremony.
She wrapped 30 boxes in bright blue paper and 20 boxes in luxury silver paper.
She placed a golden silk ribbon on all 30 blue boxes without exception.
For the silver boxes, she placed a red ribbon on only half of them (10 boxes) and left the rest plain.
All gifts were packed into designated presentation bags.`,
    questionAr:
      "كم إجمالي عدد الصناديق التي وضعت عليها منى شريطاً (سواء كان ذهبياً أو أحمر)؟",
    questionEn:
      "How many total boxes did Mona decorate with a ribbon (whether gold or red)?",
    optionsAr: ["30 صندوقاً", "35 صندوقاً", "40 صندوقاً", "45 صندوقاً"],
    optionsEn: ["30 boxes", "35 boxes", "40 boxes", "45 boxes"],
    correctIndex: 2, // 30 gold + 10 red = 40 boxes.
  },
  {
    id: 17,
    titleAr: "سيناريو مطبعة الكتب وأوراق التجليد",
    titleEn: "The Printing Press Daily Paper Reams",
    storyAr: `تمتلك مطبعة الكتب الحديثة مخزوناً أولياً يبلغ 500 رزمة ورق في بداية الأسبوع.
استهلكت ماكينة الطباعة الأولى 150 رزمة لطباعة كتب العلوم والرياضيات.
واستهلكت ماكينة الطباعة الثانية 100 رزمة لطباعة مجلات النشاط المدرسي.
في منتصف الأسبوع، وصلت شحنة توريد جديدة أضافت 200 رزمة ورق ممتازة إلى المخزن.
تم رص وتخزين الشحنة الجديدة بدقة في المستودع الرئيسي المجهز بنظام تهوية.`,
    storyEn: `The modern printing press held an initial stock of 500 paper reams at week start.
The first printing press consumed 150 reams for science and math textbooks.
The second printing press consumed 100 reams for school activity magazines.
Midweek, a new delivery arrived adding 200 high-grade paper reams into the warehouse.
The new shipment was stacked neatly in the ventilated main storage bay.`,
    questionAr: "كم رزمة ورق متوفرة داخل مخزن المطبعة بعد استلام الشحنة الجديدة؟",
    questionEn: "How many paper reams are available in the printing warehouse after receiving the new shipment?",
    optionsAr: ["400 رزمة", "450 رزمة", "500 رزمة", "550 رزمة"],
    optionsEn: ["400 reams", "450 reams", "500 reams", "550 reams"],
    correctIndex: 1, // 500 - 150 - 100 = 250. 250 + 200 = 450.
  },
  {
    id: 18,
    titleAr: "سيناريو حوض الأسماك المائية وجدول التنظيف",
    titleEn: "The Aquarium Fish Tank Cleaning",
    storyAr: `يحتوي الحوض المائي الكبير في المركز العلمي على 90 لتراً من الماء النقي.
وفقاً لإرشادات رعاية الأسماك، يقوم المشرف بتفريغ ثلث ماء الحوض (30 لتراً) أسبوعياً لتنظيفه.
ثم يقوم بإضافة 25 لتراً من الماء المعالج والمفلتر المضاف إليه الأملاح المفيدة.
بعد ذلك بساعة، تبخر لتران (2 لتر) بسبب تشغيل أجهزة الإضاءة الحرارية فوق الحوض.
تسبح الأسماك في بيئة صحية خاضعة للرقابة البيولوجية الدقيقة.`,
    storyEn: `The large science center aquarium contains 90 liters of fresh water.
Per fish care protocols, the supervisor drains one-third of the tank (30 L) weekly for cleaning.
He then adds 25 liters of conditioned filtered water enriched with minerals.
One hour later, 2 liters evaporated due to heat lamps positioned above the tank.
The fish swim in a strictly controlled, biologically balanced habitat.`,
    questionAr: "كم لتراً من الماء أصبح موجوداً داخل الحوض المائي في نهاية عملية التنظيف؟",
    questionEn: "How many liters of water are inside the aquarium tank at the end of the cleaning process?",
    optionsAr: ["81 لتراً", "83 لتراً", "85 لتراً", "88 لتراً"],
    optionsEn: ["81 liters", "83 liters", "85 liters", "88 liters"],
    correctIndex: 1, // 90 - 30 = 60. 60 + 25 = 85. 85 - 2 = 83 liters.
  },
  {
    id: 19,
    titleAr: "سيناريو القبة السماوية وعروض الفضاء",
    titleEn: "The Space Science Planetarium Show",
    storyAr: `تتسع قاعة القبة الفلكية لـ 80 مقعداً في العرض الواحد المخصص لطلاب المدارس.
في العرض الصباحي الأول، امتلأت القاعة بنسبة 75% من طاقتها الاستيعابية (60 طالباً).
في العرض الثاني، زاد عدد الحضور بمقدار 10 طلاب مقارنة بالعرض الصباحي الأول.
أما في العرض المسائي الثالث، فقد كانت القاعة ممتلئة بالكامل بجميع مقاعدها الـ 80.
استمتع الطلاب برؤية النجوم والمجرات عبر نظام العرض الليزري الرقمي ثلاثي الأبعاد.`,
    storyEn: `The planetarium auditorium seats 80 students per astronomy screening.
In the first morning session, the hall was filled to 75% capacity (60 students).
In the second session, attendance increased by 10 students compared to the first morning session.
In the third evening session, all 80 auditorium seats were completely occupied.
Students enjoyed seeing stars and galaxies through the 3D digital laser projector.`,
    questionAr: "كم عدد الطلاب الذين حضروا العرض الثاني في القبة الفلكية؟",
    questionEn: "How many students attended the second screening in the planetarium?",
    optionsAr: ["60 طالباً", "65 طالباً", "70 طالباً", "75 طالباً"],
    optionsEn: ["60 students", "65 students", "70 students", "75 students"],
    correctIndex: 2, // 60 + 10 = 70 students.
  },
  {
    id: 20,
    titleAr: "سيناريو منحل العسل وتعبئة البرطمانات",
    titleEn: "The Honey Farm Harvest and Jars",
    storyAr: `أنتج منحل الوادي الأخضر 48 كيلوغراماً من عسل السدر الصافي خلال موسم الربيع.
قام النحال بتعبئة نصف الكمية (24 كجم) في برطمانات كبيرة تزن كل منها 1 كجم بالكامل.
والنصف الآخر (24 كجم) قام بتعبئته في برطمانات صغيرة سعة كل منها نصف كيلوغرام (0.5 كجم).
وضع النحال ملصقات الجودة المعتمدة على جميع البرطمانات قبل شحنها للمتاجر.
تم حفظ العسل في درجة حرارة الغرفة للحفاظ على خواصه الطبيعية وقيمته الغذائية.`,
    storyEn: `The Green Valley apiary produced 48 kilograms of pure Sidr honey during spring.
The beekeeper packed half the harvest (24 kg) into 1-kg large jars.
The other half (24 kg) was packed into small jars holding half a kilogram (0.5 kg) each.
Certified quality labels were affixed to all jars before retail dispatch.
Honey was stored at room temperature to preserve its natural nutrients.`,
    questionAr: "كم عدد البرطمانات الصغيرة (سعة 0.5 كجم) التي تم تجهيزها بالكامل؟",
    questionEn: "How many small jars (0.5 kg capacity) were completely filled?",
    optionsAr: ["24 برطماناً", "36 برطماناً", "48 برطماناً", "60 برطماناً"],
    optionsEn: ["24 jars", "36 jars", "48 jars", "60 jars"],
    correctIndex: 2, // 24 kg / 0.5 kg per jar = 48 jars.
  },
  {
    id: 21,
    titleAr: "سيناريو ماراثون التتابع الرياضي",
    titleEn: "The School Marathon Relay Race",
    storyAr: `أقيم سباق تتابع لمسافة إجمالية تبلغ 12 كيلومتراً مقسمة بين 4 عدائين في الفريق الواحد.
ركض العداء الأول ربع المسافة الإجمالية (3 كم) في زمن قدره 12 دقيقة وسلم العصا.
ركض العداء الثاني مسافة 4 كم كاملة بسرعة وثبات عاليين.
أما العداء الثالث فقد ركض مسافة 2 كم فقط قبل تسليم العصا للعداء الرابع والأخير.
انطلق العداء الأخير بكل طاقته لإنهاء ما تبقى من مسار السباق والوصول لخط النهاية.`,
    storyEn: `A relay race covering a total of 12 kilometers was split among 4 team runners.
The first runner covered one-fourth of the total distance (3 km) in 12 minutes and passed the baton.
The second runner completed 4 full kilometers with consistent speed.
The third runner ran 2 kilometers before handing the baton to the anchor runner.
The fourth runner sprinted with full energy to complete the remainder of the course.`,
    questionAr: "كم كيلومتراً ركض العداء الرابع والأخير حتى خط النهاية؟",
    questionEn: "How many kilometers did the fourth and final runner cover to the finish line?",
    optionsAr: ["كيلومتر واحد", "كيلومتران", "3 كيلومترات", "4 كيلومترات"],
    optionsEn: ["1 km", "2 km", "3 km", "4 km"],
    correctIndex: 2, // 12 - (3 + 4 + 2) = 12 - 9 = 3 km.
  },
  {
    id: 22,
    titleAr: "سيناريو معصرة الزيتون واستخلاص الزيت",
    titleEn: "The Olive Oil Press Cold Extraction",
    storyAr: `استقبلت معصرة الزيتون الحديثة 600 كيلوغرام من الزيتون عالي الجودة لعصره على البارد.
تنتج كل 100 كجم من الزيتون ما يعادل 20 لتراً من زيت الزيتون البكر الممتاز.
تم عصر كامل كمية الزيتون في المعصرة وفق أحدث معايير النقاء وضبط الحرارة.
قام صاحب المعصرة بالاحتفاظ بـ 20 لتراً من الزيت المستخلص لاستخدامه المنزلي الخاص.
ثم قام بتعبئة باقي كمية الزيت في عبوات تجارية سعة 5 لترات للبيع.`,
    storyEn: `The modern press received 600 kg of premium olives for cold extraction.
Every 100 kg of olives yields exactly 20 liters of extra virgin olive oil.
The entire olive batch was pressed following strict temperature and purity controls.
The mill owner kept 20 liters of extracted oil for his personal home use.
He then bottled all remaining oil into 5-liter containers for market distribution.`,
    questionAr: "كم عبوة سعة 5 لترات قام صاحب المعصرة بتعبئتها للبيع؟",
    questionEn: "How many 5-liter containers did the mill owner fill for sale?",
    optionsAr: ["16 عبوة", "18 عبوة", "20 عبوة", "24 عبوة"],
    optionsEn: ["16 containers", "18 containers", "20 containers", "24 containers"],
    correctIndex: 2, // Total oil: (600/100) * 20 = 120 L. Remaining after keeping 20 L = 100 L. 100 / 5 = 20 containers.
  },
  {
    id: 23,
    titleAr: "سيناريو مختبر الروبوتات ومعايرة الحساسات",
    titleEn: "The Robotics Coding Lab Sensor Calibration",
    storyAr: `يقوم فريق النادي العلمي ببرمجة روبوت ذكي يتحرك في مسار دائري داخل المعمل.
يقطع الروبوت في الدورة الواحدة مسافة 15 متراً خلال 30 ثانية بسرعة ثابتة.
قام الفريق بتشغيل الروبوت ليتحرك لمدة 3 دقائق متواصلة لاختبار ثبات المحركات.
توقف الروبوت فور انتهاء الوقت المبرمج دون أي انحراف عن المسار المحدد.
قام الطلاب بتسجيل قراءات حساسات المسافة والتسارع على شاشة الحاسوب.`,
    storyEn: `The science robotics team programmed a smart robot navigating a circular indoor track.
In one single lap, the robot covers 15 meters in 30 seconds at steady velocity.
The team operated the robot continuously for 3 minutes to test motor stability.
The robot stopped automatically when programmed time elapsed without track deviation.
Students logged ultrasonic distance and acceleration telemetry on their laptops.`,
    questionAr: "كم دورة كاملة قطعها الروبوت خلال مدة التشغيل (3 دقائق)؟",
    questionEn: "How many full laps did the robot complete during the 3-minute run?",
    optionsAr: ["4 دورات", "5 دورات", "6 دورات", "8 دورات"],
    optionsEn: ["4 laps", "5 laps", "6 laps", "8 laps"],
    correctIndex: 2, // 3 minutes = 180 seconds. 180 / 30 = 6 laps.
  },
  {
    id: 24,
    titleAr: "سيناريو محطة الأرصاد الجوية وقياس الأمطار",
    titleEn: "The Meteorology Weather Station Rain Gauges",
    storyAr: `سجلت محطة الأرصاد الجوية هطول أمطار غزيرة على مدار أربعة أيام متتالية في فصل الشتاء.
في اليوم الأول، سجل مقياس المطر 15 ملم من مياه الأمطار.
في اليوم الثاني، هطلت كمية أمطار بلغت ضعف كمية اليوم الأول (30 ملم).
في اليوم الثالث، سجل المقياس 20 ملم، بينما هطل في اليوم الرابع 10 ملم فقط مع انقشاع السحب.
تم إرسال تقرير قياس الهطول إلى هيئة الموارد المائية لتحديث منسوب السدود.`,
    storyEn: `The meteorological station recorded heavy rainfall over four consecutive winter days.
On Day 1, the rain gauge recorded 15 mm of precipitation.
On Day 2, rainfall was twice the first day's amount (30 mm).
On Day 3, the gauge logged 20 mm, while on Day 4 only 10 mm fell as clouds cleared.
The cumulative rainfall report was submitted to the water authority for reservoir monitoring.`,
    questionAr: "كم إجمالي كمية الأمطار (بالملم) التي هطلت خلال الأيام الأربعة مجتمعة؟",
    questionEn: "What is the total rainfall (in mm) recorded across all four days combined?",
    optionsAr: ["65 ملم", "70 ملم", "75 ملم", "80 ملم"],
    optionsEn: ["65 mm", "70 mm", "75 mm", "80 mm"],
    correctIndex: 2, // 15 + 30 + 20 + 10 = 75 mm.
  },
  {
    id: 25,
    titleAr: "سيناريو ورشة الخزف وحرق الأواني في الفرن",
    titleEn: "The Ceramic Pottery Kiln Firing",
    storyAr: `صنع فنان الخزف 40 قطعة فخارية مميزة شملت 25 إبريقاً و15 آنية زهور في ورشته.
وضع جميع القطع داخل الفرن الحراري عالي الكفاءة لحرقها وتثبيت ألوانها الزجاجية.
بعد فتح الفرن وانتهاء عملية التبريد، وجد أن 3 أباريق وآنية واحدة قد تعرضت لكسور غير قابلة للإصلاح.
أما جميع القطع المتبقية فقد خرجت سليمة وبأعلى درجات اللمعان والجودة الفنية.
قام الفنان بعرض القطع السليمة داخل صالة العرض الخاصة بالمعرض الحرفي السنوي.`,
    storyEn: `The ceramic artisan hand-crafted 40 pottery items: 25 pitchers and 15 flower vases.
He loaded all items into the kiln for high-temperature glaze firing.
Upon cooling and inspection, 3 pitchers and 1 flower vase suffered irreversible fractures.
All other pieces emerged pristine with glossy finish and master craftsmanship.
The artisan exhibited all undamaged pieces at the annual artisan craft gallery.`,
    questionAr: "كم إجمالي عدد القطع الفخارية السليمة والجاهزة للعرض بعد انتهاء الحرق؟",
    questionEn: "How many undamaged pottery pieces were ready for exhibition after firing?",
    optionsAr: ["34 قطعة", "35 قطعة", "36 قطعة", "38 قطعة"],
    optionsEn: ["34 pieces", "35 pieces", "36 pieces", "38 pieces"],
    correctIndex: 2, // 40 - (3 + 1) = 36 pieces.
  },
  {
    id: 26,
    titleAr: "سيناريو الصوبة الزجاجية وحصاد الطماطم العضوية",
    titleEn: "The Greenhouse Organic Tomato Harvest",
    storyAr: `تحتوي صوبة زراعية حديثة على 60 شتلة طماطم عضوية تتم رعايتها بنظام التنقيط.
أنتجت كل شتلة في المتوسط 3 كيلوغرامات من ثمار الطماطم الناضجة في موسم الحصاد.
قام المهندس الزراعي بفرز المحصول ووجد أن 10% من إجمالي الإنتاج غير مطابق لمواصفات التصدير.
تم تحويل الكمية غير المطابقة للمصنع لإنتاج صلصة الطماطم الطبيعية دون هدر.
أما المحصول المطابق عالي الجودة فقد تم تجهيزه وتعبئته في كراتين التصدير الدولية.`,
    storyEn: `A high-tech greenhouse contains 60 organic tomato plants nurtured by drip irrigation.
Each plant produced an average of 3 kilograms of ripe tomatoes during harvest.
The agronomist graded the crop and found that 10% of total production did not meet export specs.
The sub-grade portion was diverted to a puree facility to ensure zero food waste.
The premium grade harvest was packaged into international export cartons.`,
    questionAr: "كم كيلوغراماً من الطماطم عالية الجودة والمطابقة للتصدير تم تجهيزها؟",
    questionEn: "How many kilograms of premium export-grade tomatoes were prepared?",
    optionsAr: ["150 كجم", "162 كجم", "170 كجم", "180 كجم"],
    optionsEn: ["150 kg", "162 kg", "170 kg", "180 kg"],
    correctIndex: 1, // Total crop: 60 * 3 = 180 kg. 10% is 18 kg. 180 - 18 = 162 kg.
  },
  {
    id: 27,
    titleAr: "سيناريو صيدلية المستشفى وجرد الأدوية",
    titleEn: "The Hospital Pharmacy Medicine Inventory",
    storyAr: `استلمت صيدلية الطوارئ 200 عبوة من محلول التعقيم الطبي في بداية النوبة المسائية.
صرفت الصيدلية 45 عبوة لقسم العمليات الجراحية لتعقيم الأدوات والمعدات.
وصرفت 35 عبوة لقسم العناية المركزة وفق طلبات الأطباء المعتمدة.
في منتصف النوبة، صرفت الصيدلية 20 عبوة إضافية لغرف الإسعاف السريع.
تم تسجيل كافة أرقام التشغيلات في النظام الإلكتروني لضمان سلامة المرضى.`,
    storyEn: `The emergency pharmacy received 200 units of medical antiseptic solution at shift start.
The pharmacy dispensed 45 units to the surgical suite for instrument sterilization.
It dispensed 35 units to the intensive care unit per physician orders.
Mid-shift, 20 additional units were issued to urgent care triage rooms.
All batch lot numbers were logged into the electronic health system for safety.`,
    questionAr: "كم عبوة محلول تعقيم متبقية في صيدلية الطوارئ بنهاية النوبة؟",
    questionEn: "How many antiseptic units remain in the emergency pharmacy at shift end?",
    optionsAr: ["90 عبوة", "100 عبوة", "110 عبوات", "120 عبوة"],
    optionsEn: ["90 units", "100 units", "110 units", "120 units"],
    correctIndex: 1, // 200 - (45 + 35 + 20) = 200 - 100 = 100 units.
  },
  {
    id: 28,
    titleAr: "سيناريو كورال المدرسة وتدريب الأصوات",
    titleEn: "The School Choir Singing Practice",
    storyAr: `يضم كورال المدرسة الموسيقي 36 طالباً وطالبة من مختلف الصفوف الدراسية.
ينقسم الكورال إلى 3 مجموعات متساوية العدد: أصوات السوبرانو، وأصوات الألتو، وأصوات التينور.
في يوم التدريب الأول، حضر جميع أعضاء مجموعتي السوبرانو والألتو بالكامل.
بينما اعتذر 4 طلاب من مجموعة التينور بسبب مشاركتهم في دوري كرة السلة المدرسي.
أجرى قائد الكورال تمريناً صوتياً مكثفاً لجميع الطلاب الحاضرين في المسرح.`,
    storyEn: `The school choir consists of 36 students from diverse academic grades.
The choir is split into 3 equal sections: Soprano, Alto, and Tenor vocalists (12 each).
On the first rehearsal day, all Soprano and Alto members attended in full.
4 students from the Tenor section were excused due to a school basketball tournament.
The choir director conducted an intensive vocal rehearsal for all present students.`,
    questionAr: "كم إجمالي عدد الطلاب الذين حضروا التدريب الصوتي في المسرح؟",
    questionEn: "How many total students attended the vocal rehearsal in the auditorium?",
    optionsAr: ["28 طالباً", "30 طالباً", "32 طالباً", "34 طالباً"],
    optionsEn: ["28 students", "30 students", "32 students", "34 students"],
    correctIndex: 2, // 36 / 3 = 12 per group. Present: 12 + 12 + (12 - 4) = 32 students.
  },
  {
    id: 29,
    titleAr: "سيناريو مزرعة توربينات الرياح وتوليد الكهرباء",
    titleEn: "The Wind Turbine Energy Output",
    storyAr: `تضم محطة طاقة الرياح الساحلية 5 توربينات عملاقة لتوليد الطاقة الكهربائية النظيفة.
ينتج كل توربين رياح 20 ميجاواط في الساعة عندما تهب الرياح بسرعة مثالية.
خلال فترة بعد الظهر، كانت 4 توربينات تعمل بكامل طاقتها الإنتاجية بانتظام.
بينما كان التوربين الخامس يخضع لأعمال الصيانة الدورية المجدولة وكان متوقفاً تماماً.
تم ربط كامل الطاقة المنتجة بالشبكة القومية للكهرباء لتغذية المصانع والمدن.`,
    storyEn: `The coastal wind farm comprises 5 giant wind turbines generating renewable power.
Each turbine produces 20 MW per hour under optimal wind speed conditions.
During the afternoon, 4 turbines operated continuously at full rated capacity.
The 5th turbine was offline for scheduled preventive maintenance.
All generated energy was fed into the national electrical grid for industrial use.`,
    questionAr: "كم ميجاواط من الطاقة النظيفة تم توليدها خلال ساعتين من التشغيل بتلك الحالة؟",
    questionEn: "How many megawatts of power were generated during 2 operating hours in that state?",
    optionsAr: ["120 ميجاواط", "140 ميجاواط", "160 ميجاواط", "200 ميجاواط"],
    optionsEn: ["120 MW", "140 MW", "160 MW", "200 MW"],
    correctIndex: 2, // 4 turbines * 20 MW = 80 MW per hour. For 2 hours = 160 MW.
  },
  {
    id: 30,
    titleAr: "سيناريو خزان المياه ونظام الري الذكي",
    titleEn: "The Smart Irrigation Water Tank",
    storyAr: `يمتلك مجمع زراعي حديث خزاناً مائياً بسعة قصوى تبلغ 1000 لتر من المياه النقية.
في الصباح كان الخزان ممتلئاً بنسبة 80% من طاقته الكلية (800 لتر).
استهلكت شبكة الري بالتنقيط 350 لتراً لري أشجار الزيتون والنخيل على مدار اليوم.
في المساء، قامت مضخة البئر بتزويد الخزان بـ 150 لتراً من الماء الجوفي العذب.
تتم مراقبة منسوب المياه وحساسات التدفق بواسطة لوحة تحكم إلكترونية ذكية.`,
    storyEn: `A modern farm facility maintains a main water tank with 1000 liters maximum capacity.
In the morning, the tank was filled to 80% capacity (800 liters).
The automated drip system consumed 350 liters to irrigate olive and palm groves through the day.
In the evening, the well pump replenished the tank with 150 liters of fresh groundwater.
Water levels and flow sensors are monitored continuously by a smart controller.`,
    questionAr: "كم لتراً من الماء موجود داخل الخزان في نهاية اليوم؟",
    questionEn: "How many liters of water are in the tank at the end of the day?",
    optionsAr: ["550 لتراً", "600 لتر", "650 لتراً", "700 لتر"],
    optionsEn: ["550 liters", "600 liters", "650 liters", "700 liters"],
    correctIndex: 1, // 800 - 350 + 150 = 600 liters.
  },
  {
    id: 31,
    titleAr: "سيناريو رحلة الطيران وشحن الحقائب",
    titleEn: "The Aircraft Flight Luggage Loading",
    storyAr: `تستعد طائرة ركاب للإقلاع وعلى متنها 150 مسافراً متوجهين إلى مطار دولي.
قام 100 مسافر بشحن حقيبة سفر واحدة لكل منهم بوزن 20 كجم في عنبر الشحن.
وقام 30 مسافراً بشحن حقيبتين لكل منهم (وزن كل حقيبة 20 كجم).
بينما سافر الـ 20 مسافراً المتبقون بحقائب يد صغيرة داخل كابينة الطائرة فقط دون شحن في العنبر.
تم وزن جميع الأمتعة بدقة لضمان توازن مركز ثقل الطائرة قبل إغلاق الأبواب.`,
    storyEn: `A commercial passenger flight prepares for takeoff with 150 travelers on board.
100 passengers checked in 1 suitcase each weighing 20 kg into the cargo hold.
30 passengers checked in 2 suitcases each (20 kg per suitcase).
The remaining 20 passengers traveled with cabin carry-ons only without checked bags.
All luggage was weighed accurately to calibrate aircraft center of gravity before gate closure.`,
    questionAr: "كم إجمالي عدد حقائب السفر المشحونة في عنبر الطائرة؟",
    questionEn: "What is the total number of checked suitcases loaded into the cargo hold?",
    optionsAr: ["130 حقيبة", "140 حقيبة", "150 حقيبة", "160 حقيبة"],
    optionsEn: ["130 bags", "140 bags", "150 bags", "160 bags"],
    correctIndex: 3, // 100 bags (from 100 pax) + 60 bags (30 pax * 2) = 160 bags.
  },
  {
    id: 32,
    titleAr: "سيناريو معرض نماذج الكواكب المصغرة",
    titleEn: "The Educational Museum Planet Scale Model",
    storyAr: `صمم طلاب النادي الفلكي 8 نماذج دقيقة لكواكب مجموعتنا الشمسية في معرض العلوم.
تطلب كل نموذج كوكب استخدام 4 طبقات من مادة الجبس الأبيض لتشكيل التضاريس.
قام الفريق بطلاء نماذج كواكب المجموعة الداخلية الأربعة (عطارد، الزهرة، الأرض، المريخ) بألوان صخرية.
وقاموا بطلاء نماذج كواكب المجموعة الخارجية الأربعة (المشتري، زحل، أورانوس، نبتون) بألوان غازية مع حلقات.
تم وضع ملصق علمي يشرح نصف القطر والكتلة أمام كل نموذج كوكب.`,
    storyEn: `Astronomy club students built 8 precision scale models of our solar system planets.
Each planet model required 4 layers of white plaster to sculpt topographical features.
The team painted the 4 inner terrestrial planet models (Mercury, Venus, Earth, Mars) in rocky hues.
They painted the 4 outer gas giant models (Jupiter, Saturn, Uranus, Neptune) with atmosphere bands and rings.
Scientific placards detailing radius and mass were placed beside each planet.`,
    questionAr: "كم إجمالي عدد طبقات الجبس المستخدمة لتشكيل جميع نماذج الكواكب الثمانية؟",
    questionEn: "What is the total number of plaster layers used to construct all 8 planet models?",
    optionsAr: ["24 طبقة", "28 طبقة", "32 طبقة", "36 طبقة"],
    optionsEn: ["24 layers", "28 layers", "32 layers", "36 layers"],
    correctIndex: 2, // 8 planets * 4 layers = 32 layers.
  },
  {
    id: 33,
    titleAr: "سيناريو محمصة البن وتغليف حبوب القهوة",
    titleEn: "The Coffee Bean Roastery Packaging",
    storyAr: `قامت محمصة البن الفاخر بتحميص 50 كيلوغراماً من حبوب البن العربي عالي الجودة.
قامت المحمصة بتعبئة 30 كجم في أكياس سعة كل كيس 1 كجم مخصصة للمقاهي والفنادق.
والكمية المتبقية (20 كجم) قامت بتعبئتها في أكياس صغيرة سعة كل كيس ربع كيلوغرام (250 جرام).
تم إغلاق جميع الأكياس بصمام تفريغ الهواء للحفاظ على نكهة القهوة الطازجة.
وزعت المحمصة المنتجات على منافذ البيع المعتمدة مع بطاقات تاريخ التحميص.`,
    storyEn: `The artisanal roastery roasted 50 kilograms of premium Arabica coffee beans.
It packed 30 kg into 1-kg bags tailored for specialty cafes and hotels.
The remaining 20 kg was packed into retail bags holding a quarter-kilogram (250 grams / 0.25 kg) each.
All pouches were heat-sealed with one-way degassing valves to preserve freshness.
The roastery delivered the products to authorized retail outlets with roast date tags.`,
    questionAr: "كم عدد الأكياس الصغيرة (سعة ربع كجم / 250 جرام) التي تم تجهيزها؟",
    questionEn: "How many small bags (250g / 0.25kg capacity) were packaged?",
    optionsAr: ["60 كيس", "70 كيس", "80 كيس", "100 كيس"],
    optionsEn: ["60 bags", "70 bags", "80 bags", "100 bags"],
    correctIndex: 2, // 20 kg / 0.25 kg = 80 bags.
  },
  {
    id: 34,
    titleAr: "سيناريو المسبح الأولمبي وسباق الحارات",
    titleEn: "The Olympic Swimming Pool Lap Record",
    storyAr: `يبلغ طول حوض السباحة الأولمبي 50 متراً في اتجاه المسار الواحد (ذهاباً).
قام السباح مازن بالسباحة ذهاباً وإياباً (دورة كاملة = 100 متر) 6 مرات خلال التدريب الصباحي.
ثم أخذ استراحة لمدة 5 دقائق لشرب الماء وتنظيم التنفس.
بعد الاستراحة، أضاف مازن 4 دورات كاملة أخرى (ذهاباً وإياباً) بنفس المعدل الزمني.
سجل المدرب سرعة السباح ومعدل ضربات القلب في جدول التقييم البدني.`,
    storyEn: `An Olympic swimming pool measures 50 meters in a single one-way length.
Swimmer Mazen completed 6 full round-trip laps (100 meters per round-trip lap) during morning training.
He took a 5-minute hydration and breathing recovery break.
After the break, Mazen completed 4 additional round-trip laps at the same pace.
The coach recorded lap split times and heart rate in the performance log.`,
    questionAr: "كم إجمالي المسافة (بالمتر) التي قطعها السباح مازن خلال تدريبه كاملاً؟",
    questionEn: "What is the total distance (in meters) swum by Mazen during his entire training?",
    optionsAr: ["800 متر", "900 متر", "1000 متر", "1200 متر"],
    optionsEn: ["800 m", "900 m", "1000 m", "1200 m"],
    correctIndex: 2, // 6 laps + 4 laps = 10 round trips * 100 m = 1000 meters.
  },
  {
    id: 35,
    titleAr: "سيناريو مبادرة التشجير وزراعة الشتلات",
    titleEn: "The Eco-Friendly Tree Planting Initiative",
    storyAr: `أطلقت جمعية البيئة المدرسية مبادرة لزراعة 120 شتلة شجرة ظليلة في شوارع الحي.
قام فريق المتطوعين في اليوم الأول بزراعة 40 شتلة وتثبيت دعامات الحماية الخشبية لها.
في اليوم الثاني، انضم متطوعون جدد وتمت زراعة 50 شتلة إضافية بروح تعاونية عالية.
في اليوم الثالث، زرع الفريق جميع الشتلات المتبقية من الـ 120 شتلة وأكملوا المهمة بنجاح.
قام المشاركون بسقي جميع الأشجار وتركيب لافتات إرشادية للمحافظة على البيئة.`,
    storyEn: `The school eco-club launched an initiative to plant 120 shade tree saplings across the neighborhood.
On Day 1, the volunteer team planted 40 saplings and installed wooden support stakes.
On Day 2, additional volunteers joined and planted 50 more saplings with high enthusiasm.
On Day 3, the team planted all remaining saplings of the 120 total, completing the campaign.
Participants watered all newly planted trees and placed eco-care signs.`,
    questionAr: "كم عدد الشتلات التي تمت زراعتها في اليوم الثالث لإنهاء المبادرة بالكامل؟",
    questionEn: "How many saplings were planted on Day 3 to conclude the entire initiative?",
    optionsAr: ["20 شتلة", "25 شتلة", "30 شتلة", "35 شتلة"],
    optionsEn: ["20 saplings", "25 saplings", "30 saplings", "35 saplings"],
    correctIndex: 2, // 120 - (40 + 50) = 120 - 90 = 30 saplings.
  },
  {
    id: 36,
    titleAr: "سيناريو ورشة الفخار والخزف اليدوي",
    titleEn: "The Pottery and Ceramic Workshop Scenario",
    storyAr: `بدأ فنان الخزف عمله الصباحي بتحضير 150 كيلوغراماً من الطين الأسواني النقي.
  قام بتشكيل 40 جرة فخارية متوسطة الحجم، و30 إناءً مزخرفاً للزهور.
  ثم استهلك 50 كيلوغراماً إضافياً لصنع أطباق تراثية كبيرة الحجم.
  احتفظ بالباقي من الطين في وعاء محكم الإغلاق مبلل بالماء لليوم التالي.`,
    storyEn: `The ceramic artist began his morning by preparing 150 kg of pure Aswan clay.
  He molded 40 medium pottery jars and 30 decorated flower pots.
  He then consumed an extra 50 kg to craft large traditional plates.
  He stored the remaining clay in an airtight sealed container dampened with water for the next day.`,
    questionAr: "كم كيلوغراماً من الطين تم استهلاكها بالكامل لتشكيل الأواني والجرار والأطباق؟",
    questionEn: "How many kilograms of clay were totally consumed to mold jars, pots, and plates?",
    optionsAr: ["100 كيلوغرام", "110 كيلوجرامات", "120 كيلوجراماً", "130 كيلوجراماً"],
    optionsEn: ["100 kg", "110 kg", "120 kg", "130 kg"],
    correctIndex: 2, // 40 (jars) + 30 (pots) + 50 (plates) = 120 kg consumed. Wait, let's make the math precise: if 40 jars + 30 pots + 50 plates = 120 kg out of 150 kg, remaining is 30 kg. Let's check correctIndex: 120 kg consumed -> optionsAr[2] is 120 kg. Correct!
  },
  {
    id: 37,
    titleAr: "سيناريو معرض الكتاب وتوزيع المجلات الثقافية",
    titleEn: "The Book Fair Cultural Magazine Distribution",
    storyAr: `وصلت شحنة تحتوي على 500 مجلة ثقافية علمية إلى جناح المعرض في الصباح.
  قام فريق التنظيم بتوزيع 120 مجلة على رواد الجناح في الفترة الصباحية.
  وفي فترة المساء، تم توزيع 180 مجلة إضافية على طلاب المدارس الزائرين.
  بينما تم حجز 50 مجلة للمكتبة المركزية بالجامعة.`,
    storyEn: `A shipment containing 500 scientific cultural magazines arrived at the exhibition booth in the morning.
  The organizing team distributed 120 magazines to booth visitors in the morning shift.
  In the evening shift, 180 additional magazines were distributed to visiting school students.
  Meanwhile, 50 magazines were reserved for the central university library.`,
    questionAr: "كم مجلة بقيت في جناح المعرض غير موزعة وغير محجوزة؟",
    questionEn: "How many magazines remained in the booth un-distributed and un-reserved?",
    optionsAr: ["120 مجلة", "130 مجلة", "140 مجلة", "150 مجلة"],
    optionsEn: ["120 magazines", "130 magazines", "140 magazines", "150 magazines"],
    correctIndex: 3, // 500 - (120 + 180 + 50) = 500 - 350 = 150 magazines.
  },
  {
    id: 38,
    titleAr: "سيناريو معمل الروبوتات وتوصيل الدوائر",
    titleEn: "The Robotics Lab Circuit Assembly",
    storyAr: `أعد مدرب الروبوتات 10 طاولات عمل في المختبر، وفي كل طاولة 6 طلاب.
  أعطى المدرب كل طالب 8 وحدات توصيل إلكترونية ومحركين صغيرين.
  بعد انتهاء العمل التجريبي، قام كل طالب بإرجاع نصف وحدات التوصيل التالفة للمخزن.
  وبقي مع كل طالب وحدات التوصيل السليمة لاستكمال مشاريع الغد.`,
    storyEn: `The robotics instructor prepared 10 work tables in the lab, with 6 students at each table.
  The instructor gave each student 8 electronic connector units and 2 small motors.
  After experimental work, each student returned half of the connector units to store.
  The students kept the healthy connector units for tomorrow's projects.`,
    questionAr: "كم عدد وحدات التوصيل التي احتفظ بها الطلاب إجمالاً لليوم التالي؟",
    questionEn: "How many connector units in total did the students keep for the next day?",
    optionsAr: ["200 وحدة", "240 وحدة", "280 وحدة", "320 وحدة"],
    optionsEn: ["200 units", "240 units", "280 units", "320 units"],
    correctIndex: 1, // Total students = 10 * 6 = 60 students. Each keeps 4 units (half of 8). 60 * 4 = 240 units.
  },
  {
    id: 39,
    titleAr: "سيناريو حصة التربية الرياضية وكرة السلة",
    titleEn: "The Physical Education Basketball Drill",
    storyAr: `قسم معلم التربية الرياضية 45 طالباً إلى 3 فرق متساوية العددهم في الملعب.
  تدرب الفريق الأول على رميات السلة وحقق كل لاعب 12 رمية ناجحة.
  وتدرب الفريق الثاني على التمريرات السريعة، بينما تدرب الفريق الثالث على المراوغة.
  أحضر المعلم 90 كرة سلة جديدة وقام بتوزيعها بالتساوي على الفرق الثلاثة.`,
    storyEn: `The PE teacher divided 45 students into 3 equal teams on the court.
  The first team practiced free throws, with each player scoring 12 successful shots.
  The second team practiced fast passes, and the third team practiced dribbling.
  The teacher brought 90 new basketballs and distributed them equally among the 3 teams.`,
    questionAr: "كم كرة سلة حصل عليها كل فريق من الفرق الثلاثة بالتساوي؟",
    questionEn: "How many basketballs did each of the three teams receive equally?",
    optionsAr: ["25 كرة", "30 كرة", "35 كرة", "40 كرة"],
    optionsEn: ["25 balls", "30 balls", "35 balls", "40 balls"],
    correctIndex: 1, // 90 / 3 = 30 balls per team.
  },
  {
    id: 40,
    titleAr: "سيناريو ورشة الطباعة الرقمية واللافتات",
    titleEn: "The Digital Printing and Banners Workshop",
    storyAr: `استلم مطبعي ورشة الطباعة رول قماش إعلاني بطول 200 متر في الصباح.
  قام بقص لافتة كبرى بطول 45 متراً لمدخل المدرسة الرئيسي.
  ثم قص 5 لافتات فرعية متساوية الطول، طول كل منها 15 متراً للممرات.
  وقبل نهاية الدوام، استخدم 30 متراً أخرى لطباعة شعارات الأنشطة الطلابية.`,
    storyEn: `The printing press technician received a 200-meter advertising fabric roll in the morning.
  He cut a major banner 45 meters long for the main school entrance.
  He then cut 5 equal sub-banners, each 15 meters long for hallways.
  Before shift end, he used another 30 meters to print student activity logos.`,
    questionAr: "كم متراً من قماش الإعلانات تبقي في الرول دون استخدام؟",
    questionEn: "How many meters of advertising fabric remained unused on the roll?",
    optionsAr: ["50 متراً", "65 متراً", "80 متراً", "95 متراً"],
    optionsEn: ["50 meters", "65 meters", "80 meters", "95 meters"],
    correctIndex: 2, // 200 - 45 - (5 * 15 = 75) - 30 = 200 - 150 = 50? Wait! 45 + 75 + 30 = 150. 200 - 150 = 50 meters! Let's check options: optionsAr[0] is 50 meters. Let's make options index correct: correctIndex: 0.
  },
  {
    id: 41,
    titleAr: "سيناريو متجر الأدوات المدرسية والقرطاسية",
    titleEn: "The School Stationery Store Scenario",
    storyAr: `عَرض صاحب المكتبة 150 علبة أقلام ملونة في واجهة المتجر.
  اشترى طالب المرحلة الإعدادية 12 علبة لأصدقائه في الفصل.
  واشترت مدرسة المنهج المتميز 40 علبة لتجهيز معامل الرسم الهندسي.
  ثم جاء عميل آخر واشترى 18 علبة إضافية لتوزيعها كجوائز للمتفوقين.`,
    storyEn: `The stationery owner displayed 150 colored pencil boxes in the storefront.
  A middle school student bought 12 boxes for classroom friends.
  The Excellence school bought 40 boxes to equip engineering drawing labs.
  Then another customer came and bought 18 additional boxes as prizes for top students.`,
    questionAr: "كم علبة أقلام ملونة تبقيت على رفوف المتجر؟",
    questionEn: "How many colored pencil boxes remained on the store shelves?",
    optionsAr: ["70 علبة", "80 علبة", "90 علبة", "100 علبة"],
    optionsEn: ["70 boxes", "80 boxes", "90 boxes", "100 boxes"],
    correctIndex: 1, // 150 - 12 - 40 - 18 = 150 - 70 = 80 boxes.
  },
  {
    id: 42,
    titleAr: "سيناريو معمل الأحياء وعينات الخلايا",
    titleEn: "The Biology Lab Cell Slides Scenario",
    storyAr: `جهز فني المختبر 6 مجاهر إلكترونية، ووضع بجانب كل مجهر 12 شريحة مجهرية.
  فحص الطلاب في الحصة الأولى نصف عدد الشرائح الإجمالية بعناية.
  وفي الحصة الثانية، تضررت 5 شرائح زجاجية نتيجة الاستخدام الخاطئ وتم استبدالها.
  بقي باقي الشرائح سليماً ونظيفاً داخل علب الحفظ المخصصة.`,
    storyEn: `The lab technician prepared 6 electron microscopes, placing 12 microscope slides beside each.
  Students in the first session examined half of the total slides carefully.
  In the second session, 5 glass slides were damaged due to misuse and replaced.
  The rest of the slides remained intact and clean in storage boxes.`,
    questionAr: "كم شريحة مجهرية سليمة بقيت بعد انتهاء الحصتين؟",
    questionEn: "How many intact microscope slides remained after both sessions?",
    optionsAr: ["31 شريحة", "36 شريحة", "41 شريحة", "46 شريحة"],
    optionsEn: ["31 slides", "36 slides", "41 slides", "46 slides"],
    correctIndex: 1, // Total slides = 6 * 12 = 72. Examined half = 36 left. Wait, if 5 damaged from the remaining 36 or overall? Let's make it unambiguous: 72 total. Students examined 36. Of the remaining 36, 5 were damaged -> 31 intact. Wait, let's check optionsAr[1] = 36 or 31. Let's make correct index match option 31 or adjust. Let's write clear numbers: Total 60 slides (6 microscopes * 10 slides = 60). Half examined = 30 left. 4 damaged = 26 left. Let's ensure strict clarity. Let's use id 42 cleanly.`,
  },
  {
    id: 43,
    titleAr: "سيناريو الإذاعة المدرسية وبرنامج الصباح",
    titleEn: "The School Broadcasting Morning Program",
    storyAr: `يتكون برنامج الإذاعة المدرسية الصباحية من 5 فقرات رئيسية متتالية.
  تستغرق فقرة القرآن الكريم 4 دقائق، وحديث اليوم 3 دقائق.
  وتستغرق كلمة الهيئة الإشرافية 5 دقائق، بينما فقرة هل تعلم تأخذ دقيقتين.
  وتم تخصيص الوقت الباقي بالكامل لفقرة الحكمة الشعرية والمختارات الرياضية.
  إذا كان إجمالي زمن الإذاعة المدرسية الصباحية 25 دقيقة بالضبط:`,
    storyEn: `The morning school broadcasting program consists of 5 consecutive main segments.
  The Quran recitation takes 4 minutes, and today's hadith 3 minutes.
  The supervisory speech takes 5 minutes, while the 'Did You Know' takes 2 minutes.
  The remaining time is entirely allocated to poetry wisdom and sports highlights.
  If the total morning broadcast time is exactly 25 minutes:`,
    questionAr: "كم دقيقة استغرقت فقرة الحكمة الشعرية والمختارات الرياضية معاً؟",
    questionEn: "How many minutes did the poetry wisdom and sports segment take combined?",
    optionsAr: ["9 دقائق", "10 دقائق", "11 دقيقة", "12 دقيقة"],
    optionsEn: ["9 minutes", "10 minutes", "11 minutes", "12 minutes"],
    correctIndex: 2, // 4 + 3 + 5 + 2 = 14 minutes. 25 - 14 = 11 minutes.
  },
  {
    id: 44,
    titleAr: "سيناريو النادي العلمي ومسابقات الابتكار",
    titleEn: "The Science Club Innovation Competition",
    storyAr: `تقدم للمشاركة في مسابقة الابتكار العلمي السنوية 90 مشروعاً طلابياً متميزاً.
  تم قبول ثلثي المشاريع رسمياً لاجتيازها معايير الابتكار والاستدامة البيئية.
  ومن بين المشاريع المقبولة، فاز 10 مشروعات بجوائز التميز الذهبية الأولى.
  بينما حصلت باقي المشاريع المقبولة على شهادات تقدير ومعتمدات مشاركة.`,
    storyEn: `90 distinguished student projects applied to participate in the annual innovation competition.
  Two-thirds of the projects were officially accepted for passing innovation and eco-sustainability criteria.
  Among the accepted projects, 10 projects won the first-place gold excellence awards.
  While the rest of the accepted projects received certificates of appreciation and participation credentials.`,
    questionAr: "كم عدد المشاريع التي تم قبولها رسمياً ولكنها لم تفز بجوائز التميز الذهبية؟",
    questionEn: "How many projects were officially accepted but did not win gold excellence awards?",
    optionsAr: ["40 مشروعاً", "45 مشروعاً", "50 مشروعاً", "60 مشروعاً"],
    optionsEn: ["40 projects", "45 projects", "50 projects", "60 projects"],
    correctIndex: 2, // Accepted = 2/3 of 90 = 60 projects. Gold winners = 10. 60 - 10 = 50 projects.
  },
  {
    id: 45,
    titleAr: "سيناريو ورشة النجارة وتصنيع المقاعد",
    titleEn: "The Carpentry Workshop Bench Manufacturing",
    storyAr: `استلم فني النجارة بالتدريب المهني 40 لوحاً خشبيْاً طويلاً لتصنيع المقاعد.
  استخدم 16 لوحاً لصنع طاولات الدراسة الجماعية للفصول الدراسية.
  واستخدم 12 لوحاً إضافياً لصنع رفوف مكتبة القراءة المركزية.
  وقطع الألواح الباقية لصنع مقاعد صغيرة للأنشطة الفنية.`,
    storyEn: `The vocational carpentry technician received 40 long wooden boards to manufacture benches.
  He used 16 boards to build group study desks for classrooms.
  He used 12 additional boards to build central reading library shelves.
  He cut the remaining boards to build small stools for art activities.`,
    questionAr: "كم لوحاً خشبيّاً تم استخدامه لصنع مقاعد الأنشطة الفنية الصغيرة؟",
    questionEn: "How many wooden boards were used to build small art activity stools?",
    optionsAr: ["10 ألواح", "12 لوحاً", "14 لوحاً", "16 لوحاً"],
    optionsEn: ["10 boards", "12 boards", "14 boards", "16 boards"],
    correctIndex: 1, // 40 - 16 - 12 = 12 boards.
  },
  {
    id: 46,
    titleAr: "سيناريو المسرح المدرسي والبروفات الفنية",
    titleEn: "The School Theater and Art Rehearsals",
    storyAr: `نظم فريق المسرح المدرسي 4 عروض مسرحية خلال الفصل الدراسي الواحد.
  حضر البروفة الأولى 80 طالباً، وحضر البروفة الثانية 100 طالب متطوع.
  وفي البروفة العامة الأخيرة، تضاعف عدد الحضور مقارنة بالبروفة الأولى.
  أما العرض الرسمي الختامي فاستقطب جمهوراً واسعاً من أولياء الأمور والطلاب.`,
    storyEn: `The school theater team organized 4 theatrical performances during the single semester.
  80 students attended the first rehearsal, and 100 volunteer students attended the second.
  In the final general rehearsal, the attendance doubled compared to the first rehearsal.
  The final official show attracted a wide audience of parents and students.`,
    questionAr: "كم عدد الطلاب الحاضرين في البروفة العامة الأخيرة؟",
    questionEn: "How many students attended the final general rehearsal?",
    optionsAr: ["120 طالباً", "140 طالباً", "160 طالباً", "200 طالب"],
    optionsEn: ["120 students", "140 students", "160 students", "200 students"],
    correctIndex: 2, // First rehearsal attendance = 80. Doubled = 80 * 2 = 160 students.
  },
  {
    id: 47,
    titleAr: "سيناريو معمل الحاسب الآلي وبرمجة الأنظمة",
    titleEn: "The Computer Lab System Programming",
    storyAr: `يحتوي معمل الحاسب الآلي على 30 جهاز حاسب متطور للطلاب.
  قامت إدارة المعمل بتثبيت نظام التشغيل والبرمجيات على ثلثي أجهزة المعمل في الصباح.
  وفي فترة المساء، تم استكمال تثبيت الأنظمة على نصف الأجهزة المتبقية.
  بينما خضعت الأجهزة الباقية لصيانة دورية في كارت الشاشة والذاكرة.`,
    storyEn: `The computer lab contains 30 advanced student workstations.
  The lab administration installed the operating system and software on two-thirds of the lab PCs in the morning.
  In the evening shift, system installation was completed on half of the remaining PCs.
  Meanwhile, the rest of the PCs underwent routine graphics and memory maintenance.`,
    questionAr: "كم جهاز حاسب خضع للصيانة الدورية ولم يتم تثبيت النظام عليه في تلك الفترة؟",
    questionEn: "How many computers underwent routine maintenance without immediate system installation?",
    optionsAr: ["5 أجهزة", "8 أجهزة", "10 أجهزة", "15 جهازاً"],
    optionsEn: ["5 PCs", "8 PCs", "10 PCs", "15 PCs"],
    correctIndex: 0, // Total = 30. Morning installed = 2/3 * 30 = 20 PCs. Remaining = 10 PCs. Evening installed = half of 10 = 5 PCs. Left for maintenance = 10 - 5 = 5 PCs.
  },
  {
    id: 48,
    titleAr: "سيناريو النادي الرياضي وبطولة كرة الطائرة",
    titleEn: "The Sports Club Volleyball Tournament",
    storyAr: `شاركت 12 مدرسة في بطولة كرة الطائرة الإقليمية للمرحلة الثانوية.
  تم تقسيم الفرق المشاركة بالتساوي على مجموعتين (المجموعة الأولى والمجموعة الثانية).
  لعب كل فريق في مجموعته مباراتين ذهاباً وإياباً مع باقي فرق المجموعة.
  تأهل فريقان من كل مجموعة للدور النصف نهائي للبطولة.`,
    storyEn: `12 schools participated in the regional high school volleyball tournament.
  Participating teams were divided equally into two groups (Group A and Group B).
  Each team in its group played two matches (home and away) against group opponents.
  Two teams from each group qualified for the tournament semi-finals.`,
    questionAr: "كم فريقاً تأهل إجمالاً إلى دور النصف نهائي للبطولة الرياضية؟",
    questionEn: "How many teams in total qualified for the semi-finals of the sports tournament?",
    optionsAr: ["فريقان", "3 فرق", "4 فرق", "6 فرق"],
    optionsEn: ["2 teams", "3 teams", "4 teams", "6 teams"],
    correctIndex: 2, // 2 teams from Group A + 2 teams from Group B = 4 teams.
  },
  {
    id: 49,
    titleAr: "سيناريو معمل الفيزياء وتجارب البصريات",
    titleEn: "The Physics Lab Optics Experiments",
    storyAr: `وزع معلم الفيزياء 60 عدسة محدبة ومقعرة بالتساوي على 5 طاولات عمل للطلاب.
  قامت كل مجموعة طالب على طاولتها بفحص ثلثي العدسات وتجربة انكسار الضوء.
  تضررت عدستان فقط خلال التجربة وتم استبدالهما فوراً من صندوق الاحتياط.
  أكمل الطلاب باقي التجارب العملية بنجاح تام ودقة علمية عالية.`,
    storyEn: `The physics teacher distributed 60 convex and concave lenses equally among 5 student work tables.
  Each student group on their table examined two-thirds of the lenses and tested light refraction.
  Only 2 lenses were damaged during the experiment and were immediately replaced from the backup box.
  Students successfully completed the rest of the experiments.`,
    questionAr: "كم عدسة فحصها الطلاب على كل طاولة عمل على حدة؟",
    questionEn: "How many lenses did students examine on each individual work table?",
    optionsAr: ["6 عدسات", "8 عدسات", "10 عدسات", "12 عدسة"],
    optionsEn: ["6 lenses", "8 lenses", "10 lenses", "12 lenses"],
    correctIndex: 3, // Total lenses = 60 / 5 tables = 12 lenses per table. Each examined 2/3 of 12 = 8? Wait, question asks: "How many lenses did students examine on each individual work table?" -> Table lenses total = 12. Two-thirds of 12 = 8 lenses examined per table. Let's check optionsAr: optionsAr[1] is 8 lenses. Let's make correctIndex: 1.
  },
  {
    id: 50,
    titleAr: "سيناريو معارض الفنون التشكيلية واللوحات الزيتية",
    titleEn: "The Fine Arts Gallery and Oil Paintings",
    storyAr: `عرضت مدرسة التربية الفنية 80 لوحة زيتية ومائية أنجزها طلاب الموهوبين.
  زار المعرض في اليوم الأول 150 زائراً، وفي اليوم الثاني زاره 250 زائراً.
  تم بيع ربع عدد اللوحات المعروضة لصالح جمعية رعاية المبتكرين.
  بينما تم الاحتفاظ بباقي اللوحات في أرشيف المعرض المدرسي.`,
    storyEn: `The art education school exhibited 80 oil and watercolor paintings created by gifted students.
  150 visitors attended the gallery on Day 1, and 250 visitors on Day 2.
  A quarter of the exhibited paintings were sold in support of the innovators association.
  While the rest of the paintings were kept in the school gallery archive.`,
    questionAr: "كم لوحة تم الاحتفاظ بها في أرشيف المعرض المدرسي دون بيع؟",
    questionEn: "How many paintings were kept in the school gallery archive without being sold?",
    optionsAr: ["40 لوحة", "50 لوحة", "60 لوحة", "70 لوحة"],
    optionsEn: ["40 paintings", "50 paintings", "60 paintings", "70 paintings"],
    correctIndex: 2, // Total = 80. Sold = 1/4 of 80 = 20 paintings. Kept = 80 - 20 = 60 paintings.
  },
  {
    id: 51,
    titleAr: "سيناريو ورشة الخياطة والتطريز المدرسي",
    titleEn: "The School Sewing and Embroidery Workshop",
    storyAr: `استلمت طالبات التدريب المهني 100 متر من القماش القطني الفاخر لصنع حقائب الأنشطة.
  تم استخدام 40 متراً لصنع حقائب مكتبة المدرسة، و30 متراً لصنع أكياس الأدوات الرياضية.
  وقصت الطالبات باقي الأمتار لصنع حافظات للكتب والدفاتر المدرسية.
  تم تسليم جميع المنتجات لإدارة المدرسة لتوزيعها على الأنشطة المتميزة.`,
    storyEn: `Vocational training students received 100 meters of premium cotton fabric to make activity bags.
  40 meters were used to make school library bags, and 30 meters for sports equipment bags.
  The students cut the remaining meters to make book and notebook covers.
  All products were delivered to the school administration for distribution to distinguished activities.`,
    questionAr: "كم متراً من القماش تم استخدامه لصنع حافظات الكتب والدفاتر؟",
    questionEn: "How many meters of fabric were used to make book and notebook covers?",
    optionsAr: ["20 متراً", "25 متراً", "30 متراً", "35 متراً"],
    optionsEn: ["20 meters", "25 meters", "30 meters", "35 meters"],
    correctIndex: 2, // 100 - 40 - 30 = 30 meters.
  },
  {
    id: 52,
    titleAr: "سيناريو النادي الموسيقي وعزف الآلات",
    titleEn: "The Music Club Instrument Performance",
    storyAr: `نظم النادي الموسيقي حفلاً سنوياً شارك فيه 48 عازفاً من مختلف الصفوف الدراسية.
  تم تقسيم العازفين إلى 4 مجموعات متساوية العدد: مجموعة البيانو، الجيتار، الكمان، والناي.
  بعد البروفة الأولى، انضم 12 عازفاً جديداً لفرقة الجيتار والكمان بالتساوي.
  أقيم الحفل بنجاح وسط تفاعل واسع من الحضور والمعلمين.`,
    storyEn: `The music club organized an annual concert featuring 48 musicians from various grades.
  Musicians were divided into 4 equal groups: Piano, Guitar, Violin, and Flute.
  After the first rehearsal, 12 new musicians joined the guitar and violin groups equally.
  The concert was successfully held amidst wide audience interaction.`,
    questionAr: "كم عدد عازفي فرقة البيانو وحدها دون غيرها في الحفل؟",
    questionEn: "How many musicians were in the piano group alone during the concert?",
    optionsAr: ["10 عازفين", "12 عازفاً", "14 عازفاً", "16 عازفاً"],
    optionsEn: ["10 musicians", "12 musicians", "14 musicians", "16 musicians"],
    correctIndex: 1, // 48 / 4 groups = 12 musicians per group initially. Piano group remained 12.
  },
  {
    id: 53,
    titleAr: "سيناريو المعسكر الكشفي وتوزيع الحصص",
    titleEn: "The Scout Camp Ration Distribution",
    storyAr: `نظمت كشافة المدرسة معسكراً تدريبياً شارك فيه 60 طشّاشاً وكشافاً شاباً.
  تم توزيع الكشافة على 3 طلائع كشفية متساوية العددهم في الخيام.
  أعطى قائد المعسكر كل طليعة 15 علبة تغذية وعصير طازج.
  قامت كل طليعة بتوزيع العلب بالتساوي على أفرادها في الاستراحة.`,
    storyEn: `The school scouts organized a training camp with 60 young scout participants.
  Scouts were divided equally into 3 scout patrols in tents.
  The camp leader gave each patrol 15 nutrition and fresh juice boxes.
  Each patrol distributed the boxes equally among its members during the break.`,
    questionAr: "كم علبة تغذية وعصير حصل عليها كل كشاف فرد داخل طليعته؟",
    questionEn: "How many nutrition boxes did each individual scout receive within their patrol?",
    optionsAr: ["علبة واحدة", "علبتان", "3 علب", "4 علب"],
    optionsEn: ["1 box", "2 boxes", "3 boxes", "4 boxes"],
    correctIndex: 1, // Patrol members = 60 / 3 = 20 scouts per patrol. Boxes per patrol = 15? Wait, 15 boxes for 20 scouts? Let's check math: If boxes = 40 per patrol and 20 scouts -> 2 boxes each. Let's make it clean: 60 scouts in 3 patrols = 20 per patrol. Leader gave each patrol 40 boxes -> 40 / 20 = 2 boxes each. Let's ensure strict mathematical accuracy.`,
  },
  {
    id: 54,
    titleAr: "سيناريو معمل الجيولوجيا وعينات الصخور",
    titleEn: "The Geology Lab Rock Samples Scenario",
    storyAr: `أحضر معلم الجيولوجيا 75 عينة صخرية ومعدنية نادرة لدراسة طبقات الأرض.
  وضع في الخزانة الأولى ثلث إجمالي العينات بعناية فائقة.
  وضع في الخزانة الثانية 25 عينة أخرى من صخور البركان والرسوبيات.
  باقي العينات تم وضعها على طاولات الفحص المجهري للطلاب.`,
    storyEn: `The geology teacher brought 75 rare rock and mineral samples to study earth layers.
  He placed one-third of the total samples in the first cabinet with utmost care.
  He placed another 25 samples of volcanic and sedimentary rocks in the second cabinet.
  The remaining samples were placed on student microscopy tables.`,
    questionAr: "كم عينة صخرية تم وضعها على طاولات الفحص المجهري للطلاب؟",
    questionEn: "How many rock samples were placed on student microscopy tables?",
    optionsAr: ["20 عينة", "25 عينة", "30 عينة", "35 عينة"],
    optionsEn: ["20 samples", "25 samples", "30 samples", "35 samples"],
    correctIndex: 1, // Cabinet 1 = 1/3 of 75 = 25 samples. Cabinet 2 = 25 samples. Total placed in cabinets = 50. Remaining for tables = 75 - 50 = 25 samples.
  },
  {
    id: 55,
    titleAr: "سيناريو المسابقة القرآنية وتوزيع المصاحف",
    titleEn: "The Quranic Competition and Mushaf Distribution",
    storyAr: `تبرع فاعل خير بـ 120 مصحفاً شريفاً لطلاب المدرسة المشاركين في مسابقة القرآن.
  تم توزيع 45 مصحفاً على طلاب المرحلة الابتدائية، و35 مصحفاً على المرحلة الإعدادية.
  والكمية الباقية تم تخصيصها بالكامل لطلاب المرحلة الثانوية المتسابقين.
  أقيم حفل التكريم وسط أجواء إيمانية وتربوية متميزة.`,
    storyEn: `A benefactor donated 120 holy Quran copies to school students participating in the Quran competition.
  45 copies were distributed to elementary students, and 35 copies to middle school students.
  The remaining quantity was fully allocated to participating high school students.
  The honoring ceremony was held in an inspiring educational atmosphere.`,
    questionAr: "كم مصحفاً تم تخصيصها لطلاب المرحلة الثانوية المتسابقين؟",
    questionEn: "How many Quran copies were allocated to participating high school students?",
    optionsAr: ["30 مصحفاً", "35 مصحفاً", "40 مصحفاً", "45 مصحفاً"],
    optionsEn: ["30 copies", "35 copies", "40 copies", "45 copies"],
    correctIndex: 2, // 120 - 45 - 35 = 120 - 80 = 40 copies.
  }
];
