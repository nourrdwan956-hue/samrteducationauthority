export type UserRole = 'super_admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  platformId?: string; // Platform owned if teacher, or current platform context
  gradeLevel?: string;
  enrolledCourseIds: string[];
  walletBalance?: number;
  createdAt: string;

  // Comprehensive Student Enrollment & Security Data
  fourPartName?: string;
  nationalId?: string;
  guardianPhone?: string;
  guardianJob?: string;
  guardianRelation?: 'father' | 'mother' | 'brother' | 'uncle' | 'guardian';
  motherPhone?: string;
  governorate?: string;
  city?: string;
  schoolName?: string;
  academicSection?: 'science_bio' | 'science_math' | 'literary' | 'general'; // علمي علوم / علمي رياضة / أدبي / عام
  educationSystem?: 'general_arabic' | 'languages_experimental' | 'azhar' | 'international_ig_sat'; // عربي / لغات / أزهر / دولي
  studentCode?: string; // e.g. SEA-2026-98421
  isEmailVerified?: boolean;
  accountStatus?: 'verified' | 'pending_verification' | 'suspended';
  deviceFingerprint?: string;
  primaryDeviceId?: string;
  secondaryDeviceId?: string;
  primaryDevice?: {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    registeredAt: string;
    lastActiveAt: string;
  };
  secondaryDevice?: {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
    registeredAt: string;
    lastActiveAt: string;
  };
  birthDate?: string;
  gender?: 'male' | 'female';
  emergencyNotes?: string;
}

export type PlatformStatus = 'active' | 'suspended' | 'maintenance' | 'draft';

export interface EducationalPlatform {
  id: string;
  name: string;
  slug: string;
  subject: string;
  subjectCategory: 'languages' | 'science' | 'humanities' | 'math' | 'general';
  teacherName: string;
  teacherTitle: string;
  teacherEmail: string;
  teacherPassword?: string;
  teacherPhone: string;
  teacherBio: string;
  teacherAvatar: string;
  bannerImage: string;
  logo: string;
  themeColor: string; // e.g. '#0ea5e9' (sky), '#10b981' (emerald), '#8b5cf6' (purple), '#f59e0b' (amber)
  status: PlatformStatus;
  monthlyRentPrice: number;
  annualRentPrice: number;
  subscriptionExpiresAt: string;
  features: string[];
  totalStudentsCount: number;
  totalCoursesCount: number;
  rating: number;
  whatsappNumber?: string;
  telegramChannel?: string;
  facebookPage?: string;
  teacherExperienceYears?: string;
  teacherCertificates?: string;
  teacherHighlights?: string;
  createdAt: string;
}

export type EducationalStage = 'primary' | 'preparatory' | 'secondary';
export type CurriculumType = 'general' | 'azhar' | 'international';

export interface LiveSession {
  id: string;
  courseId: string;
  moduleId?: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  platform: 'youtube_live' | 'zoom' | 'jitsi';
  meetingUrl: string;
  youtubeVideoId?: string;
  status: 'upcoming' | 'live' | 'completed';
  description?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  platformId: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  subject: string;
  stage?: EducationalStage;
  curriculumType?: CurriculumType;
  term?: 'term1' | 'term2' | 'final_revision' | 'full_year';
  gradeLevel: string; // e.g. "الصف الأول الثانوي (عام)", "الصف الثالث الإعدادي (أزهر)"
  price: number;
  originalPrice?: number;
  isFree: boolean;
  totalDurationMinutes: number;
  modulesCount: number;
  lessonsCount: number;
  enrolledCount: number;
  rating: number;
  status: 'published' | 'draft';
  scheduledPublishDate?: string;
  tags: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  createdAt: string;
  modules?: CourseModule[];
  participatingTeachers?: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    subject: string;
    bio?: string;
  }[];
}

export type LessonType = 'video' | 'pdf' | 'exam' | 'assignment' | 'live_session';

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type?: LessonType;
  durationMinutes?: number;
  order: number;
  isFreePreview?: boolean;
  isFree?: boolean;
  status?: 'published' | 'draft';
  isPublished?: boolean;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledPublishDate?: string;
  videoUrl?: string; // Obfuscated YouTube or secure stream
  videoProvider?: string;
  hasWatermark?: boolean;
  notes?: string;
  youtubeVideoId?: string;
  playerMode?: 'platform' | 'youtube';
  pdfUrl?: string;
  pdfTitle?: string;
  examId?: string;
  description?: string;
  completedByStudent?: boolean;
  liveDate?: string;
  liveMeetingUrl?: string;
  assignmentInstructions?: string;
  instructorName?: string;
  instructorAvatar?: string;
  instructorTitle?: string;
}

export interface CourseStudentEnrollee {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  parentPhone?: string;
  studentCode?: string;
  platformId?: string;
  notes?: string;
  enrolledAt: string;
  courseId: string;
  progressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  status: 'active' | 'suspended';
  lastActive: string;
  paidAmount: number;
  subscriptionMethod: 'online' | 'coupon_center' | 'free_grant';
}

export interface CourseAnnouncement {
  id: string;
  courseId: string;
  title: string;
  message: string;
  isPinned: boolean;
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  status?: 'published' | 'draft' | 'scheduled';
  scheduledPublishDate?: string;
  isFree?: boolean;
  isRequiredCompletion?: boolean;
  lessons: Lesson[];
}

export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'short_answer'
  | 'essay'
  | 'matching'
  | 'ordering'
  | 'listening'
  | 'passage'
  | 'error_correction';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface PassageSubQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points: number;
}

export interface Question {
  id: string;
  examId: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  correctOptionIndex?: number;
  correctBool?: boolean;
  fillBlankAnswers?: string[];
  sampleAnswer?: string;
  keywords?: string[];
  matchingPairs?: MatchingPair[];
  orderingItems?: string[];
  audioUrl?: string;
  audioScript?: string;
  passageText?: string;
  passageQuestions?: PassageSubQuestion[];
  sentenceWithMistake?: string;
  targetMistake?: string;
  correction?: string;
  hint?: string;
  allowHint?: boolean;
  explanation?: string;
  points: number;
  image?: string;
}

export interface Exam {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScorePercent: number;
  totalPoints: number;
  questions: Question[];
  showResultInstant: boolean;
  allowRetake: boolean;
  maxAttempts?: number; // إجمالي عدد المحاولات الكلية المسموح بها (المحاولة الأولى + الإعادات = الإجمالي بالضبط، مثال: 2 يعني محاولتين كليتين)
  allowHints?: boolean;
  showExplanationAfterSubmit?: boolean;
  shuffleQuestions?: boolean;
  enableAntiCheat?: boolean;
  strictFullscreenEnforced?: boolean;
  cancelOnLeave?: boolean;
  maxViolationsAllowed?: number;
  preventCopyPaste?: boolean;
  attemptsCount?: number;
  status?: 'published' | 'draft';
  isPublished?: boolean;
  isScheduled?: boolean;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  startDate?: string;
  endDate?: string;
  scheduledDate?: string;
  deadline?: string;
  createdAt?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
  attemptNumber?: number;
  maxAllowedAttempts?: number;
  isCancelledDueToViolation?: boolean;
  violationReason?: string;
  violationsCount?: number;
  answers: Record<string, any>; // questionId -> answer (number, boolean, string, mapping, etc.)
}

export interface StudentNote {
  id: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  timestampSeconds: number;
  noteText: string;
  color?: 'amber' | 'cyan' | 'rose' | 'emerald' | 'purple' | 'sky' | 'orange';
  createdAt: string;
  updatedAt?: string;
}

export interface LessonQuestionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'teacher' | 'student' | 'super_admin';
  authorAvatar?: string;
  message: string;
  createdAt: string;
}

export interface LessonQuestion {
  id: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  teacherId?: string;
  teacherName?: string;
  studentId: string;
  studentName: string;
  studentCode?: string;
  studentAvatar?: string;
  questionText: string;
  timestampSeconds?: number;
  status: 'pending' | 'answered' | 'closed';
  replies: LessonQuestionReply[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneralNote {
  id: string;
  studentId: string;
  title: string;
  content: string;
  color?: string; // Optional color for the note card (e.g. 'bg-rose-500/10')
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  dueTime?: string; // HH:mm
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  courseId?: string; // Optional: link to a specific course
  createdAt: string;
}

export interface PlatformOrderRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  subject: string;
  desiredPlatformName: string;
  planType: 'monthly' | 'annual' | 'custom_purchase';
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CouponCode {
  id: string;
  platformId: string;
  courseId?: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  platformId?: string;
  platformName?: string;
  teacherName?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  category: 'server_upgrade' | 'financial_withdrawal' | 'student_issue' | 'feature_request' | 'technical_bug' | 'technical' | 'billing' | 'academic' | 'other';
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high';
  attachmentUrl?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'open';
  adminResponse?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  amount: number;
  paymentMethod: 'vodafone' | 'instapay' | 'fawry' | 'manual';
  senderNumber?: string;
  transactionId?: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentSettings {
  vodafoneEnabled: boolean;
  vodafoneNumber: string;
  instapayEnabled: boolean;
  instapayAddress: string;
  fawryEnabled: boolean;
  fawryCode: string;
  manualEnabled: boolean;
  printedCodesFeePercentage?: number;
}

// ----------------------------------------------------
// 1. Question Bank System (بنك الأسئلة المستقل)
// ----------------------------------------------------
export interface BankQuestion {
  id: string;
  platformId?: string;
  teacherId?: string;
  courseId?: string;
  subject: string;
  stage?: EducationalStage;
  gradeLevel?: string;
  topic: string; // e.g. "Grammar - Past Simple", "قوانين نيوتن", "البلاغة"
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndex?: number;
  correctBool?: boolean;
  fillBlankAnswers?: string[];
  sampleAnswer?: string;
  keywords?: string[];
  matchingPairs?: MatchingPair[];
  orderingItems?: string[];
  audioUrl?: string;
  audioScript?: string;
  passageText?: string;
  passageQuestions?: PassageSubQuestion[];
  sentenceWithMistake?: string;
  targetMistake?: string;
  correction?: string;
  hint?: string;
  explanation?: string;
  points: number;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

// ----------------------------------------------------
// 2. Specialized Assignments System (الواجبات المنزلية المتخصصة + ورقة المفاهيم)
// ----------------------------------------------------
export interface Assignment {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  title: string;
  description: string;
  subject?: string;
  conceptSheetTitle?: string; // عنوان ورقة المفاهيم
  conceptSheetContent?: string; // نص ورقة المفاهيم والقوانين التي تظهر للطالب أثناء حل جميع الأسئلة
  conceptSheetAttachmentUrl?: string;
  durationMinutes?: number;
  passingScorePercent: number;
  totalPoints: number;
  questions: Question[];
  maxAttempts?: number;
  allowConceptSheet: boolean;
  showModelAnswerAfterSubmission: boolean;
  autoGrading: boolean;
  dueDate?: string;
  status?: 'published' | 'draft';
  isPublished?: boolean;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  answers: Record<string, any>;
  conceptSheetUsed?: boolean;
  teacherFeedback?: string;
  gradedByTeacher?: boolean;
  manualGradePoints?: Record<string, number>;
}

// ----------------------------------------------------
// 3. 16-Character Unique Course Codes & Admin Clearance
// ----------------------------------------------------
export interface CourseAccessCode {
  id: string;
  code: string; // 16 characters e.g. "A7K9-W3P8-L2Q4-M5Z1"
  courseId: string;
  courseTitle: string;
  platformId: string;
  teacherId: string;
  teacherName: string;
  batchId: string;
  coursePrice: number;
  platformFeeAmount: number; // 15% of course price
  status: 'active' | 'redeemed' | 'cancelled';
  redeemedByStudentId?: string;
  redeemedByStudentName?: string;
  redeemedAt?: string;
  createdAt: string;
}

export interface PrintedCodesBatch {
  id: string;
  batchNumber: string; // e.g. "BATCH-2026-081"
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  platformId: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  quantity: number; // e.g. 15 codes
  totalCourseValue: number; // quantity * coursePrice
  platformFeeRate: number; // 0.15 (15%)
  totalPlatformFee: number; // totalCourseValue * 0.15
  paidCodesCount: number; // e.g. 10 codes paid to admin
  settledAmount: number; // paidCodesCount * (coursePrice * 0.15)
  remainingDueAmount: number; // (quantity - paidCodesCount) * (coursePrice * 0.15)
  status: 'unpaid' | 'partially_paid' | 'settled';
  codes: CourseAccessCode[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

