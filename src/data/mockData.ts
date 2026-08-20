import { EducationalPlatform, Course, Exam, PlatformOrderRequest, CouponCode, User, CourseStudentEnrollee, CourseAnnouncement } from '../types';

export const FALLBACK_PLATFORM: EducationalPlatform = {
  id: 'platform-radwan-01',
  name: 'المنصة التعليمية - مستر محمد رضوان',
  slug: 'mr-mohamed-radwan',
  subject: 'اللغة الإنجليزية',
  subjectCategory: 'languages',
  teacherName: 'محمد رضوان',
  teacherTitle: 'معلم أول لغة إنجليزية',
  teacherEmail: 'Mrenglishlangue9190krt@mnsa.sea.com',
  teacherPassword: '6@ff-engl1-00pmnes-sea',
  teacherPhone: '01099887766',
  teacherBio: 'معلم مادة اللغة الإنجليزية لجميع المراحل الثانوية والإعدادية، شرح مبسط ومتابعة مستمرة.',
  teacherAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300&h=300',
  bannerImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200&h=400',
  logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=Radwan&backgroundColor=0ea5e9,0284c7',
  themeColor: '#0ea5e9',
  status: 'active',
  monthlyRentPrice: 850,
  annualRentPrice: 8500,
  subscriptionExpiresAt: '2027-12-31T23:59:59.000Z',
  features: [
    'شرح تفصيلي للمنهج',
    'امتحانات واختبارات دورية',
    'مذكرات وتدريبات PDF',
    'متابعة مستوى الطالب',
  ],
  totalStudentsCount: 0,
  totalCoursesCount: 0,
  rating: 5.0,
  whatsappNumber: '01099887766',
  telegramChannel: '',
  facebookPage: '',
  createdAt: '2026-01-01',
};

export const SUPER_ADMIN_CREDENTIALS = {
  email: 'smarteducationauthority@gmail.com',
  password: 'M&N-MNSAT MSR ALKOBRA',
  name: 'الإدارة العامة للمنظومة',
  phone: '01099887766',
};

export const DEMO_STUDENT_USER: User = {
  id: 'student-demo-001',
  name: 'طالب مسجل',
  email: 'student@sea.com',
  role: 'student',
  phone: '01012345678',
  gradeLevel: 'الصف الثالث الثانوي',
  enrolledCourseIds: [],
  walletBalance: 0,
  createdAt: '2026-02-01',
};
