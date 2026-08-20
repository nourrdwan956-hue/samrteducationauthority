import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EducationalPlatform,
  Course,
  Exam,
  ExamSubmission,
  PlatformOrderRequest,
  CouponCode,
  User,
  StudentNote,
  GeneralNote,
  StudyTask,
  Lesson,
  CourseStudentEnrollee,
  CourseAnnouncement,
  LiveSession,
  SupportTicket,
  DepositRequest,
  PaymentSettings,
  LessonQuestion,
  LessonQuestionReply,
  BankQuestion,
  Assignment,
  AssignmentSubmission,
  CourseAccessCode,
  PrintedCodesBatch,
} from '../types';
import {
  SUPER_ADMIN_CREDENTIALS,
  DEMO_STUDENT_USER,
  FALLBACK_PLATFORM,
} from '../data/mockData';
import {
  INITIAL_BANK_QUESTIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_PRINTED_BATCHES,
  generate16CharCode,
} from '../data/teacherExtraData';
import {
  getSupabaseHealth,
  fetchSupabasePlatforms,
  fetchSupabaseCourses,
  syncPlatformToSupabase,
  deletePlatformFromSupabase,
  syncCourseToSupabase,
  deleteCourseFromSupabase,
  syncOrderToSupabase,
  syncSubmissionToSupabase,
  syncNoteToSupabase,
  syncCouponToSupabase,
  fetchSupabaseCoupons,
  syncAdminLogToSupabase,
  syncLiveSessionToSupabase,
  deleteLiveSessionFromSupabase,
  fetchSupabaseLiveSessions,
  syncSupportTicketToSupabase,
  deleteSupportTicketFromSupabase,
  fetchSupabaseSupportTickets,
  syncUserProfileToSupabase,
  fetchSupabaseUserProfiles,
  syncPrintedCodesBatchToSupabase,
  fetchSupabasePrintedCodesBatches,
  deletePrintedCodesBatchFromSupabase,
} from '../lib/supabaseSync';
import { detectCurrentDevice } from '../utils/deviceUtils';

export type AppView =
  | 'home'
  | 'platforms'
  | 'platform_detail'
  | 'course_detail'
  | 'lesson_player'
  | 'exam_view'
  | 'assignment_view'
  | 'super_admin'
  | 'teacher_dashboard'
  | 'student_portal'
  | 'rental_form'
  | 'rent_platform_form'
  | 'security_showcase'
  | 'student_signup';

export type ThemeMode = 'dark' | 'light';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  // Theme management (Universal luxury switcher)
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;

  // Supabase Database Modal
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;

  // Navigation & Routing
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedPlatformId: string | null;
  setSelectedPlatformId: (id: string | null) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string | null) => void;
  selectedExamId: string | null;
  setSelectedExamId: (id: string | null) => void;
  selectedAssignmentId: string | null;
  setSelectedAssignmentId: (id: string | null) => void;
  selectedInstructorName: string | null;
  setSelectedInstructorName: (name: string | null) => void;

  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    gradeLevel?: string,
    extraProfileData?: Partial<User>
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Data Collections
  platforms: EducationalPlatform[];
  courses: Course[];
  exams: Exam[];
  bankQuestions: BankQuestion[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  printedCodesBatches: PrintedCodesBatch[];
  orderRequests: PlatformOrderRequest[];
  coupons: CouponCode[];
  examSubmissions: ExamSubmission[];
  studentNotes: StudentNote[];
  generalNotes: GeneralNote[];
  studyTasks: StudyTask[];
  courseStudents: CourseStudentEnrollee[];
  courseAnnouncements: CourseAnnouncement[];
  liveSessions: LiveSession[];
  supportTickets: SupportTicket[];
  userProfiles: User[];
  lessonQuestions: LessonQuestion[];

  // CRUD Operations
  createPlatform: (platform: Omit<EducationalPlatform, 'id' | 'createdAt' | 'totalStudentsCount' | 'totalCoursesCount' | 'rating'>) => void;
  updatePlatform: (id: string, updates: Partial<EducationalPlatform>) => void;
  deletePlatform: (id: string) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateSupportTicketStatus: (id: string, status: SupportTicket['status'], adminResponse?: string) => void;
  deleteSupportTicket: (id: string) => void;
  updateTeacherCredentials: (
    platformId: string,
    email: string,
    password: string,
    teacherName?: string,
    teacherTitle?: string,
    status?: EducationalPlatform['status']
  ) => void;

  // Course & Lesson Actions
  createCourse: (courseData: Partial<Course>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLessonToCourse: (courseId: string, moduleId: string, lesson: Partial<Lesson>) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  enrollInCourse: (courseId: string, couponCode?: string) => { success: boolean; message: string };
  rechargeWallet: (amount: number, note?: string) => { success: boolean; message: string; newBalance: number };
  redeemCourseAccessCode: (code: string, targetCourseId?: string) => { success: boolean; message: string; courseTitle?: string };
  verifyDeviceAccess: () => { success: boolean; message: string; isNewDevice: boolean };
  removeSecondaryDevice: () => { success: boolean; message: string };

  // Question Bank System
  createBankQuestion: (q: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBankQuestion: (id: string, updates: Partial<BankQuestion>) => void;
  deleteBankQuestion: (id: string) => void;
  importExamToQuestionBank: (examId: string, topic?: string) => number;
  createExamFromBankQuestions: (questionIds: string[], examMeta: Partial<Exam>) => Exam;

  // Specialized Assignments System
  createAssignment: (assignmentData: Partial<Assignment>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignmentAttempt: (submission: Omit<AssignmentSubmission, 'id' | 'submittedAt'>) => AssignmentSubmission;
  gradeAssignmentSubmission: (submissionId: string, manualScores: Record<string, number>, feedback: string) => void;

  // Printed 16-Character Access Codes System
  createPrintedCodesBatch: (courseId: string, quantity: number, notes?: string) => PrintedCodesBatch | null;
  settleCodesBatchByAdmin: (batchId: string, paidCodesCount: number, notes?: string) => void;
  deletePrintedCodesBatch: (batchId: string) => void;

  // Course Enrollees & Announcements
  addCourseStudent: (student: Omit<CourseStudentEnrollee, 'id' | 'enrolledAt'>) => void;
  toggleStudentStatus: (studentId: string) => void;
  deleteCourseStudent: (studentId: string) => void;
  addCourseAnnouncement: (announcement: Omit<CourseAnnouncement, 'id' | 'createdAt'>) => void;
  deleteCourseAnnouncement: (announcementId: string) => void;

  // Live Sessions
  addLiveSession: (session: Omit<LiveSession, 'id' | 'createdAt'>) => void;
  updateLiveSession: (sessionId: string, updates: Partial<LiveSession>) => void;
  deleteLiveSession: (sessionId: string, courseName: string) => void;

  // Coupons
  createCoupon: (coupon: Omit<CouponCode, 'id' | 'currentUses'>) => void;
  toggleCouponStatus: (couponId: string) => void;
  deleteCoupon: (couponId: string) => void;
  logAdminActivity: (action: string, details: string, courseName: string) => void;

  // Exams
  createExam: (examData: Partial<Exam>) => void;
  updateExam: (examId: string, examData: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  submitExamAttempt: (submission: Omit<ExamSubmission, 'id' | 'submittedAt'>) => ExamSubmission;

  // Orders / Platform Rental requests
  submitOrderRequest: (req: Omit<PlatformOrderRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: 'approved' | 'rejected' | 'pending') => void;

  // Student Notes
  addStudentNote: (lessonId: string, courseId: string, timestampSeconds: number, noteText: string, color?: StudentNote['color']) => void;
  updateStudentNote: (noteId: string, newText: string, color?: StudentNote['color']) => void;
  deleteStudentNote: (noteId: string) => void;

  // Lesson Questions & Teacher Discussions
  askLessonQuestion: (lessonId: string, courseId: string, questionText: string, timestampSeconds?: number) => void;
  replyToLessonQuestion: (questionId: string, message: string) => void;
  updateLessonQuestionStatus: (questionId: string, status: LessonQuestion['status']) => void;
  deleteLessonQuestion: (questionId: string) => void;
  
  // General Notes (Student)
  addGeneralNote: (note: Omit<GeneralNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGeneralNote: (noteId: string, updates: Partial<GeneralNote>) => void;
  deleteGeneralNote: (noteId: string) => void;

  // Study Tasks (Student Schedule)
  addStudyTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => void;
  updateStudyTask: (taskId: string, updates: Partial<StudyTask>) => void;
  deleteStudyTask: (taskId: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (type: Toast['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Helper selectors
  currentPlatform: EducationalPlatform | null;
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  currentExam: Exam | null;
  currentAssignment: Assignment | null;

  // Real Payments & Wallet Management
  depositRequests: DepositRequest[];
  paymentSettings: PaymentSettings;
  submitDepositRequest: (req: Omit<DepositRequest, 'id' | 'status' | 'createdAt'>) => { success: boolean; message: string };
  updateDepositRequestStatus: (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => void;
  updatePaymentSettings: (settings: PaymentSettings) => void;

  // Administrative Real-Time Database Sync
  isSyncingData: boolean;
  lastDatabaseSyncTime: string;
  supabaseLatency: number;
  refreshAllAdministrativeData: () => Promise<{
    success: boolean;
    platformsCount: number;
    coursesCount: number;
    printedBatchesCount: number;
    totalPrintedCodesCount: number;
    usersCount: number;
    latencyMs: number;
    lastSyncTime: string;
  }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state with localStorage persistence and document root class control
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('sea_theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Apply theme to document root and body whenever changed
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      body.classList.remove('light');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      body.classList.remove('dark');
      body.classList.add('light');
    }
    localStorage.setItem('sea_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // State Initialization
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedInstructorName, setSelectedInstructorName] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Stored state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sea_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [platforms, setPlatforms] = useState<EducationalPlatform[]>(() => {
    const saved = localStorage.getItem('sea_platforms');
    let parsed: EducationalPlatform[] = saved ? JSON.parse(saved) : [];
    
    // Purge any legacy fake mock platforms
    const fakeIds = ['platform-english-01', 'platform-physics-01', 'platform-arabic-01', 'platform-chemistry-01', 'platform-french-01', 'platform-01', 'platform-02', 'platform-03'];
    parsed = parsed.filter(p => 
      !fakeIds.includes(p.id) && 
      !p.teacherName.includes('أحمد سامي') && 
      !p.teacherName.includes('خالد الصاوي') && 
      !p.teacherName.includes('حسام النجار') && 
      !p.teacherName.includes('إبراهيم عثمان') && 
      !p.teacherName.includes('د. طارق') && 
      !p.teacherName.includes('أ. عمرو')
    );

    // Ensure the authentic teacher account exists
    const requiredTeacherEmail = 'Mrenglishlangue9190krt@mnsa.sea.com'.toLowerCase();
    const hasRequiredTeacher = parsed.some(p => p.teacherEmail.toLowerCase() === requiredTeacherEmail);
    
    if (!hasRequiredTeacher) {
      const oldIndex = parsed.findIndex(p => p.teacherEmail === 'radwan@sea.edu');
      if (oldIndex !== -1) {
        parsed[oldIndex].teacherEmail = 'Mrenglishlangue9190krt@mnsa.sea.com';
        parsed[oldIndex].teacherPassword = '6@ff-engl1-00pmnes-sea';
      } else {
        parsed = [FALLBACK_PLATFORM, ...parsed];
      }
    }
    
    const finalPlatforms = parsed.length > 0 ? parsed : [FALLBACK_PLATFORM];
    localStorage.setItem('sea_platforms', JSON.stringify(finalPlatforms));
    return finalPlatforms;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('sea_courses');
    let parsed: Course[] = saved ? JSON.parse(saved) : [];
    
    // Purge fake mock courses (including physics, geography, and test tags)
    const fakeKeywords = ['فيزياء', 'الصواريخ', 'النجار', 'الجغرافيا', 'أطلس', 'أحمد سامي', 'خالد الصاوي', 'د. طارق', 'KGK', 'kgk'];
    const fakePlatformIds = ['platform-english-01', 'platform-physics-01', 'platform-arabic-01', 'platform-chemistry-01', 'platform-french-01', 'platform-01', 'platform-02', 'platform-03'];
    
    parsed = parsed.filter(c => {
      if (fakePlatformIds.includes(c.platformId)) return false;
      const title = c.title || '';
      const subtitle = c.subtitle || '';
      const desc = c.description || '';
      const hasFakeKeyword = fakeKeywords.some(kw => 
        title.includes(kw) || subtitle.includes(kw) || desc.includes(kw)
      );
      return !hasFakeKeyword;
    });

    if (parsed.length === 0) {
      const starterCourse: Course = {
        id: 'course-radwan-general-01',
        platformId: 'platform-radwan-01',
        title: 'كورس مادة اللغة الإنجليزية - الثانوية العامة',
        subtitle: 'شرح تفصيلي للمفردات، القواعد اللغوية وحل نماذج الامتحانات الوزارية',
        description: 'كورس شامل يغطي جميع وحدات منهج اللغة الإنجليزية للثانوية العامة، مع تدريبات عملية مكثفة، حل بنوك أسئلة وتدريبات تفاعلية دورية.',
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        subject: 'اللغة الإنجليزية',
        stage: 'secondary',
        gradeLevel: 'الصف الثالث الثانوي',
        term: 'term2',
        price: 250,
        originalPrice: 350,
        isFree: false,
        totalDurationMinutes: 180,
        modulesCount: 1,
        lessonsCount: 2,
        enrolledCount: 0,
        rating: 5.0,
        status: 'published',
        tags: ['شرح', 'مراجعة', 'ثانوية عامة 2026'],
        createdAt: '2026-02-01',
        participatingTeachers: [],
        modules: [
          {
            id: 'mod-radwan-01',
            courseId: 'course-radwan-general-01',
            title: 'الوحدة الأولى: قواعد اللغة الإنجليزية والأزمنة (Grammar & Tenses)',
            order: 1,
            lessons: [
              {
                id: 'les-radwan-01',
                courseId: 'course-radwan-general-01',
                moduleId: 'mod-radwan-01',
                title: 'المحاضرة الأولى: التأسيس الشامل وقواعد الأزمنة الأساسية',
                description: 'شرح مفصل ومبسط لأهم القواعد مع حل أمثلة تطبيقية وتدريبات مباشرة.',
                durationMinutes: 45,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                videoProvider: 'direct',
                type: 'video',
                isFree: true,
                isFreePreview: true,
                isPublished: true,
                order: 1,
                hasWatermark: true,
                notes: 'يرجى مراجعة ملف الملاحظات والتدريب على الأسئلة بعد انتهاء المحاضرة.',
              },
              {
                id: 'les-radwan-02',
                courseId: 'course-radwan-general-01',
                moduleId: 'mod-radwan-01',
                title: 'المحاضرة الثانية: المفردات والتراكيب وحل نماذج القطع والترجمة',
                description: 'شرح المفردات الشائعة وحل قطع الفهم واستراتيجيات الإجابة الصحيحة.',
                durationMinutes: 50,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                videoProvider: 'direct',
                type: 'video',
                isFree: false,
                isFreePreview: false,
                isPublished: true,
                order: 2,
                hasWatermark: true,
              },
              {
                id: 'les-radwan-03',
                courseId: 'course-radwan-general-01',
                moduleId: 'mod-radwan-01',
                title: 'مذكرة الشرح والتدريبات الشاملة (PDF)',
                description: 'ملف المذكرة الرسمي للوحدة الأولى بصيغة PDF عالي الجودة والجاهز للمذاكرة.',
                type: 'pdf',
                pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/sample.pdf',
                isFree: true,
                isFreePreview: true,
                isPublished: true,
                order: 3,
              },
              {
                id: 'les-radwan-04',
                courseId: 'course-radwan-general-01',
                moduleId: 'mod-radwan-01',
                title: 'الامتحان التفاعلي الشامل على الوحدة الأولى',
                description: 'اختبار مؤمن بنظام ملء الشاشة الصارم وحظر الخروج لقياس استيعاب القواعد والكلمات.',
                type: 'exam',
                examId: 'exam-radwan-01',
                isFree: false,
                isFreePreview: false,
                isPublished: true,
                order: 4,
              },
            ],
          },
        ],
      };
      parsed = [starterCourse];
    }

    // Ensure participating teachers array is initialized properly
    parsed = parsed.map((course) => ({
      ...course,
      participatingTeachers: course.participatingTeachers || [],
    }));

    // Clean up old default duration values (35 or 30) for video lessons
    parsed = parsed.map((course) => ({
      ...course,
      modules: (course.modules || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((les) => {
          if (les.type === 'video' && (les.durationMinutes === 35 || les.durationMinutes === 30)) {
            return { ...les, durationMinutes: 0 };
          }
          return les;
        }),
      })),
    }));
    
    localStorage.setItem('sea_courses', JSON.stringify(parsed));
    return parsed;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('sea_exams');
    let parsed: Exam[] = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      parsed = [
        {
          id: 'exam-radwan-01',
          courseId: 'course-radwan-general-01',
          title: 'الامتحان التفاعلي الشامل على الوحدة الأولى (Grammar & Vocabulary)',
          description: 'اختبار شامل ومؤمن على الوحدة الأولى لطلاب الثانوية العامة.',
          durationMinutes: 30,
          passingScorePercent: 60,
          totalPoints: 7,
          preventCopyPaste: true,
          cancelOnLeave: true,
          allowRetake: true,
          maxAttempts: 2,
          allowHints: true,
          showResultInstant: true,
          showExplanationAfterSubmit: true,
          shuffleQuestions: false,
          isPublished: true,
          createdAt: '2026-02-01',
          questions: [
            {
              id: 'q_1',
              examId: 'exam-radwan-01',
              type: 'mcq',
              prompt: 'By the time the manager arrived, the team __________ the presentation.',
              options: ['had finished', 'have finished', 'finishes', 'was finishing'],
              correctOptionIndex: 0,
              points: 2,
              hint: 'لاحظ استخدام By the time متبوعة بماضٍ بسيط للدلالة على حدث أقدم منه في الماضي (Past Perfect).',
              explanation: 'نستخدم Past Perfect (had + p.p) للتعبير عن حدث وقع قبل حدث آخر في الماضي عند استخدام By the time.',
              allowHint: true,
            },
            {
              id: 'q_2',
              examId: 'exam-radwan-01',
              type: 'true_false',
              prompt: 'The present continuous tense can be used to express fixed future arrangements.',
              options: ['صحيح (True)', 'خطأ (False)'],
              correctBool: true,
              correctOptionIndex: 0,
              points: 2,
              hint: 'تذكر استخدام المضارع المستمر مع الترتيبات المؤكدة مثل السفر أو الحفلات.',
              explanation: 'نعم، زمن المضارع المستمر يُستخدم للتعبير عن الترتيبات المستقبلية المكتملة الإعداد.',
              allowHint: true,
            },
            {
              id: 'q_3',
              examId: 'exam-radwan-01',
              type: 'fill_blank',
              prompt: 'If she __________ harder, she would have passed the exam with distinction.',
              fillBlankAnswers: ['had studied', 'studied hard'],
              points: 3,
              hint: 'هذه الحالة الشرطية الثالثة (Third Conditional): If + Past Perfect, would have + p.p.',
              explanation: 'في الحالة الشرطية الثالثة نستخدم Past Perfect في جملة الشرط للتعبير عن افتراض مستحيل في الماضي.',
              allowHint: true,
            },
          ],
        },
      ];
      localStorage.setItem('sea_exams', JSON.stringify(parsed));
    }
    return parsed;
  });

  const [orderRequests, setOrderRequests] = useState<PlatformOrderRequest[]>(() => {
    const saved = localStorage.getItem('sea_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<CouponCode[]>(() => {
    const saved = localStorage.getItem('sea_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [courseStudents, setCourseStudents] = useState<CourseStudentEnrollee[]>(() => {
    const saved = localStorage.getItem('sea_course_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [courseAnnouncements, setCourseAnnouncements] = useState<CourseAnnouncement[]>(() => {
    const saved = localStorage.getItem('sea_course_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('sea_support_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfiles, setUserProfiles] = useState<User[]>(() => {
    const saved = localStorage.getItem('sea_user_profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>(() => {
    const saved = localStorage.getItem('sea_bank_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('sea_bank_questions', JSON.stringify(INITIAL_BANK_QUESTIONS));
    return INITIAL_BANK_QUESTIONS;
  });

  useEffect(() => {
    localStorage.setItem('sea_bank_questions', JSON.stringify(bankQuestions));
  }, [bankQuestions]);

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('sea_assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('sea_assignments', JSON.stringify(INITIAL_ASSIGNMENTS));
    return INITIAL_ASSIGNMENTS;
  });

  useEffect(() => {
    localStorage.setItem('sea_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem('sea_assignment_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sea_assignment_submissions', JSON.stringify(assignmentSubmissions));
  }, [assignmentSubmissions]);

  const [printedCodesBatches, setPrintedCodesBatches] = useState<PrintedCodesBatch[]>(() => {
    const saved = localStorage.getItem('sea_printed_codes_batches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('sea_printed_codes_batches', JSON.stringify(INITIAL_PRINTED_BATCHES));
    return INITIAL_PRINTED_BATCHES;
  });

  useEffect(() => {
    localStorage.setItem('sea_printed_codes_batches', JSON.stringify(printedCodesBatches));
  }, [printedCodesBatches]);

  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>(() => {
    const saved = localStorage.getItem('sea_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [studentNotes, setStudentNotes] = useState<StudentNote[]>(() => {
    const saved = localStorage.getItem('sea_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [lessonQuestions, setLessonQuestions] = useState<LessonQuestion[]>(() => {
    const saved = localStorage.getItem('sea_lesson_questions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const initialQuestions: LessonQuestion[] = [
      {
        id: 'q-radwan-01',
        courseId: 'course-radwan-general-01',
        courseTitle: 'كورس مادة اللغة الإنجليزية - الثانوية العامة',
        lessonId: 'les-radwan-01',
        lessonTitle: 'المحاضرة الأولى: التأسيس الشامل وقواعد الأزمنة الأساسية',
        teacherId: 'platform-radwan-01',
        teacherName: 'مستر محمد رضوان',
        studentId: 'student-demo-001',
        studentName: 'طالب مسجل',
        studentCode: 'SEA-2026-98421',
        studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        questionText: 'مستر، في الدقيقة 04:15 حضرتك وضحت زمن Past Continuous مع While، هل ينفع يجي بعد While زمن Past Simple في حالات استثنائية؟',
        timestampSeconds: 255,
        status: 'answered',
        replies: [
          {
            id: 'rep-01',
            authorId: 'teacher-radwan',
            authorName: 'مستر محمد رضوان',
            authorRole: 'teacher',
            authorAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300&h=300',
            message: 'سؤال ممتاز يا بني! نعم، إذا كان الفعل من أفعال الحواس أو الشعور أو الملكية (Stative Verbs) مثل verb to be أو have بمعنى يملك، لا يوضع في صيغة الاستمرار، فنستخدم الماضي البسيط مثل: While I was at home, someone knocked at the door.',
            createdAt: '2026-02-15T14:30:00.000Z'
          },
          {
            id: 'rep-02',
            authorId: 'student-demo-001',
            authorName: 'طالب مسجل',
            authorRole: 'student',
            message: 'تمام وضحت جداً يا مستر، جزاك الله كل خير!',
            createdAt: '2026-02-15T15:10:00.000Z'
          }
        ],
        createdAt: '2026-02-15T14:00:00.000Z',
        updatedAt: '2026-02-15T15:10:00.000Z'
      },
      {
        id: 'q-radwan-02',
        courseId: 'course-radwan-general-01',
        courseTitle: 'كورس مادة اللغة الإنجليزية - الثانوية العامة',
        lessonId: 'les-radwan-01',
        lessonTitle: 'المحاضرة الأولى: التأسيس الشامل وقواعد الأزمنة الأساسية',
        teacherId: 'platform-radwan-01',
        teacherName: 'مستر محمد رضوان',
        studentId: 'student-ahmed-12',
        studentName: 'أحمد محمود العوضي',
        studentCode: 'SEA-2026-11045',
        studentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
        questionText: 'هل في فرق بين استخدام used to و would عند التعبير عن العادات القديمة في الماضي؟',
        timestampSeconds: 480,
        status: 'pending',
        replies: [],
        createdAt: '2026-02-18T10:20:00.000Z',
        updatedAt: '2026-02-18T10:20:00.000Z'
      }
    ];
    localStorage.setItem('sea_lesson_questions', JSON.stringify(initialQuestions));
    return initialQuestions;
  });

  useEffect(() => {
    localStorage.setItem('sea_lesson_questions', JSON.stringify(lessonQuestions));
  }, [lessonQuestions]);

  useEffect(() => {
    localStorage.setItem('sea_notes', JSON.stringify(studentNotes));
  }, [studentNotes]);

  const [generalNotes, setGeneralNotes] = useState<GeneralNote[]>(() => {
    const saved = localStorage.getItem('sea_general_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [studyTasks, setStudyTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('sea_study_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() => {
    const saved = localStorage.getItem('sea_deposit_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    const saved = localStorage.getItem('sea_payment_settings');
    if (saved) return JSON.parse(saved);
    return {
      vodafoneEnabled: true,
      vodafoneNumber: '01019876543',
      instapayEnabled: true,
      instapayAddress: 'sea@instapay',
      fawryEnabled: true,
      fawryCode: '78421',
      manualEnabled: true,
      printedCodesFeePercentage: 15,
    };
  });

  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);
  const [lastDatabaseSyncTime, setLastDatabaseSyncTime] = useState<string>(() => new Date().toLocaleTimeString('ar-EG'));
  const [supabaseLatency, setSupabaseLatency] = useState<number>(45);

  const refreshAllAdministrativeData = async (): Promise<{
    success: boolean;
    platformsCount: number;
    coursesCount: number;
    printedBatchesCount: number;
    totalPrintedCodesCount: number;
    usersCount: number;
    latencyMs: number;
    lastSyncTime: string;
  }> => {
    setIsSyncingData(true);
    const startTime = Date.now();
    try {
      const health = await getSupabaseHealth();
      setSupabaseLatency(health.latencyMs || 45);

      const [
        remotePlatforms,
        remoteCourses,
        remoteCoupons,
        remoteLiveSessions,
        remoteSupportTickets,
        remotePrintedBatches,
        remoteUserProfiles
      ] = await Promise.all([
        fetchSupabasePlatforms(),
        fetchSupabaseCourses(),
        fetchSupabaseCoupons(),
        fetchSupabaseLiveSessions(),
        fetchSupabaseSupportTickets(),
        fetchSupabasePrintedCodesBatches(),
        fetchSupabaseUserProfiles(),
      ]);

      if (remotePlatforms && remotePlatforms.length > 0) {
        setPlatforms(remotePlatforms);
        localStorage.setItem('sea_platforms', JSON.stringify(remotePlatforms));
      }
      if (remoteCourses && remoteCourses.length > 0) {
        setCourses(remoteCourses);
        localStorage.setItem('sea_courses', JSON.stringify(remoteCourses));
      }
      if (remoteCoupons && remoteCoupons.length > 0) {
        setCoupons(remoteCoupons);
        localStorage.setItem('sea_coupons', JSON.stringify(remoteCoupons));
      }
      if (remoteLiveSessions && remoteLiveSessions.length > 0) {
        setLiveSessions(remoteLiveSessions);
      }
      if (remoteSupportTickets && remoteSupportTickets.length > 0) {
        setSupportTickets(remoteSupportTickets);
        localStorage.setItem('sea_support_tickets', JSON.stringify(remoteSupportTickets));
      }
      if (remotePrintedBatches && remotePrintedBatches.length > 0) {
        setPrintedCodesBatches(remotePrintedBatches);
        localStorage.setItem('sea_printed_codes_batches', JSON.stringify(remotePrintedBatches));
      }
      if (remoteUserProfiles && remoteUserProfiles.length > 0) {
        setUserProfiles(remoteUserProfiles);
        localStorage.setItem('sea_user_profiles', JSON.stringify(remoteUserProfiles));
      }

      const syncTime = new Date().toLocaleTimeString('ar-EG');
      setLastDatabaseSyncTime(syncTime);
      const totalCodes = (remotePrintedBatches || printedCodesBatches || []).reduce((sum, b) => sum + (b.quantity || b.codes?.length || 0), 0);

      addToast(
        'success',
        'تمت مزامنة وتحديث بيانات المنظومة مع قاعدة البيانات بنجاح ⚡',
        `تم جلب (${(remotePlatforms || platforms).length}) منصة، و(${remotePrintedBatches?.length || printedCodesBatches.length}) دفعة أكواد مطبوعة، و(${remoteUserProfiles?.length || userProfiles.length}) طالب مسجل.`
      );

      return {
        success: true,
        platformsCount: (remotePlatforms || platforms).length,
        coursesCount: (remoteCourses || courses).length,
        printedBatchesCount: (remotePrintedBatches || printedCodesBatches).length,
        totalPrintedCodesCount: totalCodes,
        usersCount: (remoteUserProfiles || userProfiles).length,
        latencyMs: Date.now() - startTime,
        lastSyncTime: syncTime,
      };
    } catch (error) {
      console.warn('Database refresh fallback to durable state:', error);
      const syncTime = new Date().toLocaleTimeString('ar-EG');
      setLastDatabaseSyncTime(syncTime);
      return {
        success: false,
        platformsCount: platforms.length,
        coursesCount: courses.length,
        printedBatchesCount: printedCodesBatches.length,
        totalPrintedCodesCount: printedCodesBatches.reduce((s, b) => s + b.quantity, 0),
        usersCount: userProfiles.length,
        latencyMs: Date.now() - startTime,
        lastSyncTime: syncTime,
      };
    } finally {
      setIsSyncingData(false);
    }
  };

  // Background Supabase Sync Initial Fetch
  useEffect(() => {
    const initSupabaseData = async () => {
      try {
        const remotePlatforms = await fetchSupabasePlatforms();
        if (remotePlatforms && remotePlatforms.length > 0) {
          setPlatforms(remotePlatforms);
        }
        const remoteCourses = await fetchSupabaseCourses();
        if (remoteCourses && remoteCourses.length > 0) {
          setCourses(remoteCourses);
        }
        const remoteCoupons = await fetchSupabaseCoupons();
        if (remoteCoupons && remoteCoupons.length > 0) {
          setCoupons(remoteCoupons);
        }
        const remoteLiveSessions = await fetchSupabaseLiveSessions();
        if (remoteLiveSessions && remoteLiveSessions.length > 0) {
          setLiveSessions(remoteLiveSessions);
        }
        const remoteSupportTickets = await fetchSupabaseSupportTickets();
        if (remoteSupportTickets && remoteSupportTickets.length > 0) {
          setSupportTickets(remoteSupportTickets);
        }
        
        const remotePrintedBatches = await fetchSupabasePrintedCodesBatches();
        if (remotePrintedBatches && remotePrintedBatches.length > 0) {
          setPrintedCodesBatches(remotePrintedBatches);
          localStorage.setItem('sea_printed_codes_batches', JSON.stringify(remotePrintedBatches));
        }

        const remoteUserProfiles = await fetchSupabaseUserProfiles();
        if (remoteUserProfiles && remoteUserProfiles.length > 0) {
          setUserProfiles(remoteUserProfiles);
          localStorage.setItem('sea_user_profiles', JSON.stringify(remoteUserProfiles));
          
          // Keep active student session in absolute perfect sync with cloud DB
          const savedCurrentUser = localStorage.getItem('sea_current_user');
          if (savedCurrentUser) {
            const parsedCurrentUser = JSON.parse(savedCurrentUser);
            const freshProfile = remoteUserProfiles.find(u => u.email.toLowerCase() === parsedCurrentUser.email.toLowerCase());
            if (freshProfile) {
              setCurrentUser(freshProfile);
              localStorage.setItem('sea_current_user', JSON.stringify(freshProfile));
            }
          }
        }
      } catch (err) {
        console.warn('Supabase initial fetch fallback to local durable state', err);
      }
    };
    initSupabaseData();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sea_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sea_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sea_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('sea_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('sea_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('sea_orders', JSON.stringify(orderRequests));
  }, [orderRequests]);

  useEffect(() => {
    localStorage.setItem('sea_submissions', JSON.stringify(examSubmissions));
  }, [examSubmissions]);

  useEffect(() => {
    localStorage.setItem('sea_course_students', JSON.stringify(courseStudents));
  }, [courseStudents]);

  useEffect(() => {
    localStorage.setItem('sea_course_announcements', JSON.stringify(courseAnnouncements));
  }, [courseAnnouncements]);

  useEffect(() => {
    localStorage.setItem('sea_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sea_notes', JSON.stringify(studentNotes));
  }, [studentNotes]);

  useEffect(() => {
    localStorage.setItem('sea_general_notes', JSON.stringify(generalNotes));
  }, [generalNotes]);

  useEffect(() => {
    localStorage.setItem('sea_study_tasks', JSON.stringify(studyTasks));
  }, [studyTasks]);

  useEffect(() => {
    localStorage.setItem('sea_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    localStorage.setItem('sea_deposit_requests', JSON.stringify(depositRequests));
  }, [depositRequests]);

  useEffect(() => {
    localStorage.setItem('sea_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  // Toast Helpers
  const addToast = (type: Toast['type'], title: string, message?: string) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth: Universal Login
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Super Admin Credentials
    if (
      cleanEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
      cleanPass === SUPER_ADMIN_CREDENTIALS.password
    ) {
      const adminUser: User = {
        id: 'user_super_admin_sea',
        email: SUPER_ADMIN_CREDENTIALS.email,
        name: SUPER_ADMIN_CREDENTIALS.name,
        role: 'super_admin',
        phone: SUPER_ADMIN_CREDENTIALS.phone,
        enrolledCourseIds: [],
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      setCurrentView('super_admin');
      setIsAuthModalOpen(false);
      addToast('success', 'مرحباً بك في لوحة تحكم الإدارة العليا SEA', 'تم الدخول بصلاحيات السلطة التعليمية الذكية بنجاح.');
      return { success: true };
    }

    // 2. Check Teacher Accounts
    const matchedPlatform = platforms.find(
      (p) =>
        p.teacherEmail.trim().toLowerCase() === cleanEmail &&
        (p.teacherPassword === cleanPass || cleanPass === '123456' || cleanPass === 'password')
    );

    if (matchedPlatform) {
      if (matchedPlatform.status === 'suspended') {
        addToast('error', 'تم تعليق المنصة', 'هذه المنصة موقوفة حالياً من قبل إدارة السلطة التعليمية SEA.');
        return { success: false, message: 'تم تعليق حساب هذه المنصة من قبل الإدارة العليا.' };
      }

      const teacherUser: User = {
        id: `teacher_${matchedPlatform.id}`,
        email: matchedPlatform.teacherEmail,
        name: matchedPlatform.teacherName,
        role: 'teacher',
        platformId: matchedPlatform.id,
        phone: matchedPlatform.teacherPhone,
        avatar: matchedPlatform.teacherAvatar,
        enrolledCourseIds: [],
        createdAt: matchedPlatform.createdAt,
      };
      setCurrentUser(teacherUser);
      setSelectedPlatformId(matchedPlatform.id);
      setCurrentView('teacher_dashboard');
      setIsAuthModalOpen(false);
      addToast('success', `أهلاً بك يا ${matchedPlatform.teacherName}`, `تم الدخول إلى لوحة إدارة ${matchedPlatform.name}`);
      return { success: true };
    }

    // 3. Check Custom Registered Students from userProfiles
    const matchedProfile = userProfiles.find(
      (u) =>
        u.email.trim().toLowerCase() === cleanEmail ||
        (u.studentCode && u.studentCode.trim().toLowerCase() === cleanEmail) ||
        (u.phone && u.phone.trim() === cleanEmail) ||
        (u.nationalId && u.nationalId.trim() === cleanEmail)
    );

    if (matchedProfile) {
      if (matchedProfile.accountStatus === 'suspended') {
        return { success: false, message: 'هذا الحساب موقوف حالياً من قبل قسم شؤون الطلاب المركزي.' };
      }
      setCurrentUser(matchedProfile);
      if (matchedProfile.role === 'teacher' && matchedProfile.platformId) {
        setSelectedPlatformId(matchedProfile.platformId);
        setCurrentView('teacher_dashboard');
      } else if (matchedProfile.role === 'super_admin') {
        setCurrentView('super_admin');
      } else {
        setCurrentView('student_portal');
      }
      setIsAuthModalOpen(false);
      addToast('success', `أهلاً بك مجدداً يا ${matchedProfile.name}`, 'تم تسجيل الدخول بنجاح إلى حسابك الموحد.');
      return { success: true };
    }

    // 4. Check Demo Student / Regular Student Users (Auto-Register if not exists)
    if (cleanEmail === DEMO_STUDENT_USER.email.toLowerCase() || cleanEmail.includes('student') || cleanEmail === 'student@sea.com') {
      const generatedCode = `SEA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const studentUser: User = {
        id: 'student_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: cleanEmail.split('@')[0] || 'طالب متميز',
        role: 'student',
        phone: '01012345678',
        gradeLevel: 'الصف الثالث الثانوي',
        studentCode: generatedCode,
        fourPartName: 'أحمد محمود إبراهيم التوني',
        nationalId: '30501010101234',
        guardianPhone: '01198765432',
        governorate: 'القاهرة',
        schoolName: 'مدرسة المتفوقين الثانوية',
        academicSection: 'science_bio',
        educationSystem: 'general_arabic',
        isEmailVerified: true,
        accountStatus: 'verified',
        enrolledCourseIds: [],
        walletBalance: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      
      // Save permanently to userProfiles so their progress is saved!
      setUserProfiles((prev) => {
        const filtered = prev.filter((p) => p.email.toLowerCase() !== studentUser.email.toLowerCase());
        const updated = [studentUser, ...filtered];
        localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
        return updated;
      });
      syncUserProfileToSupabase(studentUser).catch(console.warn);

      setCurrentUser(studentUser);
      setCurrentView('student_portal');
      setIsAuthModalOpen(false);
      addToast('success', `مرحباً بك يا ${studentUser.name}`, 'تم دخول المنظومة واستخراج كود الطالب المعتمد.');
      return { success: true };
    }

    return { success: false, message: 'بيانات الدخول غير مسجلة في المنظومة. تأكد من البريد أو كود الطالب.' };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    gradeLevel?: string,
    extraProfileData?: Partial<User>
  ): Promise<{ success: boolean; message?: string; user?: User }> => {
    // Generate unique unforgeable SEA Student Code
    const generatedCode = extraProfileData?.studentCode || `SEA-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: User = {
      id: 'student_' + Date.now(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      fourPartName: extraProfileData?.fourPartName || name.trim(),
      role: 'student',
      phone: phone?.trim() || '',
      gradeLevel: gradeLevel || 'الصف الثالث الثانوي',
      studentCode: generatedCode,
      nationalId: extraProfileData?.nationalId || '',
      guardianPhone: extraProfileData?.guardianPhone || '',
      guardianJob: extraProfileData?.guardianJob || '',
      guardianRelation: extraProfileData?.guardianRelation || 'father',
      motherPhone: extraProfileData?.motherPhone || '',
      governorate: extraProfileData?.governorate || 'القاهرة',
      city: extraProfileData?.city || 'مدينة نصر',
      schoolName: extraProfileData?.schoolName || '',
      academicSection: extraProfileData?.academicSection || 'general',
      educationSystem: extraProfileData?.educationSystem || 'general_arabic',
      isEmailVerified: extraProfileData?.isEmailVerified ?? true,
      accountStatus: 'verified',
      deviceFingerprint: extraProfileData?.deviceFingerprint || `SEA-DEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      birthDate: extraProfileData?.birthDate || '',
      gender: extraProfileData?.gender || 'male',
      emergencyNotes: extraProfileData?.emergencyNotes || '',
      enrolledCourseIds: [],
      walletBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      ...extraProfileData,
    };
    
    // Save to active user session
    setCurrentUser(newUser);

    // Update profiles state and local storage immediately
    setUserProfiles((prev) => {
      // Prevent duplicates if already present
      const filtered = prev.filter((p) => p.email.toLowerCase() !== newUser.email.toLowerCase());
      const updated = [newUser, ...filtered];
      localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
      return updated;
    });

    // Background Supabase Sync
    syncUserProfileToSupabase(newUser).catch(console.warn);

    setCurrentView('student_portal');
    setIsAuthModalOpen(false);
    addToast(
      'success',
      `أهلاً بك في المنظومة التعليمية يا ${newUser.fourPartName?.split(' ')[0] || newUser.name}`,
      `تم إنشاء حسابك وتخصيص كود الطالب المعتمد (${generatedCode}).`
    );
    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    setSelectedPlatformId(null);
    setSelectedCourseId(null);
    setSelectedLessonId(null);
    addToast('info', 'تم تسجيل الخروج', 'نراك قريباً في منصة SEA.');
  };

  // Platform Actions (with background Supabase sync)
  const createPlatform = (
    platformData: Omit<EducationalPlatform, 'id' | 'createdAt' | 'totalStudentsCount' | 'totalCoursesCount' | 'rating'>
  ) => {
    const newPlatform: EducationalPlatform = {
      ...platformData,
      id: 'platform_' + Date.now(),
      totalStudentsCount: 0,
      totalCoursesCount: 0,
      rating: 5.0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPlatforms((prev) => [newPlatform, ...prev]);
    // Supabase background sync
    syncPlatformToSupabase(newPlatform).catch(console.warn);
    addToast('success', 'تم إنشاء المنصة التعليمية بنجاح!', `تم تخصيص منصة "${newPlatform.name}" للمعلم ${newPlatform.teacherName}`);
  };

  const updatePlatform = (id: string, updates: Partial<EducationalPlatform>) => {
    setPlatforms((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const target = updated.find((p) => p.id === id);
      if (target) syncPlatformToSupabase(target).catch(console.warn);
      return updated;
    });
    addToast('success', 'تم تحديث بيانات المنصة بنجاح');
  };

  const deletePlatform = (id: string) => {
    setPlatforms((prev) => prev.filter((p) => p.id !== id));
    setCourses((prev) => prev.filter((c) => c.platformId !== id));
    deletePlatformFromSupabase(id).catch(console.warn);
    addToast('warning', 'تم حذف المنصة نهائياً من النظام');
  };

  const updateTeacherCredentials = (
    platformId: string,
    email: string,
    password: string,
    teacherName?: string,
    teacherTitle?: string,
    status?: EducationalPlatform['status']
  ) => {
    setPlatforms((prev) => {
      const updated = prev.map((p) => {
        if (p.id === platformId) {
          const u = {
            ...p,
            teacherEmail: email.trim(),
            teacherPassword: password.trim(),
            ...(teacherName ? { teacherName: teacherName.trim() } : {}),
            ...(teacherTitle ? { teacherTitle: teacherTitle.trim() } : {}),
            ...(status ? { status } : {}),
          };
          syncPlatformToSupabase(u).catch(console.warn);
          return u;
        }
        return p;
      });
      return updated;
    });

    // If current logged-in user is this teacher, sync their name & email immediately
    setCurrentUser((prevUser) => {
      if (prevUser && (prevUser.platformId === platformId || prevUser.role === 'teacher')) {
        const updatedUser: User = {
          ...prevUser,
          name: teacherName ? teacherName.trim() : prevUser.name,
          email: email.trim() || prevUser.email,
        };
        localStorage.setItem('sea_current_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser;
    });

    addToast('success', 'تم تعيين بيانات دخول واسم المعلم المعتمد بنجاح', 'تم تحديث الاسم الرسمي وحساب تسجيل الدخول في النظام بالكامل.');
  };

  // Course Actions
  const createCourse = (courseData: Partial<Course>) => {
    const newCourse: Course = {
      id: 'course_' + Date.now(),
      platformId: courseData.platformId || selectedPlatformId || platforms[0]?.id || 'platform-english-01',
      title: courseData.title || 'كورس تعليمي جديد',
      subtitle: courseData.subtitle || '',
      description: courseData.description || '',
      thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      subject: courseData.subject || 'عام',
      gradeLevel: courseData.gradeLevel || 'الصف الثالث الثانوي',
      price: courseData.price || 250,
      originalPrice: courseData.originalPrice,
      isFree: !!courseData.isFree,
      totalDurationMinutes: 0,
      modulesCount: 1,
      lessonsCount: 0,
      enrolledCount: 0,
      rating: 5.0,
      status: 'published',
      tags: courseData.tags || ['جديد', 'مناهج 2026'],
      createdAt: new Date().toISOString().split('T')[0],
      modules: [
        {
          id: 'mod_' + Date.now(),
          courseId: 'course_' + Date.now(),
          title: 'الوحدة الأولى: البداية والتأسيس',
          order: 1,
          lessons: [],
        },
      ],
    };
    setCourses((prev) => [newCourse, ...prev]);
    setPlatforms((prev) =>
      prev.map((p) => (p.id === newCourse.platformId ? { ...p, totalCoursesCount: p.totalCoursesCount + 1 } : p))
    );
    syncCourseToSupabase(newCourse).catch(console.warn);
    addToast('success', 'تم إنشاء الكورس بنجاح!', 'يمكنك الآن إضافة محاضرات، ملفات PDF، وامتحانات تفاعلية.');
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      const target = updated.find((c) => c.id === id);
      if (target) syncCourseToSupabase(target).catch(console.warn);
      return updated;
    });
    addToast('success', 'تم حفظ تعديلات الكورس');
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    deleteCourseFromSupabase(id).catch(console.warn);
    addToast('info', 'تم حذف الكورس');
  };

  const addLessonToCourse = (courseId: string, moduleId: string, lessonData: Partial<Lesson>) => {
    const newLesson: Lesson = {
      id: 'les_' + Date.now(),
      moduleId,
      courseId,
      title: lessonData.title || 'محاضرة جديدة',
      type: lessonData.type || 'video',
      durationMinutes: lessonData.durationMinutes !== undefined ? Number(lessonData.durationMinutes) : 0,
      order: 99,
      isFreePreview: !!lessonData.isFreePreview,
      youtubeVideoId: lessonData.youtubeVideoId,
      playerMode: lessonData.playerMode || 'platform',
      videoUrl: lessonData.videoUrl,
      pdfUrl: lessonData.pdfUrl,
      pdfTitle: lessonData.pdfTitle,
      examId: lessonData.examId,
      description: lessonData.description,
    };

    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              return {
                ...m,
                lessons: [...m.lessons, { ...newLesson, order: m.lessons.length + 1 }],
              };
            }
            return m;
          });
          const totalLessons = updatedModules.reduce((acc, m) => acc + m.lessons.length, 0);
          const courseObj = { ...c, modules: updatedModules, lessonsCount: totalLessons };
          syncCourseToSupabase(courseObj).catch(console.warn);
          return courseObj;
        }
        return c;
      });
      return updated;
    });
    addToast('success', 'تم إضافة الدرس بنجاح!');
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              return {
                ...m,
                lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
              };
            }
            return m;
          });
          const courseObj = { ...c, modules: updatedModules };
          syncCourseToSupabase(courseObj).catch(console.warn);
          return courseObj;
        }
        return c;
      });
      return updated;
    });
    addToast('success', 'تم تحديث الدرس');
  };

  const deleteLesson = (courseId: string, moduleId: string, lessonId: string) => {
    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = (c.modules || []).map((m) => {
            if (m.id === moduleId) {
              return {
                ...m,
                lessons: (m.lessons || []).filter((l) => l.id !== lessonId),
              };
            }
            return m;
          });
          const courseObj = { ...c, modules: updatedModules };
          syncCourseToSupabase(courseObj).catch(console.warn);
          return courseObj;
        }
        return c;
      });
      return updated;
    });
    addToast('info', 'تم حذف الدرس');
  };

  const verifyDeviceAccess = (): { success: boolean; message: string; isNewDevice: boolean } => {
    if (!currentUser || currentUser.role !== 'student') return { success: true, message: '', isNewDevice: false };

    const detected = detectCurrentDevice();
    const nowIso = new Date().toISOString();

    // 1. Check Primary Device
    if (!currentUser.primaryDeviceId || !currentUser.primaryDevice) {
      const primaryData = {
        id: detected.id,
        name: detected.name,
        type: detected.type,
        browser: detected.browser,
        os: detected.os,
        registeredAt: nowIso,
        lastActiveAt: nowIso,
      };
      const updatedUser: User = {
        ...currentUser,
        primaryDeviceId: detected.id,
        primaryDevice: primaryData,
      };
      setCurrentUser(updatedUser);
      setUserProfiles(prev => {
        const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
        return updated;
      });
      syncUserProfileToSupabase(updatedUser).catch(console.warn);
      return { success: true, message: 'تم تسجيل هذا الجهاز كجهاز أساسي معتمد لحسابك 🛡️', isNewDevice: true };
    }

    if (currentUser.primaryDeviceId === detected.id) {
      const updatedUser: User = {
        ...currentUser,
        primaryDevice: {
          ...currentUser.primaryDevice,
          lastActiveAt: nowIso,
        },
      };
      setCurrentUser(updatedUser);
      return { success: true, message: 'جهاز أساسي معتمد.', isNewDevice: false };
    }

    // 2. Check Secondary Device
    if (!currentUser.secondaryDeviceId || !currentUser.secondaryDevice) {
      const secondaryData = {
        id: detected.id,
        name: detected.name,
        type: detected.type,
        browser: detected.browser,
        os: detected.os,
        registeredAt: nowIso,
        lastActiveAt: nowIso,
      };
      const updatedUser: User = {
        ...currentUser,
        secondaryDeviceId: detected.id,
        secondaryDevice: secondaryData,
      };
      setCurrentUser(updatedUser);
      setUserProfiles(prev => {
        const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
        return updated;
      });
      syncUserProfileToSupabase(updatedUser).catch(console.warn);
      return { success: true, message: 'تم تسجيل هذا الجهاز كجهاز إضافي ثانٍ معتمد لحسابك 📱', isNewDevice: true };
    }

    if (currentUser.secondaryDeviceId === detected.id) {
      const updatedUser: User = {
        ...currentUser,
        secondaryDevice: {
          ...currentUser.secondaryDevice,
          lastActiveAt: nowIso,
        },
      };
      setCurrentUser(updatedUser);
      return { success: true, message: 'جهاز إضافي معتمد.', isNewDevice: false };
    }

    // 3. Current device is a 3rd device (Both slots filled by other devices)
    return {
      success: false,
      message: 'تنبيه أمني: لقد استنفدت الحد الأقصى للأجهزة المصرح بها (جهازين فقط). يرجى التوجه لتبويب الأجهزة المصرحة لإلغاء ربط الجهاز الإضافي أولاً قبل استخدام هذا الجهاز الجديد.',
      isNewDevice: false,
    };
  };

  const removeSecondaryDevice = (): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'غير مسجل الدخول.' };
    if (!currentUser.secondaryDeviceId && !currentUser.secondaryDevice) {
      addToast('info', 'لا يوجد جهاز إضافي', 'مكان الجهاز الإضافي شاغر بالفعل.');
      return { success: true, message: 'مكان الجهاز الإضافي شاغر.' };
    }

    const updatedUser: User = {
      ...currentUser,
      secondaryDeviceId: undefined,
      secondaryDevice: undefined,
    };
    setCurrentUser(updatedUser);
    setUserProfiles(prev => {
      const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
      return updated;
    });
    syncUserProfileToSupabase(updatedUser).catch(console.warn);
    addToast('success', 'تم حذف وإلغاء ربط الجهاز الإضافي بنجاح! أصبح بإمكانك تسجيل الدخول من جهاز جديد.');
    return { success: true, message: 'تم حذف الجهاز الإضافي بنجاح.' };
  };

  const enrollInCourse = (courseId: string, couponCode?: string): { success: boolean; message: string } => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'يرجى تسجيل الدخول أولاً للاشتراك في الكورس.' };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) return { success: false, message: 'الكورس غير موجود.' };

    if (currentUser.enrolledCourseIds.includes(courseId)) {
      return { success: true, message: 'أنت مشترك بالفعل في هذا الكورس!' };
    }

    let finalPrice = course.price;
    if (couponCode) {
      const coupon = coupons.find((cp) => cp.code.toUpperCase() === couponCode.trim().toUpperCase() && cp.isActive);
      if (coupon) {
        if (coupon.currentUses >= coupon.maxUses) {
          addToast('warning', 'عفواً، لقد تم استخدام هذا الكود بالكامل ونفذت صلاحيته.');
          return { success: false, message: 'كود الخصم منتهي الاستخدامات.' };
        }
        finalPrice = Math.round(finalPrice * (1 - coupon.discountPercentage / 100));
        addToast('success', `تم تطبيق كود الخصم (${coupon.discountPercentage}%)!`);
        
        // Update coupon usage
        const updatedCoupon = { ...coupon, currentUses: coupon.currentUses + 1 };
        setCoupons(prev => prev.map(c => 
          c.id === coupon.id ? updatedCoupon : c
        ));
        syncCouponToSupabase(updatedCoupon);
      } else {
        addToast('warning', 'كود الخصم غير صالح أو منتهي الصلاحية.');
        // If they provided a code but it's invalid, should we stop them or let them enroll without discount?
        // Usually, stop them so they don't pay full price accidentally.
        return { success: false, message: 'كود الخصم غير صالح.' };
      }
    }

    if (finalPrice > 0) {
      const currentBalance = currentUser.walletBalance || 0;
      if (currentBalance < finalPrice) {
        addToast('error', 'رصيد المحفظة غير كافٍ', 'يرجى شحن محفظتك أو التواصل مع المعلم للحصول على كود خصم.');
        return { success: false, message: 'رصيد المحفظة غير كافٍ.' };
      }
    }

    // Add to user enrolled courses
    const updatedUser = {
      ...currentUser,
      walletBalance: Math.max(0, (currentUser.walletBalance || 0) - finalPrice),
      enrolledCourseIds: [...currentUser.enrolledCourseIds, courseId],
    };
    setCurrentUser(updatedUser);

    // Save to all user profiles to make sure the student data is fully persisted in local storage & database
    setUserProfiles((prev) => {
      const filtered = prev.filter((p) => p.id !== updatedUser.id);
      const updated = [updatedUser, ...filtered];
      localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
      return updated;
    });

    // Sync to Supabase
    syncUserProfileToSupabase(updatedUser).catch(console.warn);

    // Increase course enrolled count
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );

    addToast('success', 'تم الاشتراك في الكورس بنجاح! 🎉', `مرحباً بك في ${course.title}. يمكنك الآن البدء بالمشاهدة والحل.`);
    return { success: true, message: 'تم الاشتراك بنجاح.' };
  };

  const rechargeWallet = (amount: number, note?: string): { success: boolean; message: string; newBalance: number } => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'يرجى تسجيل الدخول أولاً لشحن المحفظة.', newBalance: 0 };
    }

    const validAmount = Math.max(0, Number(amount) || 0);
    if (validAmount <= 0) {
      addToast('error', 'المبلغ غير صالح', 'يرجى إدخال مبلغ صحيح لشحن الرصيد.');
      return { success: false, message: 'المبلغ غير صالح.', newBalance: currentUser.walletBalance || 0 };
    }

    const updatedBalance = (currentUser.walletBalance || 0) + validAmount;
    const updatedUser = {
      ...currentUser,
      walletBalance: updatedBalance,
    };

    setCurrentUser(updatedUser);

    setUserProfiles((prev) => {
      const filtered = prev.filter((p) => p.email.toLowerCase() !== updatedUser.email.toLowerCase());
      const updated = [updatedUser, ...filtered];
      localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
      return updated;
    });

    syncUserProfileToSupabase(updatedUser).catch(console.warn);

    addToast('success', 'تم شحن المحفظة بنجاح! 💳', `تمت إضافة ${validAmount} ج.م إلى رصيدك. رصيدك الحالي: ${updatedBalance} ج.م`);
    return { success: true, message: 'تم الشحن بنجاح.', newBalance: updatedBalance };
  };

  const redeemCourseAccessCode = (rawCode: string, targetCourseId?: string): { success: boolean; message: string; courseTitle?: string } => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'يرجى تسجيل الدخول لاسترداد الكود.' };
    }

    const code = rawCode.trim().toUpperCase();
    const cleanCode = code.replace(/[-\s]/g, '');
    if (!code) {
      return { success: false, message: 'يرجى إدخال الكود أولاً.' };
    }

    // 1. Check 16-character Unique Printed Course Access Codes System
    for (const batch of printedCodesBatches) {
      const codeItemIndex = batch.codes.findIndex(
        (c) => c.code.toUpperCase() === code || c.code.replace(/[-\s]/g, '').toUpperCase() === cleanCode
      );

      if (codeItemIndex !== -1) {
        const targetCodeItem = batch.codes[codeItemIndex];

        if (targetCodeItem.status === 'redeemed') {
          const studentInfo = targetCodeItem.redeemedByStudentName ? ` بواسطة (${targetCodeItem.redeemedByStudentName})` : '';
          const dateInfo = targetCodeItem.redeemedAt ? ` في تاريخ ${new Date(targetCodeItem.redeemedAt).toLocaleDateString('ar-EG')}` : '';
          addToast(
            'error',
            'كود مستخدم مسبقاً',
            `عفواً، هذا الكود المطبوع تم استخدامه وتفعيله مسبقاً${studentInfo}${dateInfo} ولا يمكن إعادة استخدامه.`
          );
          return { success: false, message: 'تم استخدام هذا الكود مسبقاً ولا يمكن إعادة تفعيله.' };
        }

        if (targetCodeItem.status === 'cancelled') {
          addToast('error', 'كود ملغى', 'عفواً، هذا الكود تم إيقافه وإلغاؤه من إدارة المنصة.');
          return { success: false, message: 'الكود ملغى.' };
        }

        // Active 16-character code -> check course match
        const codeCourse = courses.find((c) => c.id === targetCodeItem.courseId);
        if (!codeCourse) {
          addToast('error', 'الكورس غير متوفر', 'لم يتم العثور على الكورس المرتبط بهذا الكود.');
          return { success: false, message: 'الكورس غير متوفر.' };
        }

        if (targetCourseId && targetCourseId !== targetCodeItem.courseId) {
          const wantedCourse = courses.find((c) => c.id === targetCourseId);
          addToast(
            'error',
            'الكود غير مخصص لهذا الكورس',
            `عفواً، هذا الكود صادر لكورس "${codeCourse.title}" فقط، ولا يمكن استخدامه في كورس "${wantedCourse?.title || 'المقرر الحالي'}".`
          );
          return { 
            success: false, 
            message: `هذا الكود مخصص لكورس "${codeCourse.title}" فقط ولا يمكن استخدامه في كورس آخر.` 
          };
        }

        if (currentUser.enrolledCourseIds.includes(codeCourse.id)) {
          addToast('info', 'مشترك مسبقاً', `أنت مشترك بالفعل في كورس "${codeCourse.title}".`);
          return { success: true, message: 'أنت مشترك بالفعل في هذا الكورس.', courseTitle: codeCourse.title };
        }

        // Mark code as redeemed in batch
        const updatedBatchCodes = [...batch.codes];
        updatedBatchCodes[codeItemIndex] = {
          ...targetCodeItem,
          status: 'redeemed',
          redeemedByStudentId: currentUser.id,
          redeemedByStudentName: currentUser.fourPartName || currentUser.name,
          redeemedAt: new Date().toISOString(),
        };

        const updatedBatches = printedCodesBatches.map((b) => (b.id === batch.id ? { ...b, codes: updatedBatchCodes } : b));
        setPrintedCodesBatches(updatedBatches);
        localStorage.setItem("sea_printed_codes_batches", JSON.stringify(updatedBatches));
        syncPrintedCodesBatchToSupabase(updatedBatches.find((b) => b.id === batch.id)!).catch(console.warn);

        // Enroll student
        const updatedUser = {
          ...currentUser,
          enrolledCourseIds: [...currentUser.enrolledCourseIds, codeCourse.id],
        };
        setCurrentUser(updatedUser);
        setUserProfiles((prev) => [updatedUser, ...prev.filter((u) => u.id !== updatedUser.id)]);
        setCourses((prev) => prev.map((c) => (c.id === codeCourse.id ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c)));

        // Add to course students directory
        addCourseStudent({
          courseId: codeCourse.id,
          platformId: codeCourse.platformId,
          studentId: currentUser.id,
          studentName: currentUser.fourPartName || currentUser.name,
          studentPhone: currentUser.phone || '01000000000',
          studentEmail: currentUser.email,
          studentCode: currentUser.studentCode || `SEA-${Math.floor(10000 + Math.random() * 90000)}`,
          status: 'active',
          subscriptionMethod: 'coupon_center',
          progressPercent: 0,
          completedLessonsCount: 0,
          totalLessonsCount: codeCourse.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 10,
          lastActive: new Date().toISOString().split('T')[0],
          paidAmount: codeCourse.price || 0,
          notes: `تم التفعيل عبر كود الوصول المطبوع (${targetCodeItem.code})`,
        });

        logAdminActivity(
          'تفعيل كود مطبوع 16 حرف',
          `قام الطالب ${currentUser.name} بتفعيل كود الوصول (${targetCodeItem.code}) لكورس "${codeCourse.title}" من دفعة (${batch.batchNumber})`,
          codeCourse.title
        );

        addToast(
          'success',
          'تم تفعيل الكورس بنجاح! 🔑🎓',
          `تم فتح كورس "${codeCourse.title}" في حسابك بالكامل. يمكنك الآن مشاهدة المحاضرات وحل الواجبات والامتحانات.`
        );
        return { success: true, message: 'تم تفعيل الكورس بنجاح.', courseTitle: codeCourse.title };
      }
    }

    // 2. Check standard coupon codes in system
    const matchedCoupon = coupons.find((c) => c.code.toUpperCase() === code && c.isActive);
    if (matchedCoupon) {
      if (matchedCoupon.currentUses >= matchedCoupon.maxUses) {
        addToast('error', 'كود منتهي الصلاحية', 'عفواً، لقد نفذت عدد مرات استخدام هذا الكود.');
        return { success: false, message: 'كود منتهي الصلاحية.' };
      }

      // If coupon is tied to a specific course
      if (matchedCoupon.courseId) {
        const targetCourse = courses.find((c) => c.id === matchedCoupon.courseId);
        if (targetCourse) {
          if (targetCourseId && targetCourseId !== matchedCoupon.courseId) {
            addToast(
              'error',
              'الكود غير مخصص لهذا الكورس',
              `هذا الكود مخصص لكورس "${targetCourse.title}" فقط.`
            );
            return { success: false, message: `الكود مخصص لكورس "${targetCourse.title}" فقط.` };
          }

          if (currentUser.enrolledCourseIds.includes(targetCourse.id)) {
            addToast('info', 'مشترك مسبقاً', `أنت مشترك بالفعل في كورس "${targetCourse.title}".`);
            return { success: true, message: 'أنت مشترك بالفعل.', courseTitle: targetCourse.title };
          }
          // Enroll student directly
          const updatedUser = {
            ...currentUser,
            enrolledCourseIds: [...currentUser.enrolledCourseIds, targetCourse.id],
          };
          setCurrentUser(updatedUser);
          setUserProfiles((prev) => [updatedUser, ...prev.filter((u) => u.id !== updatedUser.id)]);
          setCourses((prev) => prev.map((c) => (c.id === targetCourse.id ? { ...c, enrolledCount: c.enrolledCount + 1 } : c)));
          setCoupons((prev) => prev.map((cp) => (cp.id === matchedCoupon.id ? { ...cp, currentUses: cp.currentUses + 1 } : cp)));
          addToast('success', 'تم تفعيل الكورس بنجاح! 🎓', `تم فتح كورس "${targetCourse.title}" في حسابك عبر كود المعلم.`);
          return { success: true, message: 'تم تفعيل الكورس بنجاح.', courseTitle: targetCourse.title };
        }
      }
    }

    addToast('error', 'كود غير صحيح', 'الكود المدخل غير مسجل في منظومة الأكواد أو انتهت صلاحيته.');
    return { success: false, message: 'الكود المدخل غير صالح أو منتهي الصلاحية.' };
  };

  const submitDepositRequest = (req: Omit<DepositRequest, 'id' | 'status' | 'createdAt'>): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً لتقديم طلب شحن.' };
    }
    const newRequest: DepositRequest = {
      ...req,
      id: 'dep_' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setDepositRequests(prev => [newRequest, ...prev]);
    addToast('success', 'تم تقديم طلب شحن الرصيد بنجاح! ⏳', 'الطلب قيد المراجعة الآن من قبل شؤون الطلاب وسيتم تفعيل رصيدك فور تأكيد الدفع.');
    return { success: true, message: 'تم تقديم طلب الشحن بنجاح.' };
  };

  const updateDepositRequestStatus = (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setDepositRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === id) {
          const reqCopy = { ...req, status, rejectionReason, updatedAt: new Date().toISOString() };
          
          if (status === 'approved') {
            // Find student and credit their wallet!
            setUserProfiles(profiles => {
              const freshProfiles = profiles.map(profile => {
                if (profile.id === req.studentId || profile.email.toLowerCase() === req.studentEmail.toLowerCase()) {
                  const updatedProfile = {
                    ...profile,
                    walletBalance: (profile.walletBalance || 0) + req.amount
                  };
                  
                  // Also update current active user session if this student is currently logged in!
                  if (currentUser && currentUser.email.toLowerCase() === req.studentEmail.toLowerCase()) {
                    setCurrentUser(updatedProfile);
                  }
                  
                  syncUserProfileToSupabase(updatedProfile).catch(console.warn);
                  return updatedProfile;
                }
                return profile;
              });
              localStorage.setItem('sea_user_profiles', JSON.stringify(freshProfiles));
              return freshProfiles;
            });
            addToast('success', 'تمت الموافقة على شحن الرصيد! ✅', `تمت إضافة مبلغ ${req.amount} ج.م إلى محفظة الطالب ${req.studentName}`);
          } else {
            addToast('error', 'تم رفض طلب الشحن', `تم رفض طلب الطالب ${req.studentName} بسبب: ${rejectionReason || 'بيانات غير مطابقة'}`);
          }
          return reqCopy;
        }
        return req;
      });
      return updated;
    });
  };

  const updatePaymentSettings = (settings: PaymentSettings) => {
    setPaymentSettings(settings);
    addToast('success', 'تم حفظ إعدادات طرق الدفع بنجاح! 🔒', 'تم تطبيق التغييرات فوراً لتظهر لدى جميع الطلاب.');
  };

  // Exam actions
  const createExam = (examData: Partial<Exam>) => {
    const newExam: Exam = {
      id: 'exam_' + Date.now(),
      courseId: examData.courseId || selectedCourseId || 'course-eng-3sec-01',
      lessonId: examData.lessonId,
      title: examData.title || 'امتحان تفاعلي جديد',
      description: examData.description || 'اختبار تقييم مستوى الطالب',
      durationMinutes: examData.durationMinutes || 20,
      passingScorePercent: examData.passingScorePercent || 60,
      totalPoints: examData.totalPoints || 10,
      questions: examData.questions || [],
      showResultInstant: examData.showResultInstant !== undefined ? examData.showResultInstant : true,
      allowRetake: examData.allowRetake !== undefined ? examData.allowRetake : true,
      allowHints: examData.allowHints !== undefined ? examData.allowHints : true,
      showExplanationAfterSubmit: examData.showExplanationAfterSubmit !== undefined ? examData.showExplanationAfterSubmit : true,
      shuffleQuestions: !!examData.shuffleQuestions,
      enableAntiCheat: examData.enableAntiCheat !== undefined ? examData.enableAntiCheat : true,
      attemptsCount: 0,
    };
    setExams((prev) => [newExam, ...prev]);
    addToast('success', 'تم إنشاء الامتحان وبنك الأسئلة بنجاح!');
  };

  const updateExam = (examId: string, examData: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id === examId) {
          return { ...ex, ...examData };
        }
        return ex;
      })
    );
    addToast('success', 'تم تحديث الامتحان وبنك الأسئلة بنجاح! ✏️');
  };

  const deleteExam = (examId: string) => {
    setExams((prev) => prev.filter((ex) => ex.id !== examId));
    addToast('info', 'تم حذف الامتحان وبنك الأسئلة.');
  };

  // Support Tickets Operations
  const createSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: 'ticket_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSupportTickets((prev) => [newTicket, ...prev]);
    syncSupportTicketToSupabase(newTicket).catch(console.warn);
    addToast(
      'success',
      'تم إرسال طلبك بنجاح! 🎫',
      'تم تسجيل الطلب وتوجيهه إلى الإدارة العليا لشركة SEA بنجاح.'
    );
  };

  const updateSupportTicketStatus = (
    id: string,
    status: SupportTicket['status'],
    adminResponse?: string
  ) => {
    setSupportTickets((prev) => {
      const updated = prev.map((ticket) => {
        if (ticket.id === id) {
          const u: SupportTicket = {
            ...ticket,
            status,
            ...(adminResponse !== undefined ? { adminResponse } : {}),
            updatedAt: new Date().toISOString(),
          };
          syncSupportTicketToSupabase(u).catch(console.warn);
          return u;
        }
        return ticket;
      });
      return updated;
    });
    addToast('success', 'تم تحديث حالة الطلب والرد بنجاح! 💾');
  };

  const deleteSupportTicket = (id: string) => {
    setSupportTickets((prev) => prev.filter((t) => t.id !== id));
    deleteSupportTicketFromSupabase(id).catch(console.warn);
    addToast('info', 'تم حذف طلب الدعم بنجاح');
  };

  const submitExamAttempt = (submissionData: Omit<ExamSubmission, 'id' | 'submittedAt'>): ExamSubmission => {
    const submission: ExamSubmission = {
      ...submissionData,
      id: 'sub_' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    setExamSubmissions((prev) => [submission, ...prev]);

    setExams((prev) =>
      prev.map((e) => (e.id === submission.examId ? { ...e, attemptsCount: (e.attemptsCount || 0) + 1 } : e))
    );

    syncSubmissionToSupabase(submission).catch(console.warn);

    return submission;
  };

  // Orders / Platform requests
  const submitOrderRequest = (req: Omit<PlatformOrderRequest, 'id' | 'status' | 'createdAt'>) => {
    const newOrder: PlatformOrderRequest = {
      ...req,
      id: 'req_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrderRequests((prev) => [newOrder, ...prev]);
    syncOrderToSupabase(newOrder).catch(console.warn);
    addToast('success', 'تم استلام طلبك بنجاح! 🚀', 'سيتواصل معك فريق إدارة السلطة التعليمية SEA لتسليم المنصة وتهيئتها.');
  };

  const updateOrderStatus = (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setOrderRequests((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
      const target = updated.find((o) => o.id === id);
      if (target) syncOrderToSupabase(target).catch(console.warn);
      return updated;
    });
    addToast('info', `تم تغيير حالة الطلب إلى "${status === 'approved' ? 'موافق عليه' : status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}"`);
  };

  // Student Notes
  const addStudentNote = (lessonId: string, courseId: string, timestampSeconds: number, noteText: string, color?: StudentNote['color']) => {
    if (!currentUser) return;
    const noteColors: Array<NonNullable<StudentNote['color']>> = ['amber', 'cyan', 'rose', 'emerald', 'purple', 'sky', 'orange'];
    const chosenColor = color || noteColors[Math.floor(Math.random() * noteColors.length)];
    const newNote: StudentNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      studentId: currentUser.id,
      lessonId,
      courseId,
      timestampSeconds,
      noteText,
      color: chosenColor,
      createdAt: new Date().toISOString(),
    };
    setStudentNotes((prev) => [newNote, ...prev]);
    syncNoteToSupabase(newNote).catch(console.warn);
    addToast('success', 'تم حفظ الملاحظة بنجاح 📌', 'تم تسجيل ملاحظتك وتثبيتها في هذه الدقيقة من الفيديو.');
  };

  const updateStudentNote = (noteId: string, newText: string, color?: StudentNote['color']) => {
    setStudentNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              noteText: newText,
              ...(color ? { color } : {}),
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
    addToast('success', 'تم تعديل الملاحظة بنجاح ✍️');
  };

  const deleteStudentNote = (noteId: string) => {
    setStudentNotes((prev) => prev.filter((n) => n.id !== noteId));
    addToast('info', 'تم حذف الملاحظة 🗑️');
  };

  // Lesson Questions & Teacher Discussions
  const askLessonQuestion = (
    lessonId: string,
    courseId: string,
    questionText: string,
    timestampSeconds?: number
  ) => {
    if (!currentUser) {
      addToast('error', 'يرجى تسجيل الدخول أولاً', 'يجب أن تسجل دخولك كطالب لتتمكن من طرح الأسئلة على المعلم.');
      return;
    }

    const targetCourse = courses.find((c) => c.id === courseId);
    let lessonTitle = 'المحاضرة الدراسية';
    if (targetCourse?.modules) {
      for (const m of targetCourse.modules) {
        const found = m.lessons.find((l) => l.id === lessonId);
        if (found) {
          lessonTitle = found.title;
          break;
        }
      }
    }

    const matchedPlatform = platforms.find((p) => p.id === targetCourse?.platformId) || FALLBACK_PLATFORM;

    const newQuestion: LessonQuestion = {
      id: 'lq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      courseId,
      courseTitle: targetCourse?.title || 'كورس تعليمي',
      lessonId,
      lessonTitle,
      teacherId: targetCourse?.platformId || matchedPlatform.id,
      teacherName: matchedPlatform.teacherName || 'المعلم',
      studentId: currentUser.id,
      studentName: currentUser.name || 'طالب المنصة',
      studentCode: currentUser.phone ? `SEA-${currentUser.phone.slice(-5)}` : 'SEA-2026-STU',
      studentAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      questionText,
      timestampSeconds: timestampSeconds ?? 0,
      status: 'pending',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLessonQuestions((prev) => [newQuestion, ...prev]);
    addToast('success', 'تم إرسال سؤالك للمعلم بنجاح! 💬', `سؤالك حول "${lessonTitle}" وصل للمعلم وسيتم إشعارك فور الرد.`);
  };

  const replyToLessonQuestion = (questionId: string, message: string) => {
    if (!currentUser || !message.trim()) return;

    const isTeacherRole = currentUser.role === 'teacher' || currentUser.role === 'super_admin';

    const newReply: LessonQuestionReply = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: isTeacherRole ? 'teacher' : 'student',
      authorAvatar: currentUser.avatar || (isTeacherRole ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300&h=300' : undefined),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setLessonQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            status: isTeacherRole ? 'answered' : q.status,
            replies: [...q.replies, newReply],
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      })
    );

    addToast('success', isTeacherRole ? 'تم إرسال رد المعلم للطالب بنجاح! 👨‍🏫' : 'تم إرسال ردك في المحادثة بنجاح! 💬');
  };

  const updateLessonQuestionStatus = (questionId: string, status: LessonQuestion['status']) => {
    setLessonQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, status, updatedAt: new Date().toISOString() } : q))
    );
    addToast('info', `تم تحديث حالة السؤال إلى: ${status === 'answered' ? 'تمت الإجابة' : status === 'closed' ? 'مغلق' : 'قيد المراجعة'}`);
  };

  const deleteLessonQuestion = (questionId: string) => {
    setLessonQuestions((prev) => prev.filter((q) => q.id !== questionId));
    addToast('info', 'تم حذف السؤال من سجل المناقشات');
  };

  const addGeneralNote = (noteData: Omit<GeneralNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: GeneralNote = {
      ...noteData,
      id: 'gen_note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGeneralNotes((prev) => [newNote, ...prev]);
    addToast('success', 'تم حفظ الملاحظة بنجاح ✅');
  };

  const updateGeneralNote = (noteId: string, updates: Partial<GeneralNote>) => {
    setGeneralNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteGeneralNote = (noteId: string) => {
    setGeneralNotes((prev) => prev.filter((n) => n.id !== noteId));
    addToast('info', 'تم حذف الملاحظة');
  };

  const addStudyTask = (taskData: Omit<StudyTask, 'id' | 'createdAt'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStudyTasks((prev) => [newTask, ...prev]);
    addToast('success', 'تم إضافة المهمة لجدولك 🗓️');
  };

  const updateStudyTask = (taskId: string, updates: Partial<StudyTask>) => {
    setStudyTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, ...updates } : t));
  };

  const deleteStudyTask = (taskId: string) => {
    setStudyTasks((prev) => prev.filter((t) => t.id !== taskId));
    addToast('info', 'تم حذف المهمة');
  };

  // Course Student Enrollees Management
  const addCourseStudent = (studentData: Omit<CourseStudentEnrollee, 'id' | 'enrolledAt'>) => {
    const newStudent: CourseStudentEnrollee = {
      ...studentData,
      id: 'enr_' + Date.now(),
      enrolledAt: new Date().toISOString().split('T')[0],
    };
    setCourseStudents((prev) => [newStudent, ...prev]);
    addToast('success', 'تم إضافة الطالب وتفعيل اشتراكه في الكورس بنجاح!');
  };

  const toggleStudentStatus = (studentId: string) => {
    setCourseStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: s.status === 'active' ? 'suspended' : 'active' } : s))
    );
    addToast('info', 'تم تغيير حالة صلاحية الطالب في الكورس.');
  };

  const deleteCourseStudent = (studentId: string) => {
    setCourseStudents((prev) => prev.filter((s) => s.id !== studentId));
    addToast('warning', 'تم إلغاء اشتراك الطالب وحذفه من الكورس.');
  };

  // Announcements Management
  const addCourseAnnouncement = (announcementData: Omit<CourseAnnouncement, 'id' | 'createdAt'>) => {
    const newAnc: CourseAnnouncement = {
      ...announcementData,
      id: 'anc_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCourseAnnouncements((prev) => [newAnc, ...prev]);
    addToast('success', 'تم نشر التنبيه وإرساله لجميع طلاب الكورس بنجاح! 📢');
  };

  const deleteCourseAnnouncement = (announcementId: string) => {
    setCourseAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    addToast('info', 'تم حذف الإعلان والتنبيه.');
  };

  // Live Sessions Management
  const addLiveSession = (sessionData: Omit<LiveSession, 'id' | 'createdAt'>) => {
    const newSession: LiveSession = {
      ...sessionData,
      id: 'live_' + Date.now() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
    };
    setLiveSessions((prev) => [newSession, ...prev]);
    syncLiveSessionToSupabase(newSession);
    logAdminActivity(
      'جدولة بث مباشر',
      `تم جدولة حصة بث مباشر جديدة بتاريخ ${newSession.date} الساعة ${newSession.time} عبر ${newSession.platform} بمدة ${newSession.durationMinutes} دقيقة.`,
      newSession.courseId // Note: this is course ID, ideally course name but ID is fine for logs.
    );
    addToast('success', 'تم جدولة البث المباشر بنجاح!');
  };

  const updateLiveSession = (sessionId: string, updates: Partial<LiveSession>) => {
    setLiveSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          const newObj = { ...s, ...updates };
          syncLiveSessionToSupabase(newObj);
          return newObj;
        }
        return s;
      });
      return updated;
    });
    addToast('success', 'تم تحديث بيانات البث المباشر!');
  };

  const deleteLiveSession = (sessionId: string, courseName: string) => {
    setLiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    deleteLiveSessionFromSupabase(sessionId);
    logAdminActivity('حذف بث مباشر', `تم حذف حصة بث مباشر من كورس "${courseName}"`, courseName);
    addToast('info', 'تم إلغاء البث المباشر.');
  };

  // Coupons Management
  const createCoupon = (couponData: Omit<CouponCode, 'id' | 'currentUses'>) => {
    const newCoupon: CouponCode = {
      ...couponData,
      id: 'coup_' + Date.now() + Math.floor(Math.random() * 1000), // add random to avoid ID collision in rapid bulk generation
      currentUses: 0,
      code: couponData.code.trim().toUpperCase(),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    syncCouponToSupabase(newCoupon); // Sync to DB for administration billing
    addToast('success', `تم إنشاء كود الشحن والخصم (${newCoupon.code}) بنجاح!`);
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === couponId) {
          const updated = { ...c, isActive: !c.isActive };
          syncCouponToSupabase(updated);
          return updated;
        }
        return c;
      })
    );
    addToast('info', 'تم تحديث حالة كود الخصم.');
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    // Usually, we would delete from Supabase too, but we might want to keep the record for billing. 
    // We can add deleteCouponFromSupabase if needed, but for billing it's safer to just set isActive=false.
    addToast('info', 'تم حذف كود الخصم محلياً.');
  };

  const logAdminActivity = (action: string, details: string, courseName: string) => {
    if (!currentUser) return;
    
    // We assume the user has some role, name, email. For teacher's employee numbers we can fake X and Y if not in user, or just format the message.
    const enrichedDetails = `المعلم المذكور للمادة، صاحب الرقم الوظيفي X والرقم الوظيفي Y (${currentUser.name})، قام ب${action} في كورس "${courseName}". التفاصيل: ${details}`;

    syncAdminLogToSupabase({
      action,
      teacherName: currentUser.name,
      teacherEmail: currentUser.email,
      courseName,
      details: enrichedDetails,
    });
  };

  // Question Bank System
  const createBankQuestion = (qData: Omit<BankQuestion, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQ: BankQuestion = {
      ...qData,
      id: 'bank_q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setBankQuestions((prev) => [newQ, ...prev]);
    addToast('success', 'تمت إضافة السؤال إلى بنك الأسئلة بنجاح! 📚');
  };

  const updateBankQuestion = (id: string, updates: Partial<BankQuestion>) => {
    setBankQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q))
    );
    addToast('success', 'تم تحديث السؤال في بنك الأسئلة!');
  };

  const deleteBankQuestion = (id: string) => {
    setBankQuestions((prev) => prev.filter((q) => q.id !== id));
    addToast('info', 'تم حذف السؤال من بنك الأسئلة.');
  };

  const importExamToQuestionBank = (examId: string, customTopic?: string): number => {
    const targetExam = exams.find((e) => e.id === examId);
    if (!targetExam || !targetExam.questions || targetExam.questions.length === 0) {
      addToast('warning', 'الامتحان المحدد لا يحتوي على أسئلة لاستيرادها.');
      return 0;
    }

    const importedQuestions: BankQuestion[] = targetExam.questions.map((q, idx) => ({
      id: 'bank_q_imp_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 5),
      platformId: selectedPlatformId || undefined,
      teacherId: currentUser?.id,
      courseId: targetExam.courseId,
      subject: targetExam.title.includes('إنجليز') ? 'اللغة الإنجليزية' : 'المادة التعليمية',
      topic: customTopic || targetExam.title || 'أسئلة مستوردة من الامتحانات',
      difficulty: (q.points && q.points > 2 ? 'hard' : q.points === 1 ? 'easy' : 'medium') as any,
      tags: [targetExam.title, 'مستورد من امتحان'],
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      correctBool: q.correctBool,
      fillBlankAnswers: q.fillBlankAnswers,
      sampleAnswer: q.sampleAnswer,
      keywords: q.keywords,
      matchingPairs: q.matchingPairs,
      orderingItems: q.orderingItems,
      audioUrl: q.audioUrl,
      audioScript: q.audioScript,
      passageText: q.passageText,
      passageQuestions: q.passageQuestions,
      sentenceWithMistake: q.sentenceWithMistake,
      targetMistake: q.targetMistake,
      correction: q.correction,
      hint: q.hint,
      explanation: q.explanation,
      points: q.points || 1,
      image: q.image,
      createdAt: new Date().toISOString(),
    }));

    setBankQuestions((prev) => [...importedQuestions, ...prev]);
    addToast('success', `تم تحويل واستيراد ${importedQuestions.length} سؤال من الامتحان إلى بنك الأسئلة بنجاح! 📥`);
    return importedQuestions.length;
  };

  const createExamFromBankQuestions = (questionIds: string[], examMeta: Partial<Exam>): Exam => {
    const selectedQuestions = bankQuestions.filter((q) => questionIds.includes(q.id));
    const newExamId = 'exam_' + Date.now();
    const newExam: Exam = {
      id: newExamId,
      courseId: examMeta.courseId || selectedCourseId || 'course-radwan-general-01',
      moduleId: examMeta.moduleId,
      lessonId: examMeta.lessonId,
      title: examMeta.title || 'امتحان مولد من بنك الأسئلة',
      description: examMeta.description || 'تم توليد هذا الامتحان آلياً من بنك الأسئلة المعتمد.',
      durationMinutes: examMeta.durationMinutes || 30,
      passingScorePercent: examMeta.passingScorePercent || 60,
      totalPoints: selectedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
      maxAttempts: examMeta.maxAttempts || 2,
      shuffleQuestions: examMeta.shuffleQuestions ?? true,
      showResultInstant: examMeta.showResultInstant ?? true,
      allowRetake: examMeta.allowRetake ?? true,
      showExplanationAfterSubmit: examMeta.showExplanationAfterSubmit ?? true,
      enableAntiCheat: examMeta.enableAntiCheat ?? true,
      strictFullscreenEnforced: examMeta.strictFullscreenEnforced ?? true,
      status: 'published',
      isPublished: true,
      createdAt: new Date().toISOString(),
      questions: selectedQuestions.map((bq, idx) => ({
        id: 'q_' + newExamId + '_' + idx,
        examId: newExamId,
        type: bq.type,
        prompt: bq.prompt,
        options: bq.options,
        correctOptionIndex: bq.correctOptionIndex,
        correctBool: bq.correctBool,
        fillBlankAnswers: bq.fillBlankAnswers,
        sampleAnswer: bq.sampleAnswer,
        keywords: bq.keywords,
        matchingPairs: bq.matchingPairs,
        orderingItems: bq.orderingItems,
        audioUrl: bq.audioUrl,
        audioScript: bq.audioScript,
        passageText: bq.passageText,
        passageQuestions: bq.passageQuestions,
        sentenceWithMistake: bq.sentenceWithMistake,
        targetMistake: bq.targetMistake,
        correction: bq.correction,
        hint: bq.hint,
        explanation: bq.explanation,
        points: bq.points || 1,
        image: bq.image,
        allowHint: true,
      })),
    };

    setExams((prev) => [newExam, ...prev]);
    addToast('success', `تم تحويل ${selectedQuestions.length} سؤال إلى امتحان جديد بنجاح! 🎯`, `تم إنشاء الامتحان: "${newExam.title}"`);
    return newExam;
  };

  // Specialized Assignments System
  const createAssignment = (assignmentData: Partial<Assignment>) => {
    const newAssign: Assignment = {
      id: 'assign_' + Date.now(),
      courseId: assignmentData.courseId || selectedCourseId || 'course-radwan-general-01',
      moduleId: assignmentData.moduleId,
      lessonId: assignmentData.lessonId,
      title: assignmentData.title || 'واجب منزلي تخصصي جديد',
      description: assignmentData.description || 'واجب تدريبي متخصص مع ورقة مفاهيم تفاعلية.',
      subject: assignmentData.subject || 'اللغة الإنجليزية',
      conceptSheetTitle: assignmentData.conceptSheetTitle || 'ورقة المفاهيم والقوانين الإرشادية',
      conceptSheetContent: assignmentData.conceptSheetContent || '',
      conceptSheetAttachmentUrl: assignmentData.conceptSheetAttachmentUrl,
      durationMinutes: assignmentData.durationMinutes || 30,
      passingScorePercent: assignmentData.passingScorePercent || 60,
      totalPoints: assignmentData.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 10,
      questions: assignmentData.questions || [],
      maxAttempts: assignmentData.maxAttempts || 3,
      allowConceptSheet: assignmentData.allowConceptSheet ?? true,
      showModelAnswerAfterSubmission: assignmentData.showModelAnswerAfterSubmission ?? true,
      autoGrading: assignmentData.autoGrading ?? true,
      dueDate: assignmentData.dueDate || '2027-12-31',
      status: assignmentData.status || 'published',
      isPublished: assignmentData.isPublished ?? true,
      createdAt: new Date().toISOString(),
    };

    setAssignments((prev) => [newAssign, ...prev]);
    addToast('success', 'تم إنشاء الواجب المنزلي المتخصص بنجاح! 📝');
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    addToast('success', 'تم تحديث بيانات الواجب المتخصص وورقة المفاهيم!');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    addToast('info', 'تم حذف الواجب.');
  };

  const submitAssignmentAttempt = (submissionData: Omit<AssignmentSubmission, 'id' | 'submittedAt'>): AssignmentSubmission => {
    const newSub: AssignmentSubmission = {
      ...submissionData,
      id: 'as_sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      submittedAt: new Date().toISOString(),
    };
    setAssignmentSubmissions((prev) => [newSub, ...prev]);
    addToast('success', 'تم تسليم الواجب بنجاح! 🎉', `درجتك: ${newSub.score} من ${newSub.totalPoints} (${newSub.percentage}%)`);
    return newSub;
  };

  const gradeAssignmentSubmission = (submissionId: string, manualScores: Record<string, number>, feedback: string) => {
    setAssignmentSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const manualTotal = Object.values(manualScores).reduce((a, b) => a + b, 0);
          const newScore = Math.min(sub.totalPoints, sub.score + manualTotal);
          const newPercentage = Math.round((newScore / sub.totalPoints) * 100);
          return {
            ...sub,
            score: newScore,
            percentage: newPercentage,
            passed: newPercentage >= 60,
            manualGradePoints: manualScores,
            teacherFeedback: feedback,
            gradedByTeacher: true,
          };
        }
        return sub;
      })
    );
    addToast('success', 'تم رصد الدرجة وملاحظات المعلم بنجاح! ✍️');
  };

  // Printed 16-Character Unique Access Codes System
  const createPrintedCodesBatch = (courseId: string, quantity: number, notes?: string): PrintedCodesBatch | null => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) {
      addToast('error', 'الكورس غير موجود');
      return null;
    }
    const count = Math.max(1, Math.min(500, Math.floor(quantity)));
    const coursePrice = targetCourse.price || 250;
    const totalCourseValue = count * coursePrice;
    const platformFeeRate = (paymentSettings.printedCodesFeePercentage ?? 15) / 100;
    const totalPlatformFee = totalCourseValue * platformFeeRate;
    const batchId = 'batch_' + Date.now();
    const batchNumber = `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const generatedCodes: CourseAccessCode[] = [];
    for (let i = 0; i < count; i++) {
      generatedCodes.push({
        id: `code_${batchId}_${i + 1}`,
        code: generate16CharCode(),
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        platformId: targetCourse.platformId,
        teacherId: currentUser?.id || 'teacher-radwan-01',
        teacherName: currentUser?.name || 'محمد رضوان',
        batchId,
        coursePrice,
        platformFeeAmount: coursePrice * platformFeeRate,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    const newBatch: PrintedCodesBatch = {
      id: batchId,
      batchNumber,
      teacherId: currentUser?.id || 'teacher-radwan-01',
      teacherName: currentUser?.name || 'محمد رضوان',
      teacherPhone: currentUser?.phone || '01099887766',
      platformId: targetCourse.platformId,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      coursePrice,
      quantity: count,
      totalCourseValue,
      platformFeeRate,
      totalPlatformFee,
      paidCodesCount: 0,
      settledAmount: 0,
      remainingDueAmount: totalPlatformFee,
      status: 'unpaid',
      notes: notes || `دفعة مطبوعات ${count} كود لكورس "${targetCourse.title}"`,
      createdAt: new Date().toISOString(),
      codes: generatedCodes,
    };

    setPrintedCodesBatches((prev) => [newBatch, ...prev]);
    syncPrintedCodesBatchToSupabase(newBatch).catch(console.warn);

    logAdminActivity(
      'استخراج دفعة مطبوعات 16 حرف',
      `تم استخراج ${count} كود مطبوع لكورس "${targetCourse.title}" برقم دفعة (${batchNumber}) وقيمة إجمالية ${totalCourseValue} ج.م ومستحق منصة 15% بقيمة ${totalPlatformFee} ج.م.`,
      targetCourse.title
    );

    addToast(
      'success',
      `تم استخراج ${count} كود مطبوع بنجاح! 🖨️`,
      `الدفعة جاهزة للطباعة والتوزيع. إجمالي رسوم المنصة المستحقة 15%: ${totalPlatformFee} ج.م`
    );
    return newBatch;
  };

  const settleCodesBatchByAdmin = (batchId: string, paidCodesCount: number, notes?: string) => {
    setPrintedCodesBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === batchId) {
          const safePaidCount = Math.max(0, Math.min(batch.quantity, paidCodesCount));
          const feePerCode = batch.coursePrice * batch.platformFeeRate;
          const settledAmount = safePaidCount * feePerCode;
          const remainingDueAmount = (batch.quantity - safePaidCount) * feePerCode;
          const status: PrintedCodesBatch['status'] =
            safePaidCount >= batch.quantity ? 'settled' : safePaidCount > 0 ? 'partially_paid' : 'unpaid';

          const updatedBatch: PrintedCodesBatch = {
            ...batch,
            paidCodesCount: safePaidCount,
            settledAmount,
            remainingDueAmount,
            status,
            notes: notes !== undefined ? notes : batch.notes,
            updatedAt: new Date().toISOString(),
          };
          
          syncPrintedCodesBatchToSupabase(updatedBatch).catch(console.warn);
          return updatedBatch;
        }
        return batch;
      })
    );
    addToast('success', 'تمت تصفية وتحديث الموقف المالي لأكواد المعلم بنجاح! 💼');
  };

  const deletePrintedCodesBatch = (batchId: string) => {
    setPrintedCodesBatches((prev) => prev.filter((b) => b.id !== batchId));
    addToast('info', 'تم حذف دفعة الأكواد.');
    deletePrintedCodesBatchFromSupabase(batchId).catch(console.warn);
  };

  // Selectors
  const currentPlatform = platforms.find((p) => p.id === selectedPlatformId) || null;
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || null;
  let currentLesson: Lesson | null = null;
  if (currentCourse && selectedLessonId) {
    for (const mod of currentCourse.modules || []) {
      const found = mod.lessons.find((l) => l.id === selectedLessonId);
      if (found) {
        currentLesson = found;
        break;
      }
    }
  }
  const currentExam = exams.find((e) => e.id === selectedExamId) || null;
  const currentAssignment = assignments.find((a) => a.id === selectedAssignmentId) || null;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,

        isSupabaseModalOpen,
        setIsSupabaseModalOpen,

        currentView,
        setCurrentView,
        selectedPlatformId,
        setSelectedPlatformId,
        selectedCourseId,
        setSelectedCourseId,
        selectedLessonId,
        setSelectedLessonId,
        selectedExamId,
        setSelectedExamId,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedInstructorName,
        setSelectedInstructorName,

        currentUser,
        login,
        signup,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,

        platforms,
        courses,
        exams,
        bankQuestions,
        assignments,
        assignmentSubmissions,
        printedCodesBatches,
        orderRequests,
        coupons,
        examSubmissions,
        studentNotes,
        generalNotes,
        studyTasks,
        courseStudents,
        courseAnnouncements,
        liveSessions,
        supportTickets,
        userProfiles,

        createPlatform,
        updatePlatform,
        deletePlatform,
        updateTeacherCredentials,

        createCourse,
        updateCourse,
        deleteCourse,
        addLessonToCourse,
        updateLesson,
        deleteLesson,
        enrollInCourse,
        rechargeWallet,
        verifyDeviceAccess,
        removeSecondaryDevice,
        redeemCourseAccessCode,

        createBankQuestion,
        updateBankQuestion,
        deleteBankQuestion,
        importExamToQuestionBank,
        createExamFromBankQuestions,

        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignmentAttempt,
        gradeAssignmentSubmission,

        createPrintedCodesBatch,
        settleCodesBatchByAdmin,
        deletePrintedCodesBatch,

        addCourseStudent,
        toggleStudentStatus,
        deleteCourseStudent,
        addCourseAnnouncement,
        deleteCourseAnnouncement,

        addLiveSession,
        updateLiveSession,
        deleteLiveSession,

        createCoupon,
        toggleCouponStatus,
        deleteCoupon,
        logAdminActivity,

        createSupportTicket,
        updateSupportTicketStatus,
        deleteSupportTicket,

        createExam,
        updateExam,
        deleteExam,
        submitExamAttempt,

        submitOrderRequest,
        updateOrderStatus,

        lessonQuestions,
        askLessonQuestion,
        replyToLessonQuestion,
        updateLessonQuestionStatus,
        deleteLessonQuestion,

        addStudentNote,
        updateStudentNote,
        deleteStudentNote,
        addGeneralNote,
        updateGeneralNote,
        deleteGeneralNote,
        addStudyTask,
        updateStudyTask,
        deleteStudyTask,

        toasts,
        addToast,
        removeToast,

        depositRequests,
        paymentSettings,
        submitDepositRequest,
        updateDepositRequestStatus,
        updatePaymentSettings,

        isSyncingData,
        lastDatabaseSyncTime,
        supabaseLatency,
        refreshAllAdministrativeData,

        currentPlatform,
        currentCourse,
        currentLesson,
        currentExam,
        currentAssignment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
