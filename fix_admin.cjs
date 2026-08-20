const fs = require('fs');
const path = 'src/components/SuperAdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const barrier = `  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldCheck className="w-20 h-20 text-rose-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">صلاحيات غير كافية</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8">
          هذه الصفحة مخصصة لمدير النظام والسلطة العليا فقط.
        </p>
        <button 
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all"
        >
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }
`;

const insertPoint = `  const [activeTab, setActiveTab] = useState<'platforms' | 'requests' | 'tickets' | 'registrants'>('platforms');`;
if (!content.includes('صلاحيات غير كافية')) {
  content = content.replace(insertPoint, barrier + '\n' + insertPoint);
  fs.writeFileSync(path, content);
  console.log('Added Admin barrier');
} else {
  console.log('Admin barrier already exists');
}
