import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
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
  Camera,
  Loader2,
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
  Layers,
  Upload,
  RotateCcw,
  Smartphone,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import {
  HumanScenario,
  HUMAN_SCENARIOS,
  generateSecureStudentCode,
} from "../data/humanScenarios";

export const StudentSignUpPage: React.FC = () => {
  const { signup, setCurrentView, addToast, userProfiles } = useApp();

  // Registration Steps:
  // 1: Form Filling ('form')
  // 2: Intelligent Human Verification ('human_verification')
  // 3: Live Student Photo Capture ('live_photo')
  // 4: Pending Admin Review ('pending_review')
  // 5: Registration Complete ('complete')
  const [step, setStep] = useState<
    | "form"
    | "human_verification"
    | "live_photo"
    | "pending_review"
    | "complete"
  >("form");

  // STEP 1 FIELDS:
  // Personal & Educational Profile
  const [fourPartName, setFourPartName] = useState("");

  // Cascaded Educational Level:
  // Stage: primary (ابتدائي), prep (إعدادي), secondary (ثانوي)
  const [stage, setStage] = useState<"primary" | "prep" | "secondary">(
    "secondary",
  );
  const [gradeLevel, setGradeLevel] = useState("الصف الثالث الثانوي");
  const [educationType, setEducationType] = useState("عام"); // عام, أزهري, بكالوريا/دولي
  const [academicSection, setAcademicSection] = useState<
    "science_bio" | "science_math" | "literary" | "general"
  >("science_bio");

  // Geographic Location
  const [governorate, setGovernorate] = useState("القاهرة");
  const [city, setCity] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Verified Egyptian Contact Numbers
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [guardianRelation, setGuardianRelation] = useState<
    "father" | "mother" | "guardian"
  >("father");

  // Email & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2 FIELDS: Human Verification (Scenarios 35 to 55 continuous loop with 2-mistake auto-switch)
  const [completedScenarioIds, setCompletedScenarioIds] = useState<number[]>([]);
  const [scenarioMistakeCount, setScenarioMistakeCount] = useState(0);

  const [selectedScenario, setSelectedScenario] = useState<HumanScenario>(
    HUMAN_SCENARIOS[0],
  );
  const [isEnglishView, setIsEnglishView] = useState(false);
  const [selectedHumanOption, setSelectedHumanOption] = useState<number | null>(
    null,
  );
  const [humanVerifiedSuccess, setHumanVerifiedSuccess] = useState(false);

  // STEP 3 FIELDS: Universal Camera Capture & Verification
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Universal Camera Starter (iOS Safari, Android Chrome, Mac/PC, WebViews)
  const startCamera = async () => {
    try {
      setCameraError("");
      setIsCameraLoading(true);
      stopCamera();

      let stream: MediaStream | null = null;

      // 1. Try optimal front camera with modern constraint
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
            },
            audio: false,
          });
        }
      } catch (frontErr) {
        console.warn("Front-facing camera constraint fallback:", frontErr);
      }

      // 2. Fallback to basic video constraint
      if (!stream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (basicErr) {
          console.warn("Basic video getUserMedia fallback:", basicErr);
        }
      }

      // 3. Fallback to legacy browser implementations
      if (!stream) {
        const legacyNav = navigator as any;
        const legacyGetUserMedia =
          legacyNav.getUserMedia ||
          legacyNav.webkitGetUserMedia ||
          legacyNav.mozGetUserMedia ||
          legacyNav.msGetUserMedia;

        if (legacyGetUserMedia) {
          stream = await new Promise<MediaStream>((resolve, reject) => {
            legacyGetUserMedia.call(
              navigator,
              { video: true, audio: false },
              resolve,
              reject,
            );
          });
        }
      }

      if (stream) {
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.setAttribute("webkit-playsinline", "true");
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.log("Video auto play initiated:", playErr);
          }
        }
      } else {
        throw new Error(
          "لم نتمكن من تشغيل الكاميرا المباشرة تلقائياً. يمكنك الضغط على زر 'التقاط عبر كاميرا الهاتف' بالأسفل للتشغيل الفوري.",
        );
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "تعذر الوصول المباشر لكاميرا المتصفح. يمكنك إما السماح للمتصفح بالوصول للكاميرا أو استخدام زر كاميرا الجهاز أدناه لالتقاط صورة فورية.",
      );
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn(e);
        }
      });
      setCameraStream(null);
    }
  };

  // Instant Snapshot from Live Stream
  const executeSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Save state and mirror horizontally to match selfie view
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        
        // Trigger Shutter Flash Effect
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 250);

        setLivePhoto(dataUrl);
        stopCamera();
      }
    }
  };

  // Countdown timer before snapshot (3, 2, 1, 📸)
  const triggerCountdownCapture = () => {
    if (countdown !== null || !cameraStream) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          executeSnap();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Native Device Camera Picker Fallback (Triggers native Camera App on iOS/Android/PC)
  const handleTriggerNativeCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleNativePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 900;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setLivePhoto(compressedDataUrl);
          stopCamera();
          addToast("success", "تم التقاط الصورة بنجاح! 📸", "يرجى مراجعة صورتك قبل إرسال الطلب.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetakePhoto = () => {
    setLivePhoto(null);
    setCountdown(null);
    startCamera();
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const [issuedStudentCode, setIssuedStudentCode] = useState("");

  // GPS Location State for School Verification
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    capturedAt?: string;
  } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const captureSchoolGps = () => {
    setIsCapturingGps(true);
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("متصفحك لا يدعم خاصية تحديد المواقع الجغرافية (GPS).");
      setIsCapturingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          capturedAt: new Date().toISOString(),
        });
        setIsCapturingGps(false);
        addToast(
          "success",
          "تم التقاط إحداثيات المدرسة بـ GPS بنجاح! 📍",
          `الموقع: ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}° (الدقة: ±${Math.round(pos.coords.accuracy)}م)`
        );
      },
      (err) => {
        console.warn("GPS capture error:", err);
        let msg = "تعذر التقاط موقع الـ GPS.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "يرجى السماح بتحديد الموقع الجغرافي (GPS) في المتصفح لتأكيد موقع المدرسة.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "إشارة الـ GPS غير مجهزة حالياً، حاول مجدداً.";
        } else if (err.code === err.TIMEOUT) {
          msg = "انتهت مهلة الحصول على إحداثيات الـ GPS.";
        }
        setGpsError(msg);
        setIsCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // General Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Governorates and Cities
  const citiesByGovernorate: Record<string, string[]> = {
    القاهرة: [
      "مدينة نصر",
      "مصر الجديدة",
      "المعادي",
      "حلوان",
      "الرحاب",
      "التجمع الخامس",
      "شبرا",
      "وسط البلد",
      "أقرب مدينة/حي غير مدرج",
    ],
    الجيزة: [
      "المهندسين",
      "الدقي",
      "الهرم",
      "فيصل",
      "الشيخ زايد",
      "6 أكتوبر",
      "العجوزة",
      "أقرب مدينة/حي غير مدرج",
    ],
    الإسكندرية: [
      "سموحة",
      "سيدي بشر",
      "ميامي",
      "المندرة",
      "العصافرة",
      "المنتزه",
      "محطة الرمل",
      "برج العرب",
      "أقرب مدينة/حي غير مدرج",
    ],
    الدقهلية: [
      "المنصورة",
      "ميت غمر",
      "السنبلاوين",
      "دكرنس",
      "بلقاس",
      "أقرب مدينة غير مدرجة",
    ],
    الغربية: [
      "طنطا",
      "المحلة الكبرى",
      "زفتى",
      "كفر الزيات",
      "أقرب مدينة غير مدرجة",
    ],
    الشرقية: [
      "الزقازيق",
      "العاشر من رمضان",
      "منيا القمح",
      "بلبيس",
      "أقرب مدينة غير مدرجة",
    ],
    القليوبية: [
      "بنها",
      "شبرا الخيمة",
      "العبور",
      "قليوب",
      "أقرب مدينة غير مدرجة",
    ],
  };

  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "الشرقية",
    "الغربية",
    "القليوبية",
    "البحر الأحمر",
    "البحيرة",
    "الفيوم",
    "الإسماعيلية",
    "المنوفية",
    "المنيا",
    "الوادي الجديد",
    "السويس",
    "دمياط",
    "بني سويف",
    "أسوان",
    "أسيوط",
    "بورسعيد",
    "جنوب سيناء",
    "شمال سيناء",
    "قنا",
    "كفر الشيخ",
    "مطروح",
    "الأقصر",
    "سوهاج",
  ];

  // Derive available cities based on selected governorate, with a fallback
  const availableCities = citiesByGovernorate[governorate] || [
    "المدينة الرئيسية",
    "مركز المحافظة",
    "أقرب مدينة غير مدرجة",
  ];

  useEffect(() => {
    setCity(availableCities[0]);
  }, [governorate]);

  // Dynamic Grade Levels and Education Types based on selected Stage
  const getGradeOptions = () => {
    if (stage === "primary") {
      return [
        "الصف الأول الابتدائي",
        "الصف الثاني الابتدائي",
        "الصف الثالث الابتدائي",
        "الصف الرابع الابتدائي",
        "الصف الخامس الابتدائي",
        "الصف السادس الابتدائي",
      ];
    }
    if (stage === "prep") {
      return [
        "الصف الأول الإعدادي",
        "الصف الثاني الإعدادي",
        "الصف الثالث الإعدادي",
      ];
    }
    return ["الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"];
  };

  // Sync grade level when stage changes
  const handleStageChange = (newStage: "primary" | "prep" | "secondary") => {
    setStage(newStage);
    if (newStage === "primary") {
      setGradeLevel("الصف السادس الابتدائي");
      setEducationType("عام");
    } else if (newStage === "prep") {
      setGradeLevel("الصف الثالث الإعدادي");
      setEducationType("عام");
    } else {
      setGradeLevel("الصف الثالث الثانوي");
      setEducationType("عام");
    }
  };

  // Operator Badge Helper
  const getOperatorInfo = (phoneNum: string) => {
    const clean = phoneNum.trim();
    if (!clean.startsWith("01") || clean.length < 3) return null;
    const prefix = clean.substring(0, 3);
    if (prefix === "010")
      return {
        name: "فودافون مصر 🔴",
        color:
          "text-rose-700 dark:text-rose-400 bg-rose-950/40 border-rose-800/60",
      };
    if (prefix === "011")
      return {
        name: "اتصالات مصر 🟢",
        color:
          "text-emerald-700 dark:text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
      };
    if (prefix === "012")
      return {
        name: "أورنج مصر 🟠",
        color:
          "text-amber-700 dark:text-amber-400 bg-amber-950/40 border-amber-800/60",
      };
    if (prefix === "015")
      return {
        name: "المصرية للاتصالات (WE) 🟣",
        color: "text-purple-400 bg-purple-950/40 border-purple-800/60",
      };
    return null;
  };

  // ════════════════════════════════════════════════════════════════
  // SMART HUMAN & IDENTITY VALIDATION HELPERS (STRICT & PRECISE)
  // ════════════════════════════════════════════════════════════════

  // Smart compound Arabic name parser (e.g. "عبد العزيز" or "نور الدين" or "أبو بكر" are 1 single component)
  const parseArabicNameParts = (raw: string): string[] => {
    if (!raw) return [];
    // Remove diacritics / tashkeel and tatweel
    const cleaned = raw.replace(/[\u064B-\u0652\u0640]/g, "").trim();
    const rawTokens = cleaned.split(/\s+/).filter(Boolean);
    if (rawTokens.length === 0) return [];

    const merged: string[] = [];
    let i = 0;

    while (i < rawTokens.length) {
      const current = rawTokens[i];
      const next = i + 1 < rawTokens.length ? rawTokens[i + 1] : "";

      const isAbdPrefix = current === "عبد";
      const isAbuPrefix = current === "أبو" || current === "ابو";
      const isUmmPrefix = current === "أم" || current === "ام";
      const isIbnPrefix = current === "ابن" || current === "بن";
      const isAalPrefix = current === "آل";

      // Common suffix compounds like "الدين" or "الإسلام" or "الهدى"
      const isDinSuffix =
        next === "الدين" ||
        next === "الإسلام" ||
        next === "الاسلام" ||
        next === "الهدى" ||
        next === "الزهراء";

      if (current === "فاطمة" && (next === "الزهراء" || next === "الزهراء")) {
        merged.push(`${current} ${next}`);
        i += 2;
      } else if ((isAbdPrefix || isAbuPrefix || isUmmPrefix || isIbnPrefix || isAalPrefix) && next) {
        merged.push(`${current} ${next}`);
        i += 2;
      } else if (isDinSuffix && current) {
        merged.push(`${current} ${next}`);
        i += 2;
      } else {
        merged.push(current);
        i += 1;
      }
    }

    return merged;
  };

  // Smart Human Name Validator (Original permissive 4-part name check)
  const validateHumanArabicName = (rawName: string): { valid: boolean; error?: string; parts: string[] } => {
    const trimmed = rawName.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      return { valid: false, error: "يرجى كتابة الاسم رباعياً بالكامل للتسجيل.", parts: [] };
    }

    // Must be Arabic or English letters, spaces, hyphens/apostrophes only. NO numbers or weird symbols.
    const validLettersRegex = /^[\u0621-\u064A\u0671-\u06D3a-zA-Z\s\-']+$/;
    if (!validLettersRegex.test(trimmed)) {
      return {
        valid: false,
        error: "الاسم المدخل يحتوي على أرقام أو رموز غير مسموح بها. يرجى كتابة أحرف هجائية فقط.",
        parts: [],
      };
    }

    const parts = parseArabicNameParts(trimmed);

    // Must have at least 4 distinct human name components
    if (parts.length < 4) {
      return {
        valid: false,
        error: `الاسم المدخل يتكون من (${parts.length}) أسماء فقط. يجب كتابة الاسم الرباعي الحقيقي كاملاً (4 أسماء على الأقل) مثل: "محمد أحمد علي محمود".`,
        parts,
      };
    }

    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];
      const lettersOnly = part.replace(/\s+/g, "");
      if (lettersOnly.length < 2) {
        return {
          valid: false,
          error: `الاسم رقم (${idx + 1}) وهو (${part}) قصير جداً. يرجى كتابة الأسماء بشكل كامل.`,
          parts,
        };
      }
    }

    return { valid: true, parts };
  };

  // Smart Egyptian Phone Validator
  const validateEgyptianMobilePhone = (phone: string, label: string): { valid: boolean; error?: string } => {
    const clean = phone.trim();
    if (!clean) {
      return { valid: false, error: `يرجى إدخال ${label}.` };
    }

    // Format check: Exactly 11 digits starting with 010, 011, 012, or 015
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(clean)) {
      return {
        valid: false,
        error: `${label} غير صحيح. يجب أن يتكون من 11 رقماً مصرياً ويبدأ بـ (010 أو 011 أو 012 أو 015).`,
      };
    }

    // Smart Anti-fake checks:
    // 1. All same digits after prefix (e.g. 01000000000, 01111111111, 01222222222, 01555555555)
    const remainingDigits = clean.substring(3);
    if (/^(.)\1{7}$/.test(remainingDigits)) {
      return {
        valid: false,
        error: `${label} يحتوي على أرقام مكررة وهمية (${clean}). يرجى كتابة رقم هاتف حقيقي ومفعل.`,
      };
    }

    // 2. Sequential numbers (e.g. 01012345678, 01123456789, 01234567890, 01098765432)
    const sequentialPatterns = [
      "0123456789",
      "1234567890",
      "9876543210",
      "0987654321",
      "01012345678",
      "01123456789",
      "01234567890",
      "01098765432",
      "01198765432",
      "01298765432",
      "01598765432",
    ];
    if (sequentialPatterns.some((pat) => clean.includes(pat))) {
      return {
        valid: false,
        error: `${label} غير صحيح (تسلسل رقمي وهمي). يرجى كتابة رقم هاتف حقيقي ومفعل.`,
      };
    }

    // 3. More than 5 consecutive identical digits
    if (/(.)\1{5,}/.test(clean)) {
      return {
        valid: false,
        error: `${label} غير صحيح (أرقام مكررة بشكل غير طبيعي). يرجى كتابة رقم هاتف حقيقي.`,
      };
    }

    // 4. Repeated dummy loops (e.g. 01010101010 or 01201201201)
    if (
      clean === "01010101010" ||
      clean === "01101101101" ||
      clean === "01201201201" ||
      clean === "01501501501" ||
      clean === "01001001001" ||
      clean === "01110111011"
    ) {
      return {
        valid: false,
        error: `${label} غير صحيح. يرجى إدخال رقم هاتف حقيقي ومفعل.`,
      };
    }

    return { valid: true };
  };

  // Smart Official Google Email Validator
  const validateGoogleEmail = (emailStr: string): { valid: boolean; error?: string } => {
    const clean = emailStr.trim().toLowerCase();
    if (!clean) {
      return {
        valid: false,
        error: "يرجى إدخال البريد الإلكتروني كجهة اتصال احتياطية.",
      };
    }

    // Basic structure
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
      return {
        valid: false,
        error: "صيغة البريد الإلكتروني غير صحيحة. يرجى كتابة بريد إلكتروني صالح مثل yourname@gmail.com",
      };
    }

    const [username, domain] = clean.split("@");

    // Official Google Domain strict policy
    const allowedGoogleDomains = ["gmail.com", "googlemail.com", "google.com"];
    if (!allowedGoogleDomains.includes(domain)) {
      return {
        valid: false,
        error: "يرجى استخدام عنوان بريد إلكتروني رسمي معتمد من Google (Gmail) لضمان استلام إشعارات حسابك وتنبيهات الأمان واسترجاعه بأمان.",
      };
    }

    // Username length & spam checks
    if (username.length < 4) {
      return {
        valid: false,
        error: "اسم المستخدم في البريد الإلكتروني قصير جداً (يجب ألا يقل عن 4 أحرف).",
      };
    }

    if (/^(.)\1{4,}$/.test(username)) {
      return {
        valid: false,
        error: "عنوان البريد الإلكتروني المدخل غير صحيح. يرجى كتابة بريدك الإلكتروني الحقيقي.",
      };
    }

    const fakePatterns = ["qwerty", "asdfgh", "zxcvbn", "12345678", "abcdefgh"];
    if (fakePatterns.some((pat) => username.includes(pat) && username.length <= pat.length + 2)) {
      return {
        valid: false,
        error: "عنوان البريد الإلكتروني المدخل يبدو وهمياً. يرجى استخدام بريدك الإلكتروني الحقيقي.",
      };
    }

    return { valid: true };
  };

  // STEP 1 HANDLER: Form Validation & Move directly to Human Verification
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. Smart Name Check
    const nameCheck = validateHumanArabicName(fourPartName);
    if (!nameCheck.valid) {
      setErrorMsg(nameCheck.error || "يرجى التحقق من صحة الاسم الرباعي.");
      return;
    }

    // 2. Student Phone Check
    const studentPhoneCheck = validateEgyptianMobilePhone(studentPhone, "رقم هاتف الطالب");
    if (!studentPhoneCheck.valid) {
      setErrorMsg(studentPhoneCheck.error || "رقم هاتف الطالب غير صحيح.");
      return;
    }

    // 3. Parent Phone Check
    const parentPhoneCheck = validateEgyptianMobilePhone(parentPhone, "رقم هاتف ولي الأمر");
    if (!parentPhoneCheck.valid) {
      setErrorMsg(parentPhoneCheck.error || "رقم هاتف ولي الأمر غير صحيح.");
      return;
    }

    // 4. Distinct Phone Numbers Check
    if (studentPhone.trim() === parentPhone.trim()) {
      setErrorMsg(
        "تنبيه: يجب ألا يتطابق رقم هاتف الطالب مع رقم هاتف ولي الأمر في الخانتين.",
      );
      return;
    }

    // 5. Smart Google Email Check
    const emailCheck = validateGoogleEmail(email);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || "يرجى التحقق من البريد الإلكتروني.");
      return;
    }

    // 6. Check for duplicate Phone Number or Email against existing users
    const cleanDigits = (pStr?: string) => {
      if (!pStr) return "";
      const d = pStr.replace(/\D/g, "");
      if (d.startsWith("201") && d.length === 12) return "0" + d.substring(2);
      return d;
    };

    const studentP = cleanDigits(studentPhone);
    const parentP = cleanDigits(parentPhone);

    const isPhoneInUse = (targetDigits: string) => {
      if (!targetDigits || targetDigits.length < 8) return false;
      return (userProfiles || []).some((u) => {
        const uPhone = cleanDigits(u.phone);
        const uGuardian = cleanDigits(u.guardianPhone);
        const uMother = cleanDigits(u.motherPhone);
        return (
          (uPhone && uPhone === targetDigits) ||
          (uGuardian && uGuardian === targetDigits) ||
          (uMother && uMother === targetDigits)
        );
      });
    };

    if (studentP && isPhoneInUse(studentP)) {
      setErrorMsg(
        `عفواً، رقم هاتف الطالب (${studentPhone}) مسجل مسبقاً بحساب آخر على المنظومة (سواء كان معتمداً أو قيد المراجعة). يُمنع إنشاء أكثر من حساب بنفس رقم الهاتف نهائياً.`
      );
      return;
    }

    if (parentP && isPhoneInUse(parentP)) {
      setErrorMsg(
        `عفواً، رقم هاتف ولي الأمر (${parentPhone}) مسجل مسبقاً بحساب آخر على المنظومة (سواء كان معتمداً أو قيد المراجعة). يُمنع إنشاء أكثر من حساب بنفس رقم الهاتف نهائياً.`
      );
      return;
    }

    const cleanEmailStr = email.trim().toLowerCase();
    const isEmailInUse = (userProfiles || []).some(
      (u) => u.email.trim().toLowerCase() === cleanEmailStr
    );
    if (isEmailInUse) {
      setErrorMsg(
        `عفواً، البريد الإلكتروني (${email}) مسجل مسبقاً بحساب طالب آخر على المنظومة. لا يُسمح بإنشاء حسابين بنفس البريد.`
      );
      return;
    }

    // 7. Password Strength & Match Checks
    if (!password) {
      setErrorMsg("يرجى تعيين كلمة مرور للحساب.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        "كلمة المرور يجب أن تكون قوية ولا تقل عن 6 خانات (أحرف، أرقام، أو رموز).",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        "كلمة المرور وتأكيد كلمة المرور غير متطابقين. يرجى إعادة كتابتهما بدقة.",
      );
      return;
    }

    // Advance directly to Step 2: Intelligent Human Verification
    pickRandomScenario();
    setStep("human_verification");
    addToast(
      "info",
      "تم التحقق المبدئي من البيانات ✅",
      "يرجى الإجابة عن سؤال التحقق البشري الذكي للمتابعة.",
    );
  };

  // Dynamic Name Segments from smart compound parser
  const nameParts = parseArabicNameParts(fourPartName);

  // Pick random human scenario (Looping through 55 scenarios without repetition until all are completed)
  const pickRandomScenario = () => {
    // Filter out scenarios already completed in the current cycle
    let available = HUMAN_SCENARIOS.filter(
      (s) => !completedScenarioIds.includes(s.id)
    );

    // If all 55 scenarios have been completed, reset the loop cycle
    if (available.length === 0) {
      setCompletedScenarioIds([]);
      available = HUMAN_SCENARIOS;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];

    setSelectedScenario(chosen);
    setSelectedHumanOption(null);
    setHumanVerifiedSuccess(false);
    setScenarioMistakeCount(0);
  };

  // STEP 2 HANDLER: Human Verification Option Select with 2-Mistake Auto-Switch Rule
  const handleSelectHumanOption = (optionIndex: number) => {
    setSelectedHumanOption(optionIndex);
    if (optionIndex === selectedScenario.correctIndex) {
      setHumanVerifiedSuccess(true);
      setErrorMsg("");
      // Mark current scenario as successfully completed in this loop cycle
      if (!completedScenarioIds.includes(selectedScenario.id)) {
        setCompletedScenarioIds((prev) => [...prev, selectedScenario.id]);
      }
    } else {
      const newMistakes = scenarioMistakeCount + 1;
      setScenarioMistakeCount(newMistakes);
      setHumanVerifiedSuccess(false);

      if (newMistakes >= 2) {
        // Rule: If 2 mistakes are made in the same passage, replace with another scenario immediately
        setErrorMsg(
          "⚠️ تم تسجيل خطأين في نفس الفقرة. تنفيذاً لسياسة الأمان الصارمة، تم استبدال السيناريو تلقائياً بسيناريو جديد."
        );
        setTimeout(() => {
          pickRandomScenario();
        }, 1200);
      } else {
        setErrorMsg(
          "الإجابة غير صحيحة. (خطأ 1 من 2). اقرأ الفقرة بدقة وأعد المحاولة، أو سيتم استبدال السيناريو تلقائياً عند الخطأ الثاني."
        );
      }
    }
  };

  // STEP 5: Final Account Creation
  const handleFinalizeRegistration = async () => {
    if (!humanVerifiedSuccess) {
      setErrorMsg("يرجى الإجابة بشكل صحيح على سؤال التحقق البشري للمتابعة.");
      return;
    }

    if (!livePhoto) {
      setErrorMsg("يرجى التقاط صورة شخصية حية للمتابعة واعتماد الطلب.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const newStudentCode = `SEA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setIssuedStudentCode(newStudentCode);

      const extraData = {
        fourPartName: fourPartName.trim(),
        studentCode: newStudentCode,
        guardianPhone: parentPhone.trim(),
        guardianRelation,
        governorate,
        city: city.trim() || "المركز الرئيسي",
        schoolName: schoolName.trim() || "التعليم العام",
        gradeLevel: `${gradeLevel} (${stage === "primary" ? "ابتدائي" : stage === "prep" ? "إعدادي" : "ثانوي"} - ${educationType})`,
        academicSection,
        isEmailVerified: true,
        accountStatus: "pending_review" as const,
        photoUrl: livePhoto || undefined,
        gpsLocation: gpsLocation || undefined,
      };

      const res = await signup(
        fourPartName.trim(),
        email.trim(),
        password.trim(),
        studentPhone.trim(),
        `${gradeLevel} | ${governorate}`,
        extraData,
      );

      if (res.success) {
        // Save pending registration badge for home page alert
        try {
          localStorage.setItem(
            "sea_pending_student",
            JSON.stringify({
              name: fourPartName.trim(),
              email: email.trim(),
              studentCode: newStudentCode,
              submittedAt: new Date().toISOString(),
              status: "pending_review",
            })
          );
        } catch (storageErr) {
          console.warn("Storage error:", storageErr);
        }

        setStep("pending_review");
        addToast(
          "success",
          "تم إرسال طلبك للمراجعة بنجاح! 🎓✨",
          `كود الطالب الخاص بك هو: ${newStudentCode}`,
        );
      } else {
        setErrorMsg(
          res.message || "حدث خطأ أثناء حفظ طلب التسجيل. يرجى مراجعة البيانات والتحقق منها."
        );
        addToast("error", "تعذر التسجيل", res.message || "البيانات مسجلة مسبقاً.");
      }
    } catch (err: any) {
      setErrorMsg("حدث خطأ غير متوقع أثناء إرسال البيانات. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="smart-student-signup-page"
      className="space-y-8 pb-16 text-right text-slate-900 dark:text-white"
    >
      {/* Platform Logo & Official Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 p-1.5 shadow-2xl shadow-cyan-500/25 flex items-center justify-center overflow-hidden">
          <img
            src="/student-logo.png"
            alt="شعار قطاع الطلاب SEA"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo.png";
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
            أنشئ حسابك المعتمد للدخول واختيار منصات المعلمين ومتابعة دروسك
            واختباراتك بحرية تامة.
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
        {step === "form" && (
          <div className="space-y-8 animate-fade-in">
            {/* Straightforward Instructions Guide Box */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>تعليمات وإرشادات إنشاء حساب طالب جديد</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">الاسم الرباعي الرسمي:</strong>
                    <span>كتابة الاسم رباعياً بالكامل لاعتماده في بطاقة القيد، والأسماء المركبة (مثل عبد العزيز) تُحسب كاسم واحد.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">أرقام هواتف التواصل:</strong>
                    <span>إدخال رقم هاتف الطالب ورقم هاتف ولي الأمر للتواصل والمتابعة الدورية.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">البريد الإلكتروني الاحتياطي:</strong>
                    <span>إدخال بريد إلكتروني معتمد من Google (Gmail) كجهة احتياطية للطوارئ واسترجاع الحساب.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">كلمة المرور القوية:</strong>
                    <span>تعيين كلمة مرور قوية لحسابك لضمان الدخول الآمن في كل مرة.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">5</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">التحقق البشري:</strong>
                    <span>التوجيه إلى صفحة تحتوي على حل سؤال بسيط للتأكد من بشرية المستخدم.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">6</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">التقاط صورة شخصية:</strong>
                    <span>التقاط صورة لتأكيد هويتك وضمان استخدامك الشخصي وحماية المحتوى (ليست لأي خطر وإنما لضمان خصوصيتك).</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">7</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">المراجعة اليدوية (1 - 48 ساعة):</strong>
                    <span>يتم وضع الحساب تحت مراجعة بشرية يدوية من قبل الإدارة للتدقيق والاعتماد.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">8</span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block mb-0.5">القبول وتعيين المعرّف (ID):</strong>
                    <span>عند قبول بياناتك وصورتك، يتم تعيين معرّف (ID) فريد خاص بك لا يتكرر مع غيرك وتتعامل به الإدارة.</span>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-8"
            >
            {/* 1. Full Four-Part Name */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black text-cyan-700 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-800 pb-3">
                <User className="w-4 h-4" />
                <span>أولاً: الاسم الرسمي للطالب</span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  الاسم رباعي بالكامل (الاسم الأول، اسم الأب، اسم الجد، اسم
                  العائلة أو اللقب) <span className="text-rose-500">*</span>
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
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    تحليل مقاطع الاسم:
                  </span>
                  {nameParts.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">
                      اكتب اسمك رباعياً لتأكيد المقاطع
                    </span>
                  ) : (
                    nameParts.map((part, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 ${
                          idx === 0
                            ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/80"
                            : idx === 1
                              ? "bg-indigo-950/60 text-indigo-300 border-indigo-800/80"
                              : idx === 2
                                ? "bg-teal-950/60 text-teal-300 border-teal-800/80"
                                : "bg-purple-950/60 text-purple-300 border-purple-800/80"
                        }`}
                      >
                        <span className="text-[9px] opacity-70">
                          {idx === 0
                            ? "الأول:"
                            : idx === 1
                              ? "الأب:"
                              : idx === 2
                                ? "الجد:"
                                : "العائلة:"}
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
                  1. اختر المرحلة التعليمية{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStageChange("primary")}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === "primary"
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span>المرحلة الابتدائية</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      1 - 6 ابتدائي
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStageChange("prep")}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === "prep"
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span>المرحلة الإعدادية</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      1 - 3 إعدادي
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStageChange("secondary")}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      stage === "secondary"
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <span>المرحلة الثانوية</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      1 - 3 ثانوي
                    </span>
                  </button>
                </div>
              </div>

              {/* Grade and Education Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Specific Grade */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    2. الصف الدراسي المحدد{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                  >
                    {getGradeOptions().map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Education Type */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    3. نوع التعليم <span className="text-rose-500">*</span>
                  </label>
                  {stage === "secondary" ? (
                    <select
                      value={educationType}
                      onChange={(e) => setEducationType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                    >
                      <option value="عام">ثانوية عامة (نظام عام)</option>
                      <option value="بكالوريا / دولي">
                        بكالوريا دولية / دولي (IB / IGCSE / American)
                      </option>
                      <option value="أزهري">
                        ثانوية أزهرية (معاهد الأزهر الشريف)
                      </option>
                    </select>
                  ) : (
                    <select
                      value={educationType}
                      onChange={(e) => setEducationType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:border-cyan-500 focus:outline-none text-right appearance-none"
                    >
                      <option value="عام">
                        تعليم عام (حكومي / تجريبي ولغات)
                      </option>
                      <option value="أزهري">
                        تعليم أزهري (معاهد الأزهر الشريف)
                      </option>
                    </select>
                  )}
                </div>
              </div>

              {/* Academic Section (if 2nd or 3rd secondary) */}
              {stage === "secondary" &&
                (gradeLevel.includes("الثاني") ||
                  gradeLevel.includes("الثالث")) && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      4. الشعبة الدراسية{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={academicSection}
                      onChange={(e) =>
                        setAcademicSection(e.target.value as any)
                      }
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
                      <option key={gov} value={gov}>
                        {gov} 📍
                      </option>
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
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المدرسة المقيد بها <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مدرسة المتفوقين الرسمية للغات"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-xs font-bold focus:border-cyan-500 focus:outline-none text-right"
                  />
                </div>

                {/* Live GPS School Location Verification */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 space-y-3 text-right">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-cyan-800 dark:text-cyan-300">
                      <MapPin className="w-4 h-4 text-cyan-500" />
                      <span>التوثيق الجغرافي المباشر لموقع المدرسة (GPS Location Verification)</span>
                    </div>
                    {gpsLocation && (
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        موقع مؤكد بـ GPS
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    يتم ربط وتأكيد موقع مدرسة الطالب بإحداثيات الـ GPS المباشرة من جغرافية الجهاز للتأكد التام من القيد وتجنب المحاكاة الوهمية.
                  </p>

                  {gpsLocation ? (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          الإحداثيات: {gpsLocation.lat.toFixed(5)}° N, {gpsLocation.lng.toFixed(5)}° E
                        </div>
                        <div className="text-[10px] text-slate-500">
                          دقة التحديد: ±{gpsLocation.accuracy || 10} أمتار • تم الالتقاط: {new Date(gpsLocation.capturedAt || Date.now()).toLocaleTimeString('ar-EG')}
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${gpsLocation.lat},${gpsLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-sans font-bold text-xs flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>معاينة الموقع عبر Google Maps</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={captureSchoolGps}
                        disabled={isCapturingGps}
                        className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isCapturingGps ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري جلب إحداثيات GPS المباشرة للموقع...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            <span>التقاط وتأكيد موقع المدرسة بـ GPS الآن</span>
                          </>
                        )}
                      </button>
                      {gpsError && (
                        <p className="text-[11px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                          ⚠️ {gpsError}
                        </p>
                      )}
                    </div>
                  )}
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
                      رقم هاتف الطالب (واتساب){" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    {getOperatorInfo(studentPhone) && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getOperatorInfo(studentPhone)?.color}`}
                      >
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
                      onChange={(e) =>
                        setStudentPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all text-left font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                  </div>
                </div>

                {/* Parent Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      رقم هاتف أحد الوالدين (ولي الأمر){" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    {getOperatorInfo(parentPhone) && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getOperatorInfo(parentPhone)?.color}`}
                      >
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
                      onChange={(e) =>
                        setParentPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-4 py-3.5 pr-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-emerald-500 focus:outline-none transition-all text-left font-mono font-bold tracking-wider"
                    />
                    <Phone className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                🔒 شرط أساسي: يجب أن يكون رقما الهاتفين مصريين صحيحين وغير
                متطابقين لضمان استلام التنبيهات.
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
                  البريد الإلكتروني الاحتياطي (للطوارئ والإشعارات){" "}
                  <span className="text-rose-500">*</span>
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
                <p className="mt-1.5 text-[11px] text-slate-500">
                  ℹ️ يُستخدم كبريد احتياطي للتواصل وتنبيهات أمان الحساب دون الحاجة لرموز OTP.
                </p>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    كلمة المرور (احرص على أن تكون قوية){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 pr-11 pl-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all text-left font-mono"
                    />
                    <Lock className="w-5 h-5 text-slate-500 absolute right-3.5 top-4" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute left-3.5 top-3.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: INTELLIGENT HUMAN VERIFICATION (16+ SCENARIOS)
        ══════════════════════════════════════════════════════ */}
        {step === "human_verification" && (
          <div className="py-4 space-y-6 animate-fade-in max-w-2xl mx-auto text-right">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    الخطوة الثانية: التحقق البشري الذكي (Human Logic Verification)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    اقرأ الفقرة التالية بعناية وأجب عن السؤال المرفق لتأكيد هويتك
                  </p>
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
                  <span>{isEnglishView ? "العربية" : "English View"}</span>
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

            {/* Scenario Story Box with High Contrast and Enhanced Typography */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/50 space-y-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-4 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800">
                <span className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4" />
                  {isEnglishView
                    ? selectedScenario.titleEn
                    : selectedScenario.titleAr}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 rounded-lg">
                  سيناريو رقم #{selectedScenario.id} من 55
                </span>
              </div>

              {/* 5+ Line Narrative with High Contrast Text (slate-900 on white / slate-100 on dark-slate-900) */}
              <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-loose font-bold whitespace-pre-line px-1">
                {isEnglishView
                  ? selectedScenario.storyEn
                  : selectedScenario.storyAr}
              </p>

              {/* Question */}
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-700 text-sm sm:text-base font-black text-cyan-900 dark:text-cyan-200 leading-relaxed shadow-inner">
                ❓{" "}
                {isEnglishView
                  ? selectedScenario.questionEn
                  : selectedScenario.questionAr}
              </div>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                اختر الإجابة الصحيحة بناءً على قراءتك للفقرة:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(isEnglishView
                  ? selectedScenario.optionsEn
                  : selectedScenario.optionsAr
                ).map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectHumanOption(idx)}
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-black border text-right transition-all flex items-center justify-between cursor-pointer ${
                      selectedHumanOption === idx
                        ? idx === selectedScenario.correctIndex
                          ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20"
                          : "bg-rose-950/80 border-rose-500 text-rose-600 dark:text-rose-300"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-600 hover:text-slate-900 dark:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedHumanOption === idx &&
                      (idx === selectedScenario.correctIndex ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0" />
                      ))}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Success Feedback */}
            {humanVerifiedSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>
                  تم التحقق البشري بنجاح وبدقة فائقة! يمكنك الآن الانتقال لالتقاط صورتك الشخصية الحية.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("live_photo");
                  startCamera();
                }}
                disabled={!humanVerifiedSuccess || isLoading}
                className={`w-full sm:flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  humanVerifiedSuccess
                    ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-xl shadow-emerald-500/20 cursor-pointer"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>المتابعة لالتقاط الصورة الشخصية الحية</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setStep("form");
                }}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                الرجوع لتعديل البيانات
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3: LIVE PHOTO CAPTURE
        ══════════════════════════════════════════════════════ */}
        {step === "live_photo" && (
          <div className="space-y-6 animate-fade-in text-center pb-8 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            {/* Hidden native camera file input fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleNativePhotoUpload}
              className="hidden"
            />

            <div className="mx-auto w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mb-2 shadow-lg shadow-cyan-500/20 border border-cyan-500/30">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 text-xs font-black border border-cyan-800/80 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                الخطوة الثالثة: التقاط الصورة الحية للتحقق من الهوية
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                الصورة الشخصية لتأكيد الهوية
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mt-1 font-medium">
                لتوثيق حسابك والتأكد من استخدامك الشخصي وضمان حماية المحتوى، يرجى التقاط صورة واضحة ومباشرة لوجهك لاعتمادها في بطاقة قيدك.
              </p>
            </div>

            {cameraError && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs font-bold space-y-3 text-right max-w-md mx-auto">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>{cameraError}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-2.5 px-3 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    إعادة محاولة فتح الكاميرا
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerNativeCamera}
                    className="py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    فتح كاميرا الهاتف المباشرة
                  </button>
                </div>
              </div>
            )}

            {/* Camera Viewfinder Box */}
            <div className="relative mx-auto w-full max-w-md aspect-square bg-slate-950 rounded-3xl overflow-hidden border-4 border-cyan-500/40 shadow-2xl">
              {/* Flash effect overlay */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-pulse" />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in pointer-events-none">
                  <span className="text-7xl font-black text-cyan-400 animate-ping">
                    {countdown}
                  </span>
                  <span className="text-xs font-bold text-slate-200 mt-4 bg-slate-900/80 px-3 py-1 rounded-full border border-cyan-500/30">
                    ثبت وجهك... جاري الالتقاط
                  </span>
                </div>
              )}

              {/* Loading Stream Overlay */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-slate-950/90 z-30 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-bold text-slate-300">
                    جاري تشغيل كاميرا الجهاز...
                  </span>
                </div>
              )}

              {!livePhoto ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <img
                  src={livePhoto}
                  alt="Captured Student Live Photo"
                  className="w-full h-full object-cover"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />

              {/* Face Guide Reticle (when streaming) */}
              {!livePhoto && cameraStream && !countdown && (
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-cyan-400/60 rounded-[48%] pointer-events-none flex flex-col items-center justify-between p-4 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                  <span className="text-[10px] font-black text-cyan-300 bg-slate-950/80 px-3 py-0.5 rounded-full border border-cyan-500/30 backdrop-blur-md">
                    ضع وجهك بالكامل داخل الإطار
                  </span>
                  <div className="w-3 h-3 rounded-full bg-cyan-400/40 animate-ping" />
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded-full">
                    إضاءة واضحة ومباشرة
                  </span>
                </div>
              )}
            </div>

            {/* Photo Review / Capture Controls */}
            <div className="flex flex-col gap-3 max-w-md mx-auto mt-4">
              {!livePhoto ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={executeSnap}
                      disabled={!cameraStream || isCameraLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>التقاط فوري الآن 📸</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerCountdownCapture}
                      disabled={!cameraStream || isCameraLoading || countdown !== null}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black text-sm rounded-2xl flex justify-center items-center gap-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <span>مؤقت (3 ثوانٍ) ⏱️</span>
                    </button>
                  </div>

                  {/* Native Device Camera Trigger Button (iPhone/Android/Desktop) */}
                  <button
                    type="button"
                    onClick={handleTriggerNativeCamera}
                    className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-cyan-400 font-bold text-xs rounded-2xl border border-cyan-500/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span>التقاط عبر كاميرا الهاتف الأصلية (لكافة الأجهزة والأنظمة) 📱</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>تم التقاط صورتك بنجاح! راجع الصورة وتأكد من وضوحها.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="w-full py-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>إعادة التقاط الصورة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalizeRegistration}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm rounded-2xl flex justify-center items-center gap-2 shadow-xl shadow-cyan-500/25 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري تقديم الطلب...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تأكيد الصورة وإرسال الطلب للمراجعة 🚀</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 6: PENDING REVIEW CONFIRMATION
        ══════════════════════════════════════════════════════ */}
        {step === "pending_review" && (
          <div className="space-y-8 animate-fade-in text-center pb-8 max-w-xl mx-auto">
            {/* Status Pulse Badge */}
            <div className="mx-auto w-20 h-20 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-3xl border border-amber-500/30 flex items-center justify-center shadow-xl relative">
              <ShieldCheck className="w-10 h-10 text-amber-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/60">
                طلب مراجعة بياناتك قيد الانتظار ⏳
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                تم استلام طلب تسجيلك بنجاح!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                أهلاً بك يا <span className="font-bold text-slate-900 dark:text-white">{fourPartName}</span>، تم تسجيل بياناتك وحفظ صورتك الشخصية في منظومة القبول المركزي.
              </p>
            </div>

            {/* Exact Required 48-hour Review Time Box */}
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400/40 text-right shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-sm border-b border-amber-300 dark:border-amber-800/60 pb-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>إشعار المراجعة والتدقيق الأمني:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-bold">
                سيتم فحص بياناتك ومراجعتها، والرد عليك خلال مدة تبدأ من ساعة وحتى 48 ساعة بحد أقصى.
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                تقوم إدارة المنظومة بمطابقة صورتك الشخصية مع بياناتك الرباعية وأرقام هواتف ولي الأمر لضمان أعلى مستويات الموثوقية واعتماد بطاقة القيد الرسمية.
              </p>
            </div>

            {/* Student Registered Summary Card */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    ملخص بيانات الطالب المسجلة
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-800/60">
                  {issuedStudentCode || "SEA-ID"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">الاسم رباعي:</span>
                  <div className="font-black text-slate-900 dark:text-white">{fourPartName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">المرحلة والصف:</span>
                  <div className="font-bold text-slate-700 dark:text-slate-300">{gradeLevel} • {educationType}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">هاتف الطالب (واتساب):</span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{studentPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">هاتف ولي الأمر:</span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{parentPhone}</div>
                </div>
              </div>

              {/* Progress Milestones Checklist */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تم استلام وتوثيق البيانات والاسم الرباعي</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تم تأكيد أرقام التواصل المصرية وهاتف ولي الأمر</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>تم التقاط الصورة الحية وحفظها لملف التحقق</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  <span>مراجعة الإدارة وتفعيل القيد (خلال 1 إلى 48 ساعة بحد أقصى)</span>
                </div>
              </div>
            </div>

            {/* Direct to Main Page Button as Requested */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => setCurrentView("home")}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>العودة إلى الصفحة الرئيسية</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                طلب مراجعة بياناتك قيد الانتظار • يمكنك تصفح المنصات والمقررات بالصفحة الرئيسية حتى اعتماد حسابك.
              </p>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="py-6 space-y-8 animate-fade-in text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
                تم اعتماد الحساب الرسمي بنجاح
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                أهلاً بك يا {fourPartName.split(" ")[0]}! 🎓⭐
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                تم تسجيل حسابك بنجاح. يمكنك الآن الانتقال للوحة التحكم لاختيار
                المنصة التي ترغب في التعلم بها والاطلاع على ملفك الشخصي المعتمد.
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
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      بطاقة الطالب الذكية الموحدة
                    </div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-bold">
                      Smart Education Authority (SEA-ID)
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-800/80 text-[11px] font-black">
                  حساب معتمد وموثق ✅
                </div>
              </div>

              {/* Card Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    الاسم رباعي بالكامل:
                  </span>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {fourPartName}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    كود الطالب الموحد (SEA-ID):
                  </span>
                  <div className="font-mono font-black text-cyan-700 dark:text-cyan-400 text-sm select-all">
                    {issuedStudentCode}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    المرحلة والصف:
                  </span>
                  <div className="font-bold text-slate-200">
                    {gradeLevel} • {educationType}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    المحافظة والمدرسة:
                  </span>
                  <div className="font-bold text-slate-200">
                    {governorate} • {schoolName || "التعليم العام"}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    هاتف الطالب (واتساب):
                  </span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">
                    {studentPhone}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block mb-0.5">
                    هاتف ولي الأمر:
                  </span>
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300 select-all">
                    {parentPhone}
                  </div>
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
                onClick={() => setCurrentView("student_portal")}
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
