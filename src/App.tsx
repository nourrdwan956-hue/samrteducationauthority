import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { BottomMobileBar } from './components/BottomMobileBar';
import { HomeHero } from './components/HomeHero';
import { PlatformMarketplace } from './components/PlatformMarketplace';
import { PlatformDetail } from './components/PlatformDetail';
import { CourseDetail } from './components/CourseDetail';
import { SecureVideoPlayer } from './components/SecureVideoPlayer';
import { ExamEngine } from './components/ExamEngine';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { RentalForm } from './components/RentalForm';
import { StudentSignUpPage } from './components/StudentSignUpPage';

export const App: React.FC = () => {
  const {
    currentView,
    theme,
  } = useApp();

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans antialiased overflow-x-hidden transition-colors duration-400 pb-16 md:pb-0 ${
        isLight
          ? 'bg-slate-50 text-slate-900 selection:bg-cyan-600 selection:text-white'
          : 'bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {/* Top Navigation */}
      <Navbar />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {currentView === 'home' && <HomeHero />}
        {currentView === 'platforms' && <PlatformMarketplace />}
        {currentView === 'platform_detail' && <PlatformDetail />}
        {currentView === 'course_detail' && <CourseDetail />}
        {(currentView === 'lesson_player' || currentView === 'security_showcase') && <SecureVideoPlayer />}
        {currentView === 'exam_view' && <ExamEngine />}
        {currentView === 'super_admin' && <SuperAdminDashboard />}
        {currentView === 'teacher_dashboard' && <TeacherDashboard />}
        {currentView === 'student_portal' && <StudentPortal />}
        {currentView === 'student_signup' && <StudentSignUpPage />}
        {(currentView === 'rental_form' || currentView === 'rent_platform_form') && <RentalForm />}
      </main>

      {/* Global Footer with theme switcher & signature */}
      <Footer />

      {/* Bottom Navigation for Mobile Devices */}
      <BottomMobileBar />

      {/* Unified Modals & Toast Notifications */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default App;

