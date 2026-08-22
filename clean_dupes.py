import re

with open('src/components/SuperAdminDashboard.tsx', 'r') as f:
    content = f.read()

# The string we inserted
button_str = """        <button 
          onClick={() => setActiveTab('pending_approvals')} 
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${ 
            activeTab === 'pending_approvals' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md' 
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-slate-400 hover:text-white' 
          }`} 
        > 
          <ShieldCheck className="w-4 h-4" /> 
          <span>طلبات التسجيل المعلقة ({userProfiles?.filter(u => u.accountStatus === 'pending_review').length || 0})</span> 
          {userProfiles?.filter(u => u.accountStatus === 'pending_review').length > 0 && ( 
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse"> 
              {userProfiles?.filter(u => u.accountStatus === 'pending_review').length} 
            </span> 
          )} 
        </button> 
"""

# Let's write a regex that matches the block exactly, even with leading spaces or slight differences in newlines
pattern = r'(?:[ \t]*<button \n[ \t]*onClick=\{\(\) => setActiveTab\(\'pending_approvals\'\)\}[ \t]*\n.*?</button>[ \t]*\n)+'

new_content = re.sub(pattern, button_str, content, flags=re.DOTALL)

with open('src/components/SuperAdminDashboard.tsx', 'w') as f:
    f.write(new_content)

print(f"Original length: {len(content)}, New length: {len(new_content)}")
