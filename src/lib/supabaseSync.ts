import { supabase } from './supabaseClient';
import {
  EducationalPlatform,
  Course,
  Exam,
  ExamSubmission,
  PlatformOrderRequest,
  CouponCode,
  StudentNote,
  LiveSession,
  User,
  SupportTicket,
  PrintedCodesBatch,
  Assignment,
  AssignmentSubmission,
  StudyTask,
  CourseStudentEnrollee,
  CourseAnnouncement,
} from '../types';

export interface SupabaseHealthStatus {
  connected: boolean;
  url: string;
  tableStats: {
    platforms: number | null;
    courses: number | null;
    exams: number | null;
    orders: number | null;
    coupons: number | null;
    live_sessions: number | null;
  };
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

// 1. Diagnose and inspect real Supabase connection
export async function getSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  const status: SupabaseHealthStatus = {
    connected: false,
    url: (supabase as unknown as { supabaseUrl?: string }).supabaseUrl || 'https://cceubgakgkorkzylfepz.supabase.co',
    tableStats: {
      platforms: null,
      courses: null,
      exams: null,
      orders: null,
      coupons: null,
      live_sessions: null,
    },
    latencyMs: 0,
    lastChecked: new Date().toLocaleTimeString('ar-EG'),
  };

  try {
    const { data, error, count } = await supabase
      .from('platforms')
      .select('*', { count: 'exact', head: true });

    status.latencyMs = Date.now() - startTime;

    if (!error) {
      status.connected = true;
      status.tableStats.platforms = count ?? 0;

      // check courses
      const coursesRes = await supabase.from('courses').select('*', { count: 'exact', head: true });
      if (!coursesRes.error) status.tableStats.courses = coursesRes.count ?? 0;

      // check exams
      const examsRes = await supabase.from('exams').select('*', { count: 'exact', head: true });
      if (!examsRes.error) status.tableStats.exams = examsRes.count ?? 0;

      // check orders
      const ordersRes = await supabase.from('order_requests').select('*', { count: 'exact', head: true });
      if (!ordersRes.error) status.tableStats.orders = ordersRes.count ?? 0;

      // check coupons
      const couponsRes = await supabase.from('coupons').select('*', { count: 'exact', head: true });
      if (!couponsRes.error) status.tableStats.coupons = couponsRes.count ?? 0;

      // check live_sessions
      const liveSessionsRes = await supabase.from('live_sessions').select('*', { count: 'exact', head: true });
      if (!liveSessionsRes.error) status.tableStats.live_sessions = liveSessionsRes.count ?? 0;
    } else {
      status.error = error.message;
    }
  } catch (err: unknown) {
    status.latencyMs = Date.now() - startTime;
    status.error = err instanceof Error ? err.message : 'فشل الاتصال بقاعدة البيانات';
  }

  return status;
}

// 2. Fetch Platforms from Supabase
export async function fetchSupabasePlatforms(): Promise<EducationalPlatform[] | null> {
  try {
    const { data, error } = await supabase.from('platforms').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      subject: row.subject,
      subjectCategory: row.subject_category || 'general',
      teacherName: row.teacher_name,
      teacherTitle: row.teacher_title,
      teacherEmail: row.teacher_email,
      teacherPassword: row.teacher_password || '123456',
      teacherPhone: row.teacher_phone || '',
      teacherBio: row.teacher_bio || '',
      teacherAvatar: row.teacher_avatar || '',
      bannerImage: row.banner_image || '',
      logo: row.logo || '',
      themeColor: row.theme_color || '#0ea5e9',
      status: row.status || 'active',
      monthlyRentPrice: Number(row.monthly_rent_price || 850),
      annualRentPrice: Number(row.annual_rent_price || 8500),
      subscriptionExpiresAt: row.subscription_expires_at || new Date().toISOString(),
      features: Array.isArray(row.features) ? row.features : [],
      totalStudentsCount: Number(row.total_students_count || 0),
      totalCoursesCount: Number(row.total_courses_count || 0),
      rating: Number(row.rating || 5.0),
      whatsappNumber: row.whatsapp_number,
      telegramChannel: row.telegram_channel,
      facebookPage: row.facebook_page,
      createdAt: row.created_at || new Date().toISOString().split('T')[0],
    }));
  } catch {
    return null;
  }
}

// 3. Upsert Platform to Supabase
export async function syncPlatformToSupabase(platform: EducationalPlatform): Promise<boolean> {
  try {
    const row = {
      id: platform.id,
      name: platform.name,
      slug: platform.slug,
      subject: platform.subject,
      subject_category: platform.subjectCategory,
      teacher_name: platform.teacherName,
      teacher_title: platform.teacherTitle,
      teacher_email: platform.teacherEmail,
      teacher_password: platform.teacherPassword,
      teacher_phone: platform.teacherPhone,
      teacher_bio: platform.teacherBio,
      teacher_avatar: platform.teacherAvatar,
      banner_image: platform.bannerImage,
      logo: platform.logo,
      theme_color: platform.themeColor,
      status: platform.status,
      monthly_rent_price: platform.monthlyRentPrice,
      annual_rent_price: platform.annualRentPrice,
      subscription_expires_at: platform.subscriptionExpiresAt,
      features: platform.features,
      total_students_count: platform.totalStudentsCount,
      total_courses_count: platform.totalCoursesCount,
      rating: platform.rating,
      whatsapp_number: platform.whatsappNumber,
      telegram_channel: platform.telegramChannel,
      facebook_page: platform.facebookPage,
    };

    const { error } = await supabase.from('platforms').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 4. Delete Platform from Supabase
export async function deletePlatformFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('platforms').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 5. Fetch Courses from Supabase
export async function fetchSupabaseCourses(): Promise<Course[] | null> {
  try {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      platformId: row.platform_id,
      title: row.title,
      subtitle: row.subtitle || '',
      description: row.description || '',
      thumbnail: row.thumbnail || '',
      subject: row.subject,
      gradeLevel: row.grade_level,
      price: Number(row.price || 0),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      isFree: Boolean(row.is_free),
      totalDurationMinutes: Number(row.total_duration_minutes || 0),
      modulesCount: Number(row.modules_count || 1),
      lessonsCount: Number(row.lessons_count || 0),
      enrolledCount: Number(row.enrolled_count || 0),
      rating: Number(row.rating || 5.0),
      status: row.status || 'published',
      tags: Array.isArray(row.tags) ? row.tags : [],
      modules: Array.isArray(row.modules_data) ? row.modules_data : [],
      createdAt: row.created_at || new Date().toISOString().split('T')[0],
    }));
  } catch {
    return null;
  }
}

// 6. Upsert Course to Supabase
export async function syncCourseToSupabase(course: Course): Promise<boolean> {
  try {
    const row = {
      id: course.id,
      platform_id: course.platformId,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      thumbnail: course.thumbnail,
      subject: course.subject,
      grade_level: course.gradeLevel,
      price: course.price,
      original_price: course.originalPrice,
      is_free: course.isFree,
      total_duration_minutes: course.totalDurationMinutes,
      modules_count: course.modulesCount,
      lessons_count: course.lessonsCount,
      enrolled_count: course.enrolledCount,
      rating: course.rating,
      status: course.status,
      tags: course.tags,
      modules_data: course.modules,
    };

    const { error } = await supabase.from('courses').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 7. Delete Course from Supabase
export async function deleteCourseFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 8. Sync Order Request to Supabase
export async function syncOrderToSupabase(order: PlatformOrderRequest): Promise<boolean> {
  try {
    const row = {
      id: order.id,
      applicant_name: order.applicantName,
      applicant_email: order.applicantEmail,
      applicant_phone: order.applicantPhone,
      subject: order.subject,
      desired_platform_name: order.desiredPlatformName,
      plan_type: order.planType,
      notes: order.notes,
      status: order.status,
    };
    const { error } = await supabase.from('order_requests').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 9. Sync Exam Submission to Supabase
export async function syncSubmissionToSupabase(submission: ExamSubmission): Promise<boolean> {
  try {
    const row = {
      id: submission.id,
      exam_id: submission.examId,
      exam_title: submission.examTitle,
      student_id: submission.studentId,
      student_name: submission.studentName,
      student_phone: submission.studentPhone,
      score: submission.score,
      total_points: submission.totalPoints,
      percentage: submission.percentage,
      passed: submission.passed,
      time_spent_seconds: submission.timeSpentSeconds,
      answers: submission.answers,
    };
    const { error } = await supabase.from('exam_submissions').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 10. Sync Student Note to Supabase
export async function syncNoteToSupabase(note: StudentNote): Promise<boolean> {
  try {
    const row = {
      id: note.id,
      student_id: note.studentId,
      lesson_id: note.lessonId,
      course_id: note.courseId,
      timestamp_seconds: note.timestampSeconds,
      note_text: note.noteText,
    };
    const { error } = await supabase.from('student_notes').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 11. Sync Coupon to Supabase
export async function syncCouponToSupabase(coupon: CouponCode): Promise<boolean> {
  try {
    const row = {
      id: coupon.id,
      platform_id: coupon.platformId || 'global',
      course_id: coupon.courseId,
      code: coupon.code,
      discount_percentage: coupon.discountPercentage,
      max_uses: coupon.maxUses,
      current_uses: coupon.currentUses,
      expires_at: coupon.expiresAt,
      is_active: coupon.isActive,
    };
    const { error } = await supabase.from('coupons').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 13. Sync Admin Log to Supabase
export async function syncAdminLogToSupabase(logData: {
  action: string;
  teacherName: string;
  teacherEmail: string;
  courseName: string;
  details: string;
}): Promise<boolean> {
  try {
    const row = {
      id: 'log_' + Date.now() + Math.floor(Math.random() * 1000),
      action: logData.action,
      teacher_name: logData.teacherName,
      teacher_email: logData.teacherEmail,
      course_name: logData.courseName,
      details: logData.details,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('admin_logs').insert(row);
    return !error;
  } catch {
    return false;
  }
}

// 12. Fetch Coupons from Supabase
export async function fetchSupabaseCoupons(): Promise<CouponCode[] | null> {
  try {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      platformId: row.platform_id,
      courseId: row.course_id,
      code: row.code,
      discountPercentage: Number(row.discount_percentage || 100),
      maxUses: Number(row.max_uses || 1),
      currentUses: Number(row.current_uses || 0),
      expiresAt: row.expires_at,
      isActive: Boolean(row.is_active),
    }));
  } catch {
    return null;
  }
}

// 14. Sync Live Session to Supabase
export async function syncLiveSessionToSupabase(session: LiveSession): Promise<boolean> {
  try {
    const row = {
      id: session.id,
      course_id: session.courseId,
      module_id: session.moduleId,
      title: session.title,
      date: session.date,
      time: session.time,
      duration_minutes: session.durationMinutes,
      platform: session.platform,
      meeting_url: session.meetingUrl,
      youtube_video_id: session.youtubeVideoId,
      status: session.status,
      description: session.description,
      created_at: session.createdAt,
    };
    const { error } = await supabase.from('live_sessions').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 15. Delete Live Session from Supabase
export async function deleteLiveSessionFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('live_sessions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 16. Fetch Live Sessions from Supabase
export async function fetchSupabaseLiveSessions(): Promise<LiveSession[] | null> {
  try {
    const { data, error } = await supabase.from('live_sessions').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      courseId: row.course_id,
      moduleId: row.module_id,
      title: row.title,
      date: row.date,
      time: row.time,
      durationMinutes: Number(row.duration_minutes || 60),
      platform: row.platform,
      meetingUrl: row.meeting_url,
      youtubeVideoId: row.youtube_video_id,
      status: row.status,
      description: row.description,
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// 17. Sync Support Ticket to Supabase
export async function syncSupportTicketToSupabase(ticket: SupportTicket): Promise<boolean> {
  try {
    const row = {
      id: ticket.id,
      platform_id: ticket.platformId,
      platform_name: ticket.platformName,
      teacher_name: ticket.teacherName,
      category: ticket.category,
      title: ticket.title,
      message: ticket.message,
      severity: ticket.severity,
      attachment_url: ticket.attachmentUrl,
      status: ticket.status,
      admin_response: ticket.adminResponse,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    };
    const { error } = await supabase.from('support_tickets').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 18. Delete Support Ticket from Supabase
export async function deleteSupportTicketFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('support_tickets').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 19. Fetch Support Tickets from Supabase
export async function fetchSupabaseSupportTickets(): Promise<SupportTicket[] | null> {
  try {
    const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row) => ({
      id: row.id,
      platformId: row.platform_id,
      platformName: row.platform_name,
      teacherName: row.teacher_name,
      category: row.category,
      title: row.title,
      message: row.message,
      severity: row.severity,
      attachmentUrl: row.attachment_url,
      status: row.status,
      adminResponse: row.admin_response,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return null;
  }
}

// 20. Sync User Profile to Supabase
export async function syncUserProfileToSupabase(user: User): Promise<boolean> {
  try {
    const row: Record<string, any> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || '',
      platform_id: user.platformId || '',
      grade_level: user.gradeLevel || '',
      enrolled_course_ids: user.enrolledCourseIds || [],
      wallet_balance: user.walletBalance || 0,
      created_at: user.createdAt || new Date().toISOString(),
      four_part_name: user.fourPartName || user.name,
      national_id: user.nationalId || '',
      guardian_phone: user.guardianPhone || '',
      guardian_job: user.guardianJob || '',
      guardian_relation: user.guardianRelation || 'father',
      mother_phone: user.motherPhone || '',
      governorate: user.governorate || '',
      city: user.city || '',
      school_name: user.schoolName || '',
      academic_section: user.academicSection || 'general',
      education_system: user.educationSystem || 'general_arabic',
      student_code: user.studentCode || '',
      is_email_verified: user.isEmailVerified ?? true,
      account_status: user.accountStatus || 'verified',
      device_fingerprint: user.deviceFingerprint || '',
      birth_date: user.birthDate || '',
      gender: user.gender || 'male',
      emergency_notes: user.emergencyNotes || '',
    };
    const { error } = await supabase.from('users_profile').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 21. Fetch User Profiles from Supabase
export async function fetchSupabaseUserProfiles(): Promise<User[] | null> {
  try {
    const { data, error } = await supabase.from('users_profile').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as any,
      phone: row.phone,
      avatar: row.avatar,
      platformId: row.platform_id,
      gradeLevel: row.grade_level,
      enrolledCourseIds: Array.isArray(row.enrolled_course_ids) ? row.enrolled_course_ids : [],
      walletBalance: Number(row.wallet_balance || 0),
      createdAt: row.created_at,
      fourPartName: row.four_part_name || row.name,
      nationalId: row.national_id,
      guardianPhone: row.guardian_phone,
      guardianJob: row.guardian_job,
      guardianRelation: row.guardian_relation,
      motherPhone: row.mother_phone,
      governorate: row.governorate,
      city: row.city,
      schoolName: row.school_name,
      academicSection: row.academic_section,
      educationSystem: row.education_system,
      studentCode: row.student_code,
      isEmailVerified: row.is_email_verified,
      accountStatus: row.account_status,
      deviceFingerprint: row.device_fingerprint,
      birthDate: row.birth_date,
      gender: row.gender,
      emergencyNotes: row.emergency_notes,
    }));
  } catch {
    return null;
  }
}

// 21.1 Delete User Profile from Supabase
export async function deleteUserProfileFromSupabase(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('users_profile').delete().eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}




// 22. Sync Printed Codes Batch to Supabase
export async function syncPrintedCodesBatchToSupabase(batch: PrintedCodesBatch): Promise<boolean> {
  try {
    const row = {
      id: batch.id,
      platform_id: batch.platformId,
      teacher_id: batch.teacherId,
      teacher_name: batch.teacherName,
      teacher_phone: batch.teacherPhone,
      course_id: batch.courseId,
      course_title: batch.courseTitle,
      batch_number: batch.batchNumber,
      quantity: batch.quantity,
      course_price: batch.coursePrice,
      total_course_value: batch.totalCourseValue,
      platform_fee_rate: batch.platformFeeRate,
      total_platform_fee: batch.totalPlatformFee,
      paid_codes_count: batch.paidCodesCount,
      settled_amount: batch.settledAmount,
      remaining_due_amount: batch.remainingDueAmount,
      status: batch.status,
      codes: batch.codes,
      notes: batch.notes,
      created_at: batch.createdAt,
      updated_at: batch.updatedAt,
    };
    const { error } = await supabase.from('printed_codes_batches').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 23. Fetch Printed Codes Batches from Supabase
export async function fetchSupabasePrintedCodesBatches(): Promise<PrintedCodesBatch[] | null> {
  try {
    const { data, error } = await supabase.from('printed_codes_batches').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      platformId: row.platform_id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      teacherPhone: row.teacher_phone,
      courseId: row.course_id,
      courseTitle: row.course_title,
      batchNumber: row.batch_number,
      quantity: row.quantity,
      coursePrice: row.course_price,
      totalCourseValue: row.total_course_value,
      platformFeeRate: row.platform_fee_rate,
      totalPlatformFee: row.total_platform_fee,
      paidCodesCount: row.paid_codes_count,
      settledAmount: row.settled_amount,
      remainingDueAmount: row.remaining_due_amount,
      status: row.status,
      codes: row.codes || [],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return null;
  }
}

// 24. Delete Printed Codes Batch from Supabase
export async function deletePrintedCodesBatchFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('printed_codes_batches').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 25. Sync Exam to Supabase
export async function syncExamToSupabase(exam: Exam): Promise<boolean> {
  try {
    const row = {
      id: exam.id,
      course_id: exam.courseId,
      module_id: exam.moduleId,
      lesson_id: exam.lessonId,
      title: exam.title,
      description: exam.description,
      duration_minutes: exam.durationMinutes,
      passing_score_percent: exam.passingScorePercent,
      total_points: exam.totalPoints,
      questions_data: exam.questions,
      max_attempts: exam.maxAttempts,
      allow_hints: exam.allowHints,
      show_explanation: exam.showExplanationAfterSubmit,
      shuffle_questions: exam.shuffleQuestions,
      enable_anti_cheat: exam.enableAntiCheat,
      strict_fullscreen: exam.strictFullscreenEnforced,
      status: exam.status || 'published',
      is_published: exam.isPublished ?? true,
      attempts_count: exam.attemptsCount || 0,
      created_at: exam.createdAt || new Date().toISOString(),
    };
    const { error } = await supabase.from('exams').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 26. Fetch Exams from Supabase
export async function fetchSupabaseExams(): Promise<Exam[] | null> {
  try {
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      courseId: row.course_id,
      moduleId: row.module_id,
      lessonId: row.lesson_id,
      title: row.title,
      description: row.description,
      durationMinutes: Number(row.duration_minutes || 20),
      passingScorePercent: Number(row.passing_score_percent || 60),
      totalPoints: Number(row.total_points || 10),
      questions: Array.isArray(row.questions_data) ? row.questions_data : [],
      showResultInstant: Boolean(row.show_result_instant ?? true),
      allowRetake: Boolean(row.allow_retake ?? true),
      maxAttempts: Number(row.max_attempts || 3),
      allowHints: Boolean(row.allow_hints ?? true),
      showExplanationAfterSubmit: Boolean(row.show_explanation ?? true),
      shuffleQuestions: Boolean(row.shuffle_questions ?? false),
      enableAntiCheat: Boolean(row.enable_anti_cheat ?? true),
      strictFullscreenEnforced: Boolean(row.strict_fullscreen ?? true),
      status: row.status || 'published',
      isPublished: Boolean(row.is_published ?? true),
      attemptsCount: Number(row.attempts_count || 0),
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// 27. Delete Exam from Supabase
export async function deleteExamFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 28. Sync Assignment to Supabase
export async function syncAssignmentToSupabase(assignment: Assignment): Promise<boolean> {
  try {
    const row = {
      id: assignment.id,
      course_id: assignment.courseId,
      module_id: assignment.moduleId,
      lesson_id: assignment.lessonId,
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      concept_sheet_title: assignment.conceptSheetTitle,
      concept_sheet_content: assignment.conceptSheetContent,
      concept_sheet_attachment_url: assignment.conceptSheetAttachmentUrl,
      duration_minutes: assignment.durationMinutes,
      passing_score_percent: assignment.passingScorePercent,
      total_points: assignment.totalPoints,
      questions_data: assignment.questions,
      max_attempts: assignment.maxAttempts,
      allow_concept_sheet: assignment.allowConceptSheet,
      show_model_answer: assignment.showModelAnswerAfterSubmission,
      auto_grading: assignment.autoGrading,
      due_date: assignment.dueDate,
      status: assignment.status,
      is_published: assignment.isPublished,
      created_at: assignment.createdAt,
    };
    const { error } = await supabase.from('assignments').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 29. Fetch Assignments from Supabase
export async function fetchSupabaseAssignments(): Promise<Assignment[] | null> {
  try {
    const { data, error } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      courseId: row.course_id,
      moduleId: row.module_id,
      lessonId: row.lesson_id,
      title: row.title,
      description: row.description,
      subject: row.subject,
      conceptSheetTitle: row.concept_sheet_title,
      conceptSheetContent: row.concept_sheet_content,
      conceptSheetAttachmentUrl: row.concept_sheet_attachment_url,
      durationMinutes: Number(row.duration_minutes || 30),
      passingScorePercent: Number(row.passing_score_percent || 60),
      totalPoints: Number(row.total_points || 10),
      questions: Array.isArray(row.questions_data) ? row.questions_data : [],
      maxAttempts: Number(row.max_attempts || 3),
      allowConceptSheet: Boolean(row.allow_concept_sheet ?? true),
      showModelAnswerAfterSubmission: Boolean(row.show_model_answer ?? true),
      autoGrading: Boolean(row.auto_grading ?? true),
      dueDate: row.due_date,
      status: row.status || 'published',
      isPublished: Boolean(row.is_published ?? true),
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// 30. Delete Assignment from Supabase
export async function deleteAssignmentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// 31. Sync Study Task to Supabase
export async function syncStudyTaskToSupabase(task: StudyTask): Promise<boolean> {
  try {
    const row = {
      id: task.id,
      student_id: task.studentId,
      course_id: task.courseId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      due_time: task.dueTime,
      status: task.status,
      priority: task.priority,
      created_at: task.createdAt,
    };
    const { error } = await supabase.from('study_tasks').upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// 32. Fetch Study Tasks from Supabase
export async function fetchSupabaseStudyTasks(): Promise<StudyTask[] | null> {
  try {
    const { data, error } = await supabase.from('study_tasks').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      dueTime: row.due_time,
      status: row.status || 'pending',
      priority: row.priority || 'medium',
      createdAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

// 33. Delete Study Task from Supabase
export async function deleteStudyTaskFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('study_tasks').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
