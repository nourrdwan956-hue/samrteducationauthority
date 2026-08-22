import re

with open('src/components/StudentSignUpPage.tsx', 'r') as f:
    text = f.read()

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

# The exact end of step 2 is:
#               </button>
#             </div>
#           </div>
#         )}
#         {/* ══════════════════════════════════════════════════════
text = text.replace(
    "              </button>\n            </div>\n          </div>\n        )}",
    "              </button>\n            </div>\n" + skip_ui + "          </div>\n        )}"
)

with open('src/components/StudentSignUpPage.tsx', 'w') as f:
    f.write(text)

