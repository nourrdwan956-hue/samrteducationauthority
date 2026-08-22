import re

with open('src/components/StudentSignUpPage.tsx', 'r') as f:
    text = f.read()

# Add a state for email error
if "const [emailError, setEmailError] = useState(false);" not in text:
    text = text.replace(
        "const [generatedOtp, setGeneratedOtp] = useState('');",
        "const [generatedOtp, setGeneratedOtp] = useState('');\n  const [emailError, setEmailError] = useState(false);"
    )

# Set email error on catch
text = text.replace(
    "err.message || 'يرجى التأكد من صحة البريد الإلكتروني المدخل ومحاولة المحاولة مجدداً.'",
    "err.message || 'يرجى التأكد من صحة البريد الإلكتروني المدخل ومحاولة المحاولة مجدداً.'\n        );\n        setEmailError(True);"
)
text = text.replace("setEmailError(True);", "setEmailError(true);")

# Clear email error on resend/start
text = text.replace(
    "setStep('email_otp');",
    "setStep('email_otp');\n    setEmailError(false);"
)

# Add skip button in UI
skip_ui = """
            {emailError && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-800 dark:text-amber-200 text-xs mb-3 font-bold">
                  يبدو أن هناك مشكلة في إرسال البريد في بيئة الاستضافة الحالية. بما أن نظام المراجعة اليدوية والصورة الحية مفعل، يمكنك تخطي هذه الخطوة مؤقتاً.
                </p>
                <button
                  type="button"
                  onClick={() => setStep('password_count_check')}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs rounded-lg transition-colors"
                >
                  تخطي خطوة البريد الإلكتروني للمتابعة
                </button>
              </div>
            )}
"""

if "emailError &&" not in text:
    text = text.replace(
        "</button>\n          </div>\n        )}",
        "</button>\n" + skip_ui + "\n          </div>\n        )}"
    )

with open('src/components/StudentSignUpPage.tsx', 'w') as f:
    f.write(text)

print("OTP patched.")
