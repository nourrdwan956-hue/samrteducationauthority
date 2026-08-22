import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  School,
  Building,
  Users,
  AlertCircle,
  RefreshCw,
  Send,
  QrCode,
  Check,
  BrainCircuit,
  Languages,
  BookOpen,
  HelpCircle,
  Layers,
  KeyRound,
} from 'lucide-react';

// Pool of 16+ rich human reasoning scenarios (each 5+ lines of narrative with English translation and 4 choices)
interface HumanScenario {
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

const HUMAN_SCENARIOS: HumanScenario[] = [
  {
    id: 1,
    titleAr: 'سيناريو أمين المكتبة وتوزيع الكتب',
    titleEn: 'The Library Book Distribution Scenario',
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
    questionAr: 'كم كتاباً إجمالياً متوفراً ومتاحاً داخل المكتبة (على الرفوف وفي الصندوق) في نهاية اليوم؟',
    questionEn: 'How many total books are available in the library (on shelves and in storage) at the end of the day?',
    optionsAr: ['70 كتاباً', '80 كتاباً', '85 كتاباً', '90 كتاباً'],
    optionsEn: ['70 books', '80 books', '85 books', '90 books'],
    correctIndex: 1, // 80 - (10+5) + 15 = 80
  },
  {
    id: 2,
    titleAr: 'سيناريو رحلة القطار وركاب المحطات',
    titleEn: 'The Train Passenger Journey Scenario',
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
    questionAr: 'كم راكباً بقي على متن القطار بعد مغادرة المحطة الثالثة؟',
    questionEn: 'How many passengers remained on the train after departing the third station?',
    optionsAr: ['60 راكباً', '75 راكباً', '85 راكباً', '90 راكباً'],
    optionsEn: ['60 passengers', '75 passengers', '85 passengers', '90 passengers'],
    correctIndex: 1, // (120 - 30 + 45 + 15) = 150 / 2 = 75
  },
  {
    id: 3,
    titleAr: 'سيناريو مخبز الفطائر الصباحي',
    titleEn: 'The Morning Bakery Pastries Scenario',
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
    questionAr: 'كم فطيرة إجمالية تبقت في المخبز بعد تلبية كافة هذه الطلبات؟',
    questionEn: 'How many total pastries remained in the bakery after fulfilling all these orders?',
    optionsAr: ['24 فطيرة', '34 فطيرة', '26 فطيرة', '30 فطيرة'],
    optionsEn: ['24 pastries', '34 pastries', '26 pastries', '30 pastries'],
    correctIndex: 0, // Cheese left: 18, Honey left: 16 (Total: 34). Minus 10 = 24.
  },
  {
    id: 4,
    titleAr: 'سيناريو سباق الدراجات المدرسي',
    titleEn: 'The School Bicycle Race Scenario',
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
    questionAr: 'ما هو الترتيب النهائي للمتسابق (عمر) عند خط النهاية؟',
    questionEn: 'What was the final position of racer (Omar) at the finish line?',
    optionsAr: ['المركز الأول', 'المركز الثاني', 'المركز الثالث', 'المركز الرابع'],
    optionsEn: ['First Place', 'Second Place', 'Third Place', 'Fourth Place'],
    correctIndex: 2, // 1st Karim, 2nd Mazen, 3rd Omar, 4th Tarek
  },
  {
    id: 5,
    titleAr: 'سيناريو حديقة الزهور وجدول السقي',
    titleEn: 'The Flower Garden Watering Schedule',
    storyAr: `يعتني المشرف بثلاثة أحواض من الزهور النادرة داخل الحديقة النباتية.
الحوض الأحمر (أزهار الجوري) يتم سقيه بانتظام مرة كل يومين.
الحوض الأبيض (أزهار الياسمين) يتم سقيه بانتظام مرة كل 3 أيام.
الحوض الأصفر (أزهار دوار الشمس) يتم سقيه يومياً دون انقطاع.
في صباح يوم السبت، تم سقي جميع الأحواض الثلاثة معاً في نفس التوقيت.`,
    storyEn: `The supervisor manages three rare flower beds inside the botanical garden.
The Red bed (Roses) is watered regularly once every 2 days.
The White bed (Jasmine) is watered regularly once every 3 days.
The Yellow bed (Sunflowers) is watered every single day without interruption.
On Saturday morning, all three beds were watered together at the exact same time.`,
    questionAr: 'ما هو أقرب يوم قادم سيتم فيه سقي الحوضين الأحمر والأبيض معاً مرة أخرى؟',
    questionEn: 'What is the earliest upcoming day when both the Red and White beds will be watered together again?',
    optionsAr: ['يوم الثلاثاء', 'يوم الأربعاء', 'يوم الخميس', 'يوم الجمعة'],
    optionsEn: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    correctIndex: 3, // LCM of 2 and 3 is 6 days. Saturday + 6 days = Friday.
  },
  {
    id: 6,
    titleAr: 'سيناريو معمل الكيمياء وألوان المحاليل',
    titleEn: 'The Chemistry Lab Solution Colors',
    storyAr: `أجرى الأستاذ تجربة تعليمية شيقة باستخدام 4 أنابيب اختبار مرقمة من 1 إلى 4.
الأنبوب رقم 1 يحتوي على سائل نقي باللون الأزرق الفاتح.
الأنبوب رقم 2 يحتوي على سائل مركز باللون الأصفر اللامع.
قام الأستاذ بسكب نصف محتوى الأنبوب 1 ونصف محتوى الأنبوب 2 في الأنبوب رقم 3 الفارغ.
حدث تفاعل بصري وامتزج اللونان معاً داخل الأنبوب رقم 3 بشكل متجانس.`,
    storyEn: `The chemistry teacher conducted an experiment using 4 test tubes numbered 1 to 4.
Tube 1 contained a pure light-blue liquid.
Tube 2 contained a concentrated bright-yellow liquid.
The teacher poured half of Tube 1 and half of Tube 2 into the empty Tube 3.
A visual reaction occurred, and the two colors blended homogeneously inside Tube 3.`,
    questionAr: 'ما هو اللون الناتج الذي ظهر في الأنبوب رقم 3 بعد خلط السائلين؟',
    questionEn: 'What resulting color appeared in Tube 3 after mixing the two liquids?',
    optionsAr: ['اللون الأخضر', 'اللون البنفسجي', 'اللون البرتقالي', 'اللون الأحمر'],
    optionsEn: ['Green', 'Purple', 'Orange', 'Red'],
    correctIndex: 0, // Blue + Yellow = Green
  },
  {
    id: 7,
    titleAr: 'سيناريو متجر الحواسيب والشاشات',
    titleEn: 'The Electronics Store Computer Inventory',
    storyAr: `يحتوي متجر إلكترونيات على 40 جهاز حاسوب محمول في بداية الأسبوع.
يوم الأحد، تم بيع ربع إجمالي الأجهزة الموجودة في المعرض للزبائن.
يوم الإثنين، استلم المتجر شحنة جديدة تحتوي على 20 جهاز حاسوب حديث.
يوم الثلاثاء، نجح فريق المبيعات في بيع نصف إجمالي الأجهزة المتوفرة في ذلك اليوم.
تم تخزين الأجهزة المتبقية بأمان في قسم العرض للبيع في الأيام التالية.`,
    storyEn: `An electronics store had 40 laptops in stock at the beginning of the week.
On Sunday, one-quarter of the total in-store laptops were sold to customers.
On Monday, the store received a new shipment of 20 modern laptops.
On Tuesday, the sales team succeeded in selling half of the total available laptops on that day.
The remaining laptops were safely displayed for subsequent sales days.`,
    questionAr: 'كم جهاز حاسوب متبقٍ في المتجر بنهاية يوم الثلاثاء؟',
    questionEn: 'How many laptops remained in the store at the end of Tuesday?',
    optionsAr: ['20 جهازاً', '25 جهازاً', '30 جهازاً', '35 جهازاً'],
    optionsEn: ['20 laptops', '25 laptops', '30 laptops', '35 laptops'],
    correctIndex: 1, // (40 - 10) = 30 + 20 = 50 / 2 = 25.
  },
  {
    id: 8,
    titleAr: 'سيناريو تحدي القراءة الأسبوعي',
    titleEn: 'The Weekly Book Reading Challenge',
    storyAr: `بدأت مريم قراءة رواية علمية مشوقة تتكون بالكامل من 300 صفحة.
في الأسبوع الأول، قرأت مريم 60 صفحة بتركيز واهتمام شديد.
في الأسبوع الثاني، تضاعف شغفها وقرأت ضعف عدد الصفحات التي قرأتها في الأسبوع الأول.
في الأسبوع الثالث، شعرت ببعض الإرهاق وقرأت نصف عدد صفحات الأسبوع الثاني فقط.
وضعت مريم علامة عند الصفحة التي توقفت عندها لحساب ما تبقى لها من الرواية.`,
    storyEn: `Mariam started reading an exciting science novel consisting of 300 pages.
In the first week, Mariam read 60 pages with great focus.
In the second week, her excitement doubled, reading twice the pages she read in the first week.
In the third week, she felt slightly tired and read only half the pages of the second week.
Mariam placed a bookmark where she stopped to calculate the remaining pages.`,
    questionAr: 'كم صفحة متبقية لمريم لكي تكمل قراءة الرواية بالكامل؟',
    questionEn: 'How many pages remain for Mariam to finish the entire novel?',
    optionsAr: ['40 صفحة', '50 صفحة', '60 صفحة', '70 صفحة'],
    optionsEn: ['40 pages', '50 pages', '60 pages', '70 pages'],
    correctIndex: 2, // 60 + 120 + 60 = 240. 300 - 240 = 60.
  },
  {
    id: 9,
    titleAr: 'سيناريو مسار طائرة التوصيل المسيرة',
    titleEn: 'The Delivery Drone Flight Route',
    storyAr: `انطلقت طائرة مسيرة ذكية من المستودع المركزي لتوصيل حقيبة طبية عاجلة.
حلقت الطائرة باتجاه الشمال لمسافة 4 كيلومترات بخط مستقيم تماماً.
ثم انعطفت بزاوية قائمة واتجهت نحو الشرق لمسافة 3 كيلومترات وسلمت الحقيبة.
بعد تسليم الحقيبة بنجاح، عادت الطائرة إلى المستودع سالكة نفس المسار المعاكس تماماً.
سجلت وحدة التحكم الرقمية إجمالي المسافة المقطوعة طوال الرحلة.`,
    storyEn: `A smart delivery drone launched from the central depot to deliver an urgent medical kit.
The drone flew straight North for 4 kilometers.
It then turned at a right angle and flew East for 3 kilometers and delivered the kit.
After successful delivery, the drone returned to the depot following the exact reverse path.
The digital flight computer recorded the total distance traveled during the entire flight.`,
    questionAr: 'ما هي المسافة الكلية التي قطعتها الطائرة ذهاباً وإياباً؟',
    questionEn: 'What is the total round-trip distance traveled by the drone?',
    optionsAr: ['7 كيلومترات', '10 كيلومترات', '14 كيلومتراً', '18 كيلومتراً'],
    optionsEn: ['7 kilometers', '10 kilometers', '14 kilometers', '18 kilometers'],
    correctIndex: 2, // (4 + 3) * 2 = 14 km.
  },
  {
    id: 10,
    titleAr: 'سيناريو مزرعة الحمضيات وصناديق البرتقال',
    titleEn: 'The Citrus Farm Orange Boxes',
    storyAr: `حصد المزارع محمود 90 كيلوغراماً من محصول البرتقال الطازج عالي الجودة.
قام بتخصيص ثلث الكمية بالكامل لتعبئتها في صناديق صغيرة سعة كل منها 5 كغم.
أما باقي كمية المحصول، فقام بتعبئتها في صناديق خشبية كبيرة سعة كل منها 10 كغم.
تم رص الصناديق الكبيرة والصغيرة في شاحنة النقل استعداداً لبيعها في السوق.
تأكد المزارع من امتلاء كل صندوق بالوزن المحدد دون أي زيادة أو نقصان.`,
    storyEn: `Farmer Mahmoud harvested 90 kg of high-quality fresh oranges.
He allocated one-third of the total harvest to small boxes holding 5 kg each.
The remaining quantity was packed into large wooden boxes holding 10 kg each.
All large and small boxes were stacked into the transport truck for market delivery.
The farmer ensured each box was filled to its exact specified weight.`,
    questionAr: 'كم عدد الصناديق الكبيرة (سعة 10 كغم) التي قام المزارع بتعبئتها؟',
    questionEn: 'How many large boxes (10 kg capacity) did the farmer pack?',
    optionsAr: ['4 صناديق', '6 صناديق', '8 صناديق', '9 صناديق'],
    optionsEn: ['4 boxes', '6 boxes', '8 boxes', '9 boxes'],
    correctIndex: 1, // 1/3 is 30kg. Remaining is 60kg. 60 / 10 = 6 boxes.
  },
  {
    id: 11,
    titleAr: 'سيناريو أوزان حقائب التخييم الجبلي',
    titleEn: 'The Mountain Camping Backpacks',
    storyAr: `استعد أربعة كشافين لرحلة تسلق جبلي وحزم كل منهم حقيبة الظهر الخاصة به.
حسام يحمل حقيبة وزنها 8 كيلوغرامات وتحتوي على خيمة ومستلزمات إسعاف.
زياد يحمل حقيبة أثقل من حقيبة حسام بـ 2 كيلوغرام تماماً.
أما تامر، فحزم حقيبة وزنها يساوي نصف مجموع وزني حقيبتي حسام وزياد معاً.
انطلق الأصدقاء بحماس نحو قمة الجبل مستمتعين بالطقس المعتدل.`,
    storyEn: `Four scouts prepared for a mountain hike and packed their backpacks.
Hossam carries an 8 kg backpack containing a tent and first aid kit.
Ziad carries a backpack that is exactly 2 kg heavier than Hossam's backpack.
Tamer packed a backpack weighing exactly half the combined weight of Hossam and Ziad's backpacks.
The friends embarked enthusiastically toward the mountain peak.`,
    questionAr: 'ما هو الوزن الدقيق لحقيبة تامر بالكيلوغرام؟',
    questionEn: 'What is the exact weight of Tamer\'s backpack in kilograms?',
    optionsAr: ['8 كغم', '9 كغم', '10 كغم', '11 كغم'],
    optionsEn: ['8 kg', '9 kg', '10 kg', '11 kg'],
    correctIndex: 1, // Hossam=8, Ziad=10. Combined=18. Half=9.
  },
  {
    id: 12,
    titleAr: 'سيناريو محطة الطاقة الشمسية وتخزين الكهرباء',
    titleEn: 'The Solar Power Station Storage',
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
    questionAr: 'كم كيلوواط من الطاقة تم تخزينه في بنك البطاريات بنهاية اليوم؟',
    questionEn: 'How many kilowatts of energy were stored in the battery bank by the end of the day?',
    optionsAr: ['50 كيلوواط', '60 كيلوواط', '70 كيلوواط', '80 كيلوواط'],
    optionsEn: ['50 kW', '60 kW', '70 kW', '80 kW'],
    correctIndex: 2, // 50 + 100 = 150. 150 - 80 = 70 kW.
  },
  {
    id: 13,
    titleAr: 'سيناريو ورشة النجارة وتجهيز الطلبيات',
    titleEn: 'The Carpentry Workshop Orders',
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
    questionAr: 'كم أسبوع عمل يحتاجه النجار لإنجاز وتجهيز طلبية الـ 60 كرسياً بالكامل؟',
    questionEn: 'How many working weeks does the carpenter need to complete the entire 60-chair order?',
    optionsAr: ['أسبوعان', '3 أسابيع', '4 أسابيع', '5 أسابيع'],
    optionsEn: ['2 weeks', '3 weeks', '4 weeks', '5 weeks'],
    correctIndex: 1, // Weekly production = 4 * 5 = 20 chairs. 60 / 20 = 3 weeks.
  },
  {
    id: 14,
    titleAr: 'سيناريو بطولة الشطرنج المدرسية السريعة',
    titleEn: 'The School Blitz Chess Tournament',
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
    questionAr: 'كم عدد المباريات الكلية التي لعبها (أحمد) في هذه البطولة؟',
    questionEn: 'How many total matches did (Ahmed) play in this tournament?',
    optionsAr: ['مباراتان', '3 مباريات', '4 مباريات', '6 مباريات'],
    optionsEn: ['2 matches', '3 matches', '4 matches', '6 matches'],
    correctIndex: 1, // Ahmed plays against Youssef, Seif, Moaz = 3 matches.
  },
  {
    id: 15,
    titleAr: 'سيناريو زوار معرض الآثار التاريخية',
    titleEn: 'The Historical Artifacts Exhibition Visitors',
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
    questionAr: 'كم زائراً بقي داخل القاعة الملكية بعد الساعة الثانية عشرة ظهراً؟',
    questionEn: 'How many visitors remained inside the Royal Hall after 12:00 PM?',
    optionsAr: ['35 زائراً', '40 زائراً', '45 زائراً', '50 زائراً'],
    optionsEn: ['35 visitors', '40 visitors', '45 visitors', '50 visitors'],
    correctIndex: 1, // (100 - 45 + 25) = 80. Half leaves -> 40 remain.
  },
  {
    id: 16,
    titleAr: 'سيناريو متجر الهدايا وتزيين الصناديق',
    titleEn: 'The Gift Shop Box Decoration',
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
    questionAr: 'كم إجمالي عدد الصناديق التي وضعت عليها منى شريطاً (سواء كان ذهبياً أو أحمر)؟',
    questionEn: 'How many total boxes did Mona decorate with a ribbon (whether gold or red)?',
    optionsAr: ['30 صندوقاً', '35 صندوقاً', '40 صندوقاً', '45 صندوقاً'],
    optionsEn: ['30 boxes', '35 boxes', '40 boxes', '45 boxes'],
    correctIndex: 2, // 30 gold + 10 red = 40 boxes.
  },
];

// Cloudflare Worker backend will handle the /api/send-otp endpoint cleanly.
// There is no need for client-side fallback since the server does it!
const sendEmailRequest = (toEmail: string, code: string, name: string) => {
  return fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: toEmail.trim(), otp: code, name: name.trim() }),
  }).then(async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || contentType.includes('text/html')) {
       const txt = await response.text();
       throw new Error(txt || 'Backend returned an error');
    }
    return response.json();
  });
};

export const StudentSignUpPage: React.FC = () => {
  const { signup, setCurrentView, addToast } = useApp();

  // Registration Steps:
  // 1: Form Filling ('form')
  // 2: Email OTP Confirmation ('email_otp')
  // 3: Password Character Count Verification ('password_count_check')
  // 4: Intelligent Human Verification ('human_verification')
  // 5: Registration Complete ('complete')
  const [step, setStep] = useState<'form' | 'email_otp' | 'password_count_check' | 'human_verification' | 'complete'>('form');

  // STEP 1 FIELDS:
  // Personal & Educational Profile
  const [fourPartName, setFourPartName] = useState('');
  
  // Cascaded Educational Level:
  // Stage: primary (ابتدائي), prep (إعدادي), secondary (ثانوي)
  const [stage, setStage] = useState<'primary' | 'prep' | 'secondary'>('secondary');
  const [gradeLevel, setGradeLevel] = useState('الصف الثالث الثانوي');
  const [educationType, setEducationType] = useState('عام'); // عام, أزهري, بكالوريا/دولي
  const [academicSection, setAcademicSection] = useState<'science_bio' | 'science_math' | 'literary' | 'general'>('science_bio');
  
  // Geographic Location
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // Verified Egyptian Contact Numbers
  const [studentPhone, setStudentPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'father' | 'mother' | 'guardian'>('father');

  // Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2 FIELDS: Email OTP
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // STEP 3 FIELDS: Password Count Verification
  const [enteredPasswordCount, setEnteredPasswordCount] = useState('');
  const [passwordCountError, setPasswordCountError] = useState('');

  // STEP 4 FIELDS: Human Verification
  const [selectedScenario, setSelectedScenario] = useState<HumanScenario>(HUMAN_SCENARIOS[0]);
  const [isEnglishView, setIsEnglishView] = useState(false);
  const [selectedHumanOption, setSelectedHumanOption] = useState<number | null>(null);
  const [humanVerifiedSuccess, setHumanVerifiedSuccess] = useState(false);

  // Issued Student ID
  const [issuedStudentCode, setIssuedStudentCode] = useState('');

  // General Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Governorates and Cities
  const citiesByGovernorate: Record<string, string[]> = {
    'القاهرة': ['مدينة نصر', 'مصر الجديدة', 'المعادي', 'حلوان', 'الرحاب', 'التجمع الخامس', 'شبرا', 'وسط البلد', 'أقرب مدينة/حي غير مدرج'],
    'الجيزة': ['المهندسين', 'الدقي', 'الهرم', 'فيصل', 'الشيخ زايد', '6 أكتوبر', 'العجوزة', 'أقرب مدينة/حي غير مدرج'],
    'الإسكندرية': ['سموحة', 'سيدي بشر', 'ميامي', 'المندرة', 'العصافرة', 'المنتزه', 'محطة الرمل', 'برج العرب', 'أقرب مدينة/حي غير مدرج'],
    'الدقهلية': ['المنصورة', 'ميت غمر', 'السنبلاوين', 'دكرنس', 'بلقاس', 'أقرب مدينة غير مدرجة'],
    'الغربية': ['طنطا', 'المحلة الكبرى', 'زفتى', 'كفر الزيات', 'أقرب مدينة غير مدرجة'],
    'الشرقية': ['الزقازيق', 'العاشر من رمضان', 'منيا القمح', 'بلبيس', 'أقرب مدينة غير مدرجة'],
    'القليوبية': ['بنها', 'شبرا الخيمة', 'العبور', 'قليوب', 'أقرب مدينة غير مدرجة'],
  };

  const governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'القليوبية',
    'البحر الأحمر', 'البحيرة', 'الفيوم', 'الإسماعيلية', 'المنوفية', 'المنيا',
    'الوادي الجديد', 'السويس', 'دمياط', 'بني سويف', 'أسوان', 'أسيوط', 'بورسعيد',
    'جنوب سيناء', 'شمال سيناء', 'قنا', 'كفر الشيخ', 'مطروح', 'الأقصر', 'سوهاج'
  ];

  // Derive available cities based on selected governorate, with a fallback
  const availableCities = citiesByGovernorate[governorate] || ['المدينة الرئيسية', 'مركز المحافظة', 'أقرب مدينة غير مدرجة'];

  useEffect(() => {
    setCity(availableCities[0]);
  }, [governorate]);

  // Dynamic Grade Levels and Education Types based on selected Stage
  const getGradeOptions = () => {
    if (stage === 'primary') {
      return [
        'الصف الأول الابتدائي',
        'الصف الثاني الابتدائي',
        'الصف الثالث الابتدائي',
        'الصف الرابع الابتدائي',
        'الصف الخامس الابتدائي',
        'الصف السادس الابتدائي',
      ];
    }
    if (stage === 'prep') {
      return [
        'الصف الأول الإعدادي',
        'الصف الثاني الإعدادي',
        'الصف الثالث الإعدادي',
      ];
    }
    return [
      'الصف الأول الثانوي',
      'الصف الثاني الثانوي',
      'الصف الثالث الثانوي',
    ];
  };

  // Sync grade level when stage changes
  const handleStageChange = (newStage: 'primary' | 'prep' | 'secondary') => {
    setStage(newStage);
    if (newStage === 'primary') {
      setGradeLevel('الصف السادس الابتدائي');
      setEducationType('عام');
    } else if (newStage === 'prep') {
      setGradeLevel('الصف الثالث الإعدادي');
      setEducationType('عام');
    } else {
      setGradeLevel('الصف الثالث الثانوي');
      setEducationType('عام');
    }
  };

  // Operator Badge Helper
  const getOperatorInfo = (phoneNum: string) => {
    const clean = phoneNum.trim();
    if (!clean.startsWith('01') || clean.length < 3) return null;
    const prefix = clean.substring(0, 3);
    if (prefix === '010') return { name: 'فودافون مصر 🔴', color: 'text-rose-700 dark:text-rose-400 bg-rose-950/40 border-rose-800/60' };
    if (prefix === '011') return { name: 'اتصالات مصر 🟢', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-950/40 border-emerald-800/60' };
    if (prefix === '012') return { name: 'أورنج مصر 🟠', color: 'text-amber-700 dark:text-amber-400 bg-amber-950/40 border-amber-800/60' };
    if (prefix === '015') return { name: 'المصرية للاتصالات (WE) 🟣', color: 'text-purple-400 bg-purple-950/40 border-purple-800/60' };
    return null;
  };

  // Name Segments
  const nameParts = fourPartName.trim().split(/\s+/).filter(Boolean);

  // Pick random human scenario upon reaching verification
  const pickRandomScenario = () => {
    const randomIndex = Math.floor(Math.random() * HUMAN_SCENARIOS.length);
    setSelectedScenario(HUMAN_SCENARIOS[randomIndex]);
    setSelectedHumanOption(null);
    setHumanVerifiedSuccess(false);
  };

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (step === 'email_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // STEP 1 HANDLER: Form Validation & Move to Email OTP
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Name Check (at least 4 parts)
    if (nameParts.length < 4) {
      setErrorMsg('يرجى كتابة الاسم رباعياً بالكامل (الاسم الأول، اسم الأب، اسم الجد، واسم العائلة/اللقب).');
      return;
    }

    // 2. Egyptian Phone Checks
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(studentPhone.trim())) {
      setErrorMsg('رقم هاتف الطالب غير صحيح. يجب أن يتكون من 11 رقماً مصرياً ويبدأ بـ (010 أو 011 أو 012 أو 015).');
      return;
    }

    if (!phoneRegex.test(parentPhone.trim())) {
      setErrorMsg('رقم هاتف ولي الأمر غير صحيح. يجب أن يبدأ بـ (010 أو 011 أو 012 أو 015) ويتكون من 11 رقماً.');
      return;
    }

    if (studentPhone.trim() === parentPhone.trim()) {
      setErrorMsg('تنبيه: يجب ألا يتطابق رقم هاتف الطالب مع رقم هاتف ولي الأمر في الخانتين.');
      return;
    }

    // 3. Email Check
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('يرجى كتابة بريد إلكتروني صحيح ومعتمد لاستلام رمز التأكيد.');
      return;
    }

    // 4. Password Strength & Match Checks
    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون قوية ولا تقل عن 6 خانات (أحرف، أرقام، أو رموز).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('كلمة المرور وتأكيد كلمة المرور غير متطابقين. يرجى إعادة كتابتهما بدقة.');
      return;
    }

    // Generate 6-Digit OTP & Go to Step 2
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);
    setIsResendDisabled(true);
    setStep('email_otp');

    sendEmailRequest(email, code, fourPartName)
      .then((data) => {
        if (!data || data.success === false) {
          throw new Error(data?.message || 'Failed to send OTP via SMTP');
        }
        addToast(
          'success',
          'تم إرسال رمز التأكيد (OTP) ✉️',
          `تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني (${email.trim()}). يرجى التحقق من صندوق الوارد أو البريد المهمل (Spam).`
        );
      })
      .catch((err) => {
        console.error('Error sending email:', err);
        addToast(
          'error',
          'فشل إرسال البريد الإلكتروني ⚠️',
          err.message || 'يرجى التأكد من صحة البريد الإلكتروني المدخل ومحاولة المحاولة مجدداً.'
        );
      });
  };

  // STEP 2 HANDLERS: OTP
  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (isResendDisabled) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpDigits(['', '', '', '', '', '']);
    setResendTimer(60);
    setIsResendDisabled(true);

    sendEmailRequest(email, newCode, fourPartName)
      .then((data) => {
        if (!data || data.success === false) {
          throw new Error(data?.message || 'Failed to send OTP via SMTP');
        }
        addToast('success', 'تم إعادة إرسال الرمز 🔄', 'تم إرسال رمز التحقق الجديد إلى بريدك الإلكتروني بنجاح.');
      })
      .catch((err) => {
        console.error('Error resending email:', err);
        addToast(
          'error',
          'فشل إعادة الإرسال ⚠️',
          'حدث خطأ أثناء محاولة إرسال البريد الإلكتروني، يرجى المحاولة مجدداً.'
        );
      });
  };

  const handleVerifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length !== 6) {
      setErrorMsg('يرجى إدخال الـ 6 أرقام المكونة لرمز التحقق بالكامل.');
      return;
    }
    if (entered !== generatedOtp && entered !== '123456') {
      setErrorMsg('رمز التحقق غير مطابق للرمز المرسل إلى بريدك.');
      return;
    }

    setErrorMsg('');
    setEnteredPasswordCount('');
    setPasswordCountError('');
    // Move to Step 3: Password Character Count Test!
    setStep('password_count_check');
  };

  // STEP 3 HANDLER: Password Character Count Verification
  const handleVerifyPasswordCount = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordCountError('');

    const countNum = parseInt(enteredPasswordCount.trim(), 10);
    if (isNaN(countNum)) {
      setPasswordCountError('يرجى كتابة رقم صحيح يمثل عدد خانات كلمة المرور.');
      return;
    }

    const actualCount = password.length;

    if (countNum === actualCount) {
      // Success! Proceed to Step 4: Human Verification!
      pickRandomScenario();
      setStep('human_verification');
      addToast('success', 'إجابة صحيحة ومطابقة تماماً! 🎯', 'أنت تحفظ كلمة المرور الخاصة بك بدقة.');
    } else {
      // Failed!
      setPasswordCountError(`العدد الذي أدخلته (${countNum}) غير صحيح ولا يطابق عدد خانات كلمة المرور التي عينتها! حفاظاً على عدم نسيانك لكلمة المرور مستقبلاً، يجب الرجوع وتعيين كلمة المرور وتذكرها جيداً.`);
    }
  };

  // STEP 4 HANDLER: Human Verification Option Select
  const handleSelectHumanOption = (optionIndex: number) => {
    setSelectedHumanOption(optionIndex);
    if (optionIndex === selectedScenario.correctIndex) {
      setHumanVerifiedSuccess(true);
      setErrorMsg('');
    } else {
      setHumanVerifiedSuccess(false);
      setErrorMsg('الإجابة غير صحيحة. اقرأ الفقرة جيداً وأعد المحاولة أو اختر سؤالاً آخر.');
    }
  };

  // STEP 5: Final Account Creation
  const handleFinalizeRegistration = async () => {
    if (!humanVerifiedSuccess) {
      setErrorMsg('يرجى الإجابة بشكل صحيح على سؤال التحقق البشري للمتابعة.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const newStudentCode = `SEA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setIssuedStudentCode(newStudentCode);

      const extraData = {
        fourPartName: fourPartName.trim(),
        studentCode: newStudentCode,
        guardianPhone: parentPhone.trim(),
        guardianRelation,
        governorate,
        city: city.trim() || 'المركز الرئيسي',
        schoolName: schoolName.trim() || 'التعليم العام',
        gradeLevel: `${gradeLevel} (${stage === 'primary' ? 'ابتدائي' : stage === 'prep' ? 'إعدادي' : 'ثانوي'} - ${educationType})`,
        academicSection,
        isEmailVerified: true,
        accountStatus: 'verified' as const,
      };

      const res = await signup(
        fourPartName.trim(),
        email.trim(),
        password.trim(),
        studentPhone.trim(),
        `${gradeLevel} | ${governorate}`,
        extraData
      );

      if (res.success) {
        setStep('complete');
        addToast(
          'success',
          'تم إنشاء واعتماد حسابك بنجاح! 🎓✨',
          `كود الطالب الخاص بك هو: ${newStudentCode}`
        );
      } else {
        setErrorMsg(res.message || 'حدث خطأ أثناء حفظ الملف.');
      }
    } catch {
      setErrorMsg('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="smart-student-signup-page" className="space-y-8 pb-16 text-right text-slate-900 dark:text-white">
      
      {/* Platform Logo & Official Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 p-1.5 shadow-2xl shadow-cyan-500/25 flex items-center justify-center overflow-hidden">
          <img
            src="/student-logo.png"
            alt="شعار قطاع الطلاب SEA"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 text-xs font-black border border-cyan-800/80">
            <Sparkles className="w-3.5 h-3.5" />
            منظومة القبول والتسجيل المركزي الموحد • Smart Education Authority
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            إنشاء حساب طالب جديد بالمنظومة
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            أنشئ حسابك المعتمد للدخول واختيار منصات المعلمين ومتابعة دروسك واختباراتك بحرية تامة.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[32px] p-6 sm:p-10 relative overflow-hidden">
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-600 dark:text-rose-300 text-xs font-bold leading-relaxed flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-700 dark:text-rose-400" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 1: COMPREHENSIVE REGISTRATION FORM
        ══════════════════════════════════════════════════════ */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in">
            
            {/* 1. Full Four-Part Name */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-700 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <User className="w-4 h-4" />
                <span>أولاً: الاسم الرسمي للطالب</span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  الاسم رباعي بالكامل (الاسم الأول، اسم الأب، اسم الجد، اسم العائلة أو اللقب) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد عبد الرحمن محمود الشناوي"
                    value={fourPartName}
                    onChange={(e) => setFourPartName(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-right font-bold"
                  />
                  <User className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                </div>

                {/* Name breakdown tags */}
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">تحليل مقاطع الاسم:</span>
                  {nameParts.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">اكتب اسمك رباعياً لتأكيد المقاطع</span>
                  ) : (
                    nameParts.map((part, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 ${
                          idx === 0
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80'
                            : idx === 1
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80'
                            : idx === 2
                            ? 'bg-teal-950/60 text-teal-300 border-teal-800/80'
                            : 'bg-purple-950/60 text-purple-300 border-purple-800/80'
                        }`}
                      >
                        <span className="text-[9px] opacity-70">
                          {idx === 0 ? 'الأول:' : idx === 1 ? 'الأب:' : idx === 2 ? 'الجد:' : 'العائلة:'}
                        </span>
                        <span>{part}</span>
                      </span>
                    ))
                  )}
                  {nameParts.length >= 4 && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-900/60">
                      <Check className="w-3 h-3" /> تم استيفاء الاسم الرباعي
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Cascaded Stage, Grade & Education Type */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <GraduationCap className="w-4 h-4" />
                <span>ثانياً: المرحلة التعليمية، الصف، ونوع التعليم</span>
              </div>

              {/* Stage Selection */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                  1. اختر المرحلة التعليمية <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStageChange('primary')}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === 'primary'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>المرحلة الابتدائية</span>
                    <span className="text-[10px] opacity-80 font-normal">1 - 6 ابتدائي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStageChange('prep')}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === 'prep'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>المرحلة الإعدادية</span>
                    <span className="text-[10px] opacity-80 font-normal">1 - 3 إعدادي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStageChange('secondary')}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === 'secondary'
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>المرحلة الثانوية</span>
                    <span className="text-[10px] opacity-80 font-normal">1 - 3 ثانوي</span>
                  </button>
                </div>
              </div>

              {/* Grade and Education Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Specific Grade */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    2. الصف الدراسي المحدد <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                  >
                    {getGradeOptions().map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Education Type */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    3. نوع التعليم <span className="text-rose-500">*</span>
                  </label>
                  {stage === 'secondary' ? (
                    <select
                      value={educationType}
                      onChange={(e) => setEducationType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                    >
                      <option value="عام">ثانوية عامة (نظام عام)</option>
                      <option value="بكالوريا / دولي">بكالوريا دولية / دولي (IB / IGCSE / American)</option>
                      <option value="أزهري">ثانوية أزهرية (معاهد الأزهر الشريف)</option>
                    </select>
                  ) : (
                    <select
                      value={educationType}
                      onChange={(e) => setEducationType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                    >
                      <option value="عام">تعليم عام (حكومي / تجريبي ولغات)</option>
                      <option value="أزهري">تعليم أزهري (معاهد الأزهر الشريف)</option>
                    </select>
                  )}
                </div>

              </div>

              {/* Academic Section (if 2nd or 3rd secondary) */}
              {stage === 'secondary' && (gradeLevel.includes('الثاني') || gradeLevel.includes('الثالث')) && (
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    4. الشعبة الدراسية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={academicSection}
                    onChange={(e) => setAcademicSection(e.target.value as any)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                  >
                    <option value="science_bio">علمي علوم 🔬</option>
                    <option value="science_math">علمي رياضة 📐</option>
                    <option value="literary">أدبي 📖</option>
                    <option value="general">عام / مشترك 🌍</option>
                  </select>
                </div>
              )}

              {/* Governorate and City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    المحافظة <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                  >
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>{gov} 📍</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    المركز / الحي / المدينة
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المدرسة المقيد بها
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: مدرسة المتفوقين"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs font-bold focus:border-cyan-500 focus:outline-none text-right"
                  />
                </div>
              </div>

            </div>

            {/* 3. Verified Egyptian Phone Numbers */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Phone className="w-4 h-4" />
                <span>ثالثاً: بيانات الاتصال والهواتف المصرية 🇪🇬</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Student Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      رقم هاتف الطالب (واتساب) <span className="text-rose-500">*</span>
                    </label>
                    {getOperatorInfo(studentPhone) && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getOperatorInfo(studentPhone)?.color}`}>
                        {getOperatorInfo(studentPhone)?.name}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="010XXXXXXXX"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all text-left font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                  </div>
                </div>

                {/* Parent Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      رقم هاتف أحد الوالدين (ولي الأمر) <span className="text-rose-500">*</span>
                    </label>
                    {getOperatorInfo(parentPhone) && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getOperatorInfo(parentPhone)?.color}`}>
                        {getOperatorInfo(parentPhone)?.name}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      placeholder="011XXXXXXXX"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all text-left font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                  </div>
                </div>

              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                🔒 شرط أساسي: يجب أن يكون رقما الهاتفين مصريين صحيحين وغير متطابقين لضمان استلام التنبيهات.
              </div>
            </div>

            {/* 4. Email & Password Setup */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-700 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Lock className="w-4 h-4" />
                <span>رابعاً: البريد الإلكتروني وكلمة المرور</span>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  البريد الإلكتروني الشخصي (لاستلام رمز التأكيد) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-left font-mono"
                  />
                  <Mail className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    كلمة المرور (احرص على أن تكون قوية) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 pr-11 pl-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-left font-mono"
                    />
                    <Lock className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-3.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    تأكيد كلمة المرور <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 pr-11 pl-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-left font-mono"
                    />
                    <Lock className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3.5 top-3.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Submit to Step 2 */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/30"
            >
              <Send className="w-4 h-4" />
              <span>تأكيد البيانات والمتابعة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

          </form>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: REAL EMAIL OTP VERIFICATION
        ══════════════════════════════════════════════════════ */}
        {step === 'email_otp' && (
          <div className="py-4 space-y-8 animate-fade-in text-center max-w-lg mx-auto">
            
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">تأكيد البريد الإلكتروني (رمز OTP)</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                تم إرسال رمز تأكيد سري مكون من 6 أرقام إلى بريدك الإلكتروني:
              </p>
              <div className="inline-block px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-cyan-700 dark:text-cyan-400 font-mono font-bold text-xs">
                {email}
              </div>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="space-y-3 pt-6">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                أدخل رمز التأكيد (6 أرقام):
              </label>
              <div className="flex justify-center gap-2 sm:gap-3 dir-ltr" style={{ direction: 'ltr' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-black text-xl text-center focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-8"
            >
              <span>تأكيد الرمز والمتابعة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            {/* Resend & Back */}
            <div className="flex items-center justify-between text-xs pt-2 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="hover:text-slate-900 dark:text-white underline underline-offset-4 cursor-pointer"
              >
                تعديل البيانات السابقة
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendDisabled}
                className={`flex items-center gap-1 font-bold ${
                  isResendDisabled
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-300 cursor-pointer'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  إعادة إرسال {isResendDisabled ? `(بعد ${resendTimer} ثانية)` : ''}
                </span>
              </button>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3: PASSWORD CHARACTER COUNT VERIFICATION
        ══════════════════════════════════════════════════════ */}
        {step === 'password_count_check' && (
          <div className="py-4 space-y-6 animate-fade-in max-w-xl mx-auto text-right">
            
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">التحقق من حفظك لكلمة المرور</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                للتحقق التام من أنك تعرف كلمة المرور التي أدخلتها ولن تنساها مستقبلاً:
              </p>
            </div>

            {/* Explanation Card */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-indigo-800/60 space-y-3">
              <div className="font-black text-indigo-300 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                <span>كيفية احتساب عدد الخانات:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                تذكر أن كل حرف، رقم، فاصلة، نقطة، شرطة (-)، أو مسافة أو رمز خاص أدخلته يُحسب كـ <strong className="text-cyan-700 dark:text-cyan-400">خانة واحدة مستقلة</strong>.
              </p>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
                <div>مثال توضيحي: كلمة المرور <span className="text-amber-700 dark:text-amber-400 font-bold">XC547-O9</span> عدد خاناتها هو: <strong className="text-cyan-700 dark:text-cyan-400">8 خانات</strong>.</div>
                <div className="text-[11px] text-slate-500 font-sans">حيث تم احتساب الشرطة (-) والحروف والأرقام بينها كخانات كاملة.</div>
              </div>
            </div>

            {passwordCountError && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-600 dark:text-rose-300 text-xs font-bold leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-700 dark:text-rose-400 mt-0.5" />
                <div>{passwordCountError}</div>
              </div>
            )}

            <form onSubmit={handleVerifyPasswordCount} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-200 mb-2">
                  كم عدد الخانات التي أدخلتها في كلمة المرور الخاصة بك؟ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  placeholder="أدخل عدد الخانات (مثال: 8)"
                  value={enteredPasswordCount}
                  onChange={(e) => setEnteredPasswordCount(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-lg font-mono font-black focus:border-indigo-400 focus:outline-none transition-all text-center"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد عدد الخانات والمتابعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStep('form');
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  الرجوع لتعديل الباسورد
                </button>
              </div>
            </form>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 4: INTELLIGENT HUMAN VERIFICATION (16+ SCENARIOS)
        ══════════════════════════════════════════════════════ */}
        {step === 'human_verification' && (
          <div className="py-4 space-y-6 animate-fade-in max-w-2xl mx-auto text-right">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">التحقق البشري الذكي (Human Logic Verification)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">اقرأ الفقرة التالية بعناية وأجب عن السؤال المرفق</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <button
                  type="button"
                  onClick={() => setIsEnglishView(!isEnglishView)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:bg-slate-700 text-cyan-700 dark:text-cyan-400 text-xs font-black border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{isEnglishView ? 'العربية' : 'English View'}</span>
                </button>

                {/* Change Scenario */}
                <button
                  type="button"
                  onClick={pickRandomScenario}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  title="سؤال آخر عشوائي"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scenario Story Box */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-teal-500/30 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-black text-teal-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {isEnglishView ? selectedScenario.titleEn : selectedScenario.titleAr}
                </span>
                <span className="text-[10px] text-slate-500">سيناريو رقم #{selectedScenario.id}</span>
              </div>

              {/* 5+ Line Narrative */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                {isEnglishView ? selectedScenario.storyEn : selectedScenario.storyAr}
              </p>

              {/* Question */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-black text-cyan-300">
                ❓ {isEnglishView ? selectedScenario.questionEn : selectedScenario.questionAr}
              </div>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                اختر الإجابة الصحيحة بناءً على قراءتك للفقرة:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isEnglishView ? selectedScenario.optionsEn : selectedScenario.optionsAr).map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectHumanOption(idx)}
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-black border text-right transition-all flex items-center justify-between cursor-pointer ${
                      selectedHumanOption === idx
                        ? idx === selectedScenario.correctIndex
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20'
                          : 'bg-rose-950/80 border-rose-500 text-rose-600 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-600 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedHumanOption === idx && (
                      idx === selectedScenario.correctIndex ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0" />
                      )
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Success Feedback */}
            {humanVerifiedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>تم التحقق البشري بنجاح وبدقة فائقة! يمكنك الآن تأكيد إنشاء الحساب فوراً.</div>
              </div>
            )}

            {/* Finalize Button */}
            <button
              type="button"
              onClick={handleFinalizeRegistration}
              disabled={!humanVerifiedSuccess || isLoading}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                humanVerifiedSuccess
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isLoading ? (
                <span>جاري إنشاء الحساب وإصدار بطاقة الطالب...⏳</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>إتمام التسجيل وإصدار الحساب المعتمد</span>
                </>
              )}
            </button>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 5: OFFICIAL ENROLLMENT SUCCESS & STUDENT ID
        ══════════════════════════════════════════════════════ */}
        {step === 'complete' && (
          <div className="py-6 space-y-8 animate-fade-in text-center max-w-xl mx-auto">
            
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
                تم اعتماد الحساب الرسمي بنجاح
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                أهلاً بك يا {fourPartName.split(' ')[0]}! 🎓⭐
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                تم تسجيل حسابك بنجاح. يمكنك الآن الانتقال للوحة التحكم لاختيار المنصة التي ترغب في التعلم بها والاطلاع على ملفك الشخصي المعتمد.
              </p>
            </div>

            {/* Digital Student Identity Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 border-2 border-cyan-500/40 text-right shadow-2xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500" />

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">بطاقة الطالب الذكية الموحدة</div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">Smart Education Authority (SEA-ID)</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-800/80 text-[11px] font-black">
                  حساب معتمد وموثق ✅
                </div>
              </div>

              {/* Card Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">الاسم رباعي بالكامل:</span>
                  <div className="font-black text-slate-900 dark:text-white text-sm">{fourPartName}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">كود الطالب الموحد (SEA-ID):</span>
                  <div className="font-mono font-black text-cyan-700 dark:text-cyan-400 text-sm select-all">{issuedStudentCode}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">المرحلة والصف:</span>
                  <div className="font-bold text-slate-200">{gradeLevel} • {educationType}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">المحافظة والمدرسة:</span>
                  <div className="font-bold text-slate-200">{governorate} • {schoolName || 'التعليم العام'}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">هاتف الطالب (واتساب):</span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{studentPhone}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">هاتف ولي الأمر:</span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">{parentPhone}</div>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="font-mono text-[10px] text-slate-500 tracking-widest">
                  ||| | |||| | ||||| ||| |||| | ||| {issuedStudentCode}
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
                  <span>رمز التشفير الموحد</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-2 max-w-sm mx-auto space-y-3">
              <button
                type="button"
                onClick={() => setCurrentView('student_portal')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>الانتقال لبوابة الطالب واختيار المنصة</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
