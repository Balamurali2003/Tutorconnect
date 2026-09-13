import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/Toast';

// Auth
import { LoginPage } from './pages/auth/LoginPage';

// Tutor Portal
import { TutorLayout } from './components/tutor/TutorLayout';
import { TutorDashboardPage } from './pages/tutor/TutorDashboardPage';
import { TutorStudentsPage } from './pages/tutor/TutorStudentsPage';
import { TutorClassesPage } from './pages/tutor/TutorClassesPage';
import { TutorUpdateHistoryPage } from './pages/tutor/TutorUpdateHistoryPage';
import { TutorProfilePage } from './pages/tutor/TutorProfilePage';

// Parent Portal
import { ParentLayout } from './components/parent/ParentLayout';
import { ParentDashboardPage } from './pages/parent/ParentDashboardPage';
import { ParentStudentProfilePage } from './pages/parent/ParentStudentProfilePage';
import { ParentTutorUpdatesPage } from './pages/parent/ParentTutorUpdatesPage';
import { ParentClassesPage } from './pages/parent/ParentClassesPage';

// Admin CRM Pages
import { DashboardPage } from './pages/DashboardPage';
import { AllTutorsPage } from './pages/AllTutorsPage';
import { PriorityTutorsPage } from './pages/PriorityTutorsPage';
import { TutorDetailPage } from './pages/TutorDetailPage';
import { DocumentVerificationPage } from './pages/DocumentVerificationPage';
import { InterviewProcessPage, DemoClassesPage, ParentApprovalPage } from './pages/RecruitmentSubPages';
import { StudentsPage, ParentsPage } from './pages/StudentsParentsPage';
import { ExcelImportPage } from './pages/ExcelImportPage';
import { TutorMatchingPage } from './pages/TutorMatchingPage';
import { ValidatedTutorsPage } from './pages/ValidatedTutorsPage';
import { AppointedTutorsPage } from './pages/AppointedTutorsPage';
import { AdminTutorUpdatesPage } from './pages/admin/AdminTutorUpdatesPage';
import { SocialLeadsInboxPage } from './pages/SocialLeadsInboxPage';
import { WhatsAppMessagingPage } from './pages/WhatsAppMessagingPage';
import { WhatsAppTemplatesPage } from './pages/WhatsAppTemplatesPage';
import { WhatsAppHistoryPage } from './pages/WhatsAppHistoryPage';
import { ReportsPage, SettingsPage } from './pages/ReportsSettingsPage';
import { WhatsAppDashboardPage } from './pages/WhatsAppDashboardPage';
import { WhatsAppInboxPage } from './pages/WhatsAppInboxPage';
import { WhatsAppContactsPage } from './pages/WhatsAppContactsPage';
import { WhatsAppSettingsPage } from './pages/WhatsAppSettingsPage';
import { WhatsAppWebhookLogsPage } from './pages/WhatsAppWebhookLogsPage';
import { WhatsAppApiLogsPage } from './pages/WhatsAppApiLogsPage';
import { WhatsAppTestPage } from './pages/WhatsAppTestPage';
import { Tutor } from './types';

export const App: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedTutorId,
    setSelectedTutorId,
    currentUser,
    isAuthenticated
  } = useApp();

  const handleSelectTutor = (t: Tutor) => {
    setSelectedTutorId(t.id);
  };

  // 1. Unauthenticated or Login Route Guard -> Render LoginPage
  if (!isAuthenticated || activeTab === 'login') {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // 2. TUTOR PORTAL
  if (currentUser?.role === 'TUTOR') {
    const renderTutorContent = () => {
      switch (activeTab) {
        case 'tutor-dashboard':
          return <TutorDashboardPage />;
        case 'tutor-students':
          return <TutorStudentsPage />;
        case 'tutor-classes':
          return <TutorClassesPage />;
        case 'tutor-history':
          return <TutorUpdateHistoryPage />;
        case 'tutor-profile':
          return <TutorProfilePage />;
        default:
          return <TutorDashboardPage />;
      }
    };

    return (
      <TutorLayout>
        {renderTutorContent()}
        <ToastContainer />
      </TutorLayout>
    );
  }

  // 3. PARENT PORTAL
  if (currentUser?.role === 'PARENT') {
    const renderParentContent = () => {
      switch (activeTab) {
        case 'parent-dashboard':
          return <ParentDashboardPage />;
        case 'parent-student':
          return <ParentStudentProfilePage />;
        case 'parent-tutor-updates':
          return <ParentTutorUpdatesPage />;
        case 'parent-classes':
          return <ParentClassesPage />;
        default:
          return <ParentDashboardPage />;
      }
    };

    return (
      <ParentLayout>
        {renderParentContent()}
        <ToastContainer />
      </ParentLayout>
    );
  }

  // 4. ADMIN PORTAL (CRM)
  const renderAdminContent = () => {
    if (selectedTutorId) {
      return (
        <TutorDetailPage
          tutorId={selectedTutorId}
          onBack={() => setSelectedTutorId(null)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;

      case 'all-tutors':
        return <AllTutorsPage onSelectTutor={handleSelectTutor} />;

      case 'new-applications':
        return (
          <AllTutorsPage
            onSelectTutor={handleSelectTutor}
            presetStatus="NEW_APPLICATION"
            pageTitle="New Tutor Applications"
            pageSubtitle="Recently submitted applications awaiting initial review"
          />
        );

      case 'not-assigned':
        return (
          <PriorityTutorsPage
            type="NOT_ASSIGNED"
            onSelectTutor={handleSelectTutor}
          />
        );

      case 'high-priority':
        return (
          <PriorityTutorsPage
            type="HIGH_PRIORITY"
            onSelectTutor={handleSelectTutor}
          />
        );

      case 'medium-priority':
        return (
          <PriorityTutorsPage
            type="MEDIUM_PRIORITY"
            onSelectTutor={handleSelectTutor}
          />
        );

      case 'low-priority':
        return (
          <PriorityTutorsPage
            type="LOW_PRIORITY"
            onSelectTutor={handleSelectTutor}
          />
        );

      case 'validate-tutor':
      case 'validate-tutors':
      case 'validated-tutors':
        return <ValidatedTutorsPage onSelectTutor={handleSelectTutor} />;

      case 'appointed-tutors':
        return <AppointedTutorsPage onSelectTutor={handleSelectTutor} />;

      case 'admin-tutor-updates':
        return <AdminTutorUpdatesPage />;

      case 'communication-all':
        return <SocialLeadsInboxPage initialSource="ALL" />;

      case 'communication-whatsapp':
        return <SocialLeadsInboxPage initialSource="WHATSAPP" />;

      case 'communication-facebook':
        return <SocialLeadsInboxPage initialSource="FACEBOOK" />;

      case 'communication-instagram':
        return <SocialLeadsInboxPage initialSource="INSTAGRAM" />;

      case 'whatsapp':
        return <WhatsAppDashboardPage />;

      case 'whatsapp-inbox':
        return <WhatsAppInboxPage />;

      case 'whatsapp-contacts':
        return <WhatsAppContactsPage />;

      case 'whatsapp-settings':
        return <WhatsAppSettingsPage />;

      case 'whatsapp-webhook-logs':
        return <WhatsAppWebhookLogsPage />;

      case 'whatsapp-api-logs':
        return <WhatsAppApiLogsPage />;

      case 'whatsapp-test':
        return <WhatsAppTestPage />;

      case 'whatsapp-messaging':
        return <WhatsAppMessagingPage />;

      case 'whatsapp-templates':
        return <WhatsAppTemplatesPage onUseTemplate={() => setActiveTab('whatsapp-messaging')} />;

      case 'whatsapp-history':
        return <WhatsAppHistoryPage />;

      case 'recruitment-doc-verification':
        return <DocumentVerificationPage onSelectTutor={handleSelectTutor} />;

      case 'recruitment-interview':
        return <InterviewProcessPage onSelectTutor={handleSelectTutor} />;

      case 'recruitment-demo':
        return <DemoClassesPage onSelectTutor={handleSelectTutor} />;

      case 'recruitment-parent-approval':
        return <ParentApprovalPage onSelectTutor={handleSelectTutor} />;

      case 'students-all':
        return <StudentsPage />;

      case 'student-requirements':
        return <StudentsPage requirementsOnly />;

      case 'parents-all':
        return <ParentsPage />;

      case 'import-tutors':
        return <ExcelImportPage initialTab="teachers" />;

      case 'import-students':
        return <ExcelImportPage initialTab="students" />;

      case 'import-parents':
        return <ExcelImportPage initialTab="parents" />;

      case 'tutor-matching':
        return <TutorMatchingPage onSelectTutor={handleSelectTutor} />;

      case 'reports':
        return <ReportsPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Left Sidebar */}
      <Sidebar />

      {/* Main Admin App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderAdminContent()}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default App;
