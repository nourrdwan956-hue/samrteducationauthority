import re

with open('src/components/SuperAdminDashboard.tsx', 'r') as f:
    text = f.read()

# 1. Add pending_approvals to the state type
text = text.replace(
    "'summary' | 'platforms' | 'requests' | 'tickets' | 'registrants' | 'payments' | 'printed_batches'",
    "'summary' | 'platforms' | 'requests' | 'tickets' | 'registrants' | 'payments' | 'printed_batches' | 'pending_approvals'"
)

# 2. Add the button
btn_code = """
        <button
          onClick={() => setActiveTab('pending_approvals')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === 'pending_approvals'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>طلبات التسجيل ({userProfiles.filter(u => u.accountStatus === 'pending_review').length})</span>
          {userProfiles.filter(u => u.accountStatus === 'pending_review').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse">
              {userProfiles.filter(u => u.accountStatus === 'pending_review').length}
            </span>
          )}
        </button>
"""
text = text.replace(
    "onClick={() => setActiveTab('registrants')}",
    "onClick={() => setActiveTab('registrants')}\n        "
) # Just in case

# Insert button before registrants button
parts = text.split("onClick={() => setActiveTab('registrants')}")
if len(parts) == 2:
    before_registrants = parts[0].rsplit("<button", 1)
    text = before_registrants[0] + btn_code + "\n        <button" + before_registrants[1] + "onClick={() => setActiveTab('registrants')}" + parts[1]

# 3. Add the content block
content_code = """
      {/* Tab: Pending Approvals */}
      {activeTab === 'pending_approvals' && (
        <div className="space-y-6 animate-fade-in text-right">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className={`text-xl font-black flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ShieldCheck className="w-6 h-6 text-amber-500" />
                مراجعة طلبات التسجيل وتوثيق الهوية
              </h3>
              <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                الطلبات المعلقة التي تتطلب مطابقة صورة الطالب مع بياناته للموافقة على تنشيط الحساب.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProfiles.filter(u => u.accountStatus === 'pending_review').length === 0 ? (
              <div className={`col-span-full py-12 text-center rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                <p>لا توجد طلبات معلقة للمراجعة حالياً.</p>
              </div>
            ) : (
              userProfiles.filter(u => u.accountStatus === 'pending_review').map(user => (
                <div key={user.id} className={`p-4 rounded-3xl border flex flex-col gap-4 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  {user.photoUrl ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
                      <img src={user.photoUrl} alt="Student" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700">
                        صورة التحقق الحية
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 text-sm font-bold">
                      لا توجد صورة
                    </div>
                  )}
                  
                  <div className="space-y-1 text-right">
                    <h4 className={`font-black text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user.fourPartName || user.name}</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{user.gradeLevel} • {user.governorate}</p>
                    <p className={`text-xs font-mono mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{user.studentCode}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        const updated = userProfiles.map(u => u.id === user.id ? { ...u, accountStatus: 'verified' } : u);
                        setUserProfiles(updated);
                        localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
                        addToast('success', 'تم قبول الطالب', `تم تفعيل حساب الطالب ${user.name} بنجاح.`);
                      }}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-colors"
                    >
                      قبول وتفعيل
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من رفض هذا الطلب وإيقاف الحساب؟')) {
                          const updated = userProfiles.map(u => u.id === user.id ? { ...u, accountStatus: 'suspended' } : u);
                          setUserProfiles(updated);
                          localStorage.setItem('sea_user_profiles', JSON.stringify(updated));
                          addToast('error', 'تم رفض الطلب', `تم رفض طلب الطالب ${user.name} وإيقاف حسابه.`);
                        }
                      }}
                      className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-xl transition-colors"
                    >
                      رفض وحظر
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
"""

parts2 = text.split("{activeTab === 'registrants' && (")
if len(parts2) == 2:
    text = parts2[0] + content_code + "\n      {activeTab === 'registrants' && (" + parts2[1]

with open('src/components/SuperAdminDashboard.tsx', 'w') as f:
    f.write(text)

print("Patched SuperAdminDashboard.tsx successfully.")
