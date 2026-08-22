import re

with open('src/components/StudentSignUpPage.tsx', 'r') as f:
    text = f.read()

# 1. State definition
text = text.replace(
    "const [step, setStep] = useState<'form' | 'email_otp' | 'password_count_check' | 'human_verification' | 'complete'>('form');",
    "const [step, setStep] = useState<'form' | 'email_otp' | 'password_count_check' | 'human_verification' | 'live_photo' | 'pending_review' | 'complete'>('form');"
)

# 2. Add camera states and refs just before 'const [issuedStudentCode'
camera_code = """
  const [livePhoto, setLivePhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');

  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('لم نتمكن من الوصول إلى الكاميرا. يرجى التأكد من منح الإذن للمتابعة.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setLivePhoto(dataUrl);
        stopCamera();
      }
    }
  };
"""
text = text.replace(
    "const [issuedStudentCode",
    camera_code + "\n  const [issuedStudentCode"
)

# 3. Update extraData and success step
text = text.replace(
    "accountStatus: 'verified' as const,",
    "accountStatus: 'pending_review' as const,\n        photoUrl: livePhoto || undefined,"
)
text = text.replace(
    "setStep('complete');",
    "setStep('pending_review');"
)

# 4. Change human verification next button
text = text.replace(
    "onClick={handleFinalizeRegistration}",
    "onClick={() => { setStep('live_photo'); startCamera(); }}"
)
text = text.replace(
    "إنشاء واعتماد الحساب",
    "المتابعة لالتقاط الصورة"
)

# 5. Add live_photo UI and pending_review UI before the complete step
live_photo_ui = """
        {/* STEP 5: Live Photo Capture */}
        {step === 'live_photo' && (
          <div className="space-y-6 animate-fade-in text-center pb-8 border-b-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">الصورة الشخصية للتحقق</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              لضمان أعلى معايير الأمان وموثوقية الحسابات، يرجى التقاط صورة شخصية واضحة لك الآن. لن يتم تفعيل الحساب إلا بعد مطابقة الإدارة لهذه الصورة.
            </p>

            {cameraError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold animate-pulse">
                {cameraError}
                <button onClick={startCamera} className="mt-3 w-full py-2 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs">حاول مرة أخرى</button>
              </div>
            )}

            <div className="relative mx-auto w-full max-w-md aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-inner">
              {!livePhoto ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              ) : (
                <img src={livePhoto} alt="Captured" className="w-full h-full object-cover transform scale-x-[-1]" />
              )}
              <canvas ref={canvasRef} className="hidden" />
              
              {!livePhoto && cameraStream && (
                <div className="absolute inset-0 pointer-events-none border-[4px] border-emerald-500/30 rounded-2xl animate-pulse"></div>
              )}
            </div>

            <div className="flex flex-col gap-3 max-w-md mx-auto mt-6">
              {!livePhoto ? (
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraStream}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" /> التقاط الصورة الآن
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setLivePhoto(null); startCamera(); }}
                    className="w-full py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    إعادة الالتقاط
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeRegistration}
                    disabled={isLoading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء الحساب وإرسال للمراجعة'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: Pending Review */}
        {step === 'pending_review' && (
          <div className="space-y-6 animate-fade-in text-center pb-8">
            <div className="mx-auto w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <ShieldCheck className="w-12 h-12" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-4 border-white dark:border-slate-950 animate-ping"></div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">طلبك قيد المراجعة</h2>
            
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 text-sm text-amber-800 dark:text-amber-200 leading-relaxed font-bold max-w-lg mx-auto shadow-sm">
              <p>تم استلام طلب تسجيلك بنجاح وحفظ صورتك الشخصية.</p>
              <p className="mt-2 text-amber-600 dark:text-amber-400">تقوم الإدارة حالياً بمراجعة حسابك ومطابقة البيانات لضمان الموثوقية الكاملة. يتم الموافقة على الحسابات عادةً خلال (1 - 6 ساعات) كحد أقصى.</p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="w-full sm:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black hover:scale-105 transition-transform"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        )}
"""

text = text.replace(
    "{step === 'complete' && (",
    live_photo_ui + "\n        {step === 'complete' && ("
)

with open('src/components/StudentSignUpPage.tsx', 'w') as f:
    f.write(text)

print("StudentSignUpPage.tsx updated successfully.")
